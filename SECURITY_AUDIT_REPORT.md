# DealChain Smart Contract Security Audit Report

**Audit Date**: 2025-10-15
**Auditor**: White Hacker Security Team
**Contract Version**: 1.0.0
**Framework**: Anchor 0.29.0
**Blockchain**: Solana

---

## Executive Summary

**Overall Security Rating**: ⚠️ **MEDIUM-HIGH RISK** (5.5/10)

The DealChain smart contract implements a coupon marketplace system with several good security practices, but contains **CRITICAL and HIGH severity vulnerabilities** that must be addressed before mainnet deployment.

### Quick Stats
- **Total Issues Found**: 12
- **Critical Severity**: 2 🔴
- **High Severity**: 3 🟠
- **Medium Severity**: 4 🟡
- **Low Severity**: 3 🟢

---

## Vulnerability Details

### 🔴 CRITICAL SEVERITY

#### **C-1: Missing Reentrancy Protection in purchase_coupon()**

**Location**: `lib.rs:102-141`

**Description**:
The `purchase_coupon` function performs external calls (token transfer) and then updates state variables (`coupon.total_purchases`, `merchant.total_revenue`). This creates a reentrancy vulnerability window.

```rust
// VULNERABLE CODE (lines 118-128)
let cpi_accounts = Transfer { ... };
token::transfer(cpi_ctx, coupon.price)?;  // External call

coupon.total_purchases += 1;              // State update AFTER external call
merchant.total_revenue += coupon.price;   // State update AFTER external call
```

**Attack Scenario**:
1. Attacker creates malicious token account with fallback function
2. During `token::transfer`, fallback triggers reentrant call
3. Counter check at line 113 passes again (state not yet updated)
4. Multiple purchases at single coupon's expense

**Impact**: HIGH - Loss of funds, duplicate NFT minting

**Recommendation**:
```rust
// FIX: Use Checks-Effects-Interactions pattern
pub fn purchase_coupon(ctx: Context<PurchaseCoupon>) -> Result<()> {
    let coupon = &mut ctx.accounts.coupon;
    let merchant = &mut ctx.accounts.merchant;
    let clock = Clock::get()?;

    // CHECKS
    require!(coupon.is_active, ErrorCode::CouponInactive);
    require!(clock.unix_timestamp < coupon.expiry_timestamp, ErrorCode::CouponExpired);
    require!(coupon.total_purchases < coupon.max_redemptions, ErrorCode::SoldOut);

    // EFFECTS - Update state BEFORE external calls
    let price = coupon.price;
    coupon.total_purchases += 1;
    merchant.total_revenue += price;

    // INTERACTIONS - External calls last
    let cpi_accounts = Transfer {
        from: ctx.accounts.buyer_token_account.to_account_info(),
        to: ctx.accounts.merchant_token_account.to_account_info(),
        authority: ctx.accounts.buyer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, price)?;

    emit!(CouponPurchased { ... });
    Ok(())
}
```

---

#### **C-2: No Duplicate Redemption Prevention**

**Location**: `lib.rs:144-176`

**Description**:
The `redeem_coupon` function only checks if the user owns the NFT but does NOT track which specific users have already redeemed. A user could redeem the same NFT multiple times.

```rust
// VULNERABLE CODE
pub fn redeem_coupon(ctx: Context<RedeemCoupon>) -> Result<()> {
    // ... checks ...

    coupon.current_redemptions += 1;  // Counter incremented
    // ❌ NO CHECK: Has THIS user already redeemed THIS coupon?

    emit!(CouponRedeemed { ... });
    Ok(())
}
```

**Attack Scenario**:
1. User purchases coupon NFT
2. Redeems at merchant location
3. NFT still in wallet (not burned)
4. User redeems again and again until `current_redemptions == max_redemptions`
5. Merchant loses money/inventory

**Impact**: CRITICAL - Unlimited redemptions, merchant fraud

**Recommendation**:
```rust
// FIX 1: Add redemption tracking to Coupon struct
#[account]
#[derive(InitSpace)]
pub struct Coupon {
    // ... existing fields ...
    #[max_len(1000)]  // Adjust based on expected redemptions
    pub redeemed_by: Vec<Pubkey>,  // Track who redeemed
}

// FIX 2: Check in redeem_coupon
pub fn redeem_coupon(ctx: Context<RedeemCoupon>) -> Result<()> {
    let coupon = &mut ctx.accounts.coupon;
    let user_key = ctx.accounts.user.key();

    // Prevent duplicate redemptions
    require!(
        !coupon.redeemed_by.contains(&user_key),
        ErrorCode::AlreadyRedeemed
    );

    // ... other checks ...

    coupon.current_redemptions += 1;
    coupon.redeemed_by.push(user_key);  // Track redemption

    // BONUS: Burn or lock the NFT
    // token::burn(...)?;

    Ok(())
}

// FIX 3: Add error code
#[error_code]
pub enum ErrorCode {
    // ... existing errors ...
    #[msg("User has already redeemed this coupon")]
    AlreadyRedeemed,
}
```

**Alternative Approach** (Better for large-scale):
Use a separate `Redemption` PDA account per user/coupon pair:

```rust
#[derive(Accounts)]
pub struct RedeemCoupon<'info> {
    // ... existing accounts ...

    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8,  // discriminator + timestamp + bump
        seeds = [b"redemption", coupon.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub redemption_record: Account<'info, RedemptionRecord>,
}

#[account]
pub struct RedemptionRecord {
    pub timestamp: i64,
    pub bump: u8,
}
```

---

### 🟠 HIGH SEVERITY

#### **H-1: Integer Overflow Risk in Merchant Revenue**

**Location**: `lib.rs:128`, `lib.rs:260`

**Description**:
The `merchant.total_revenue` (u64) and `badge.total_saved` (u64) can overflow if sufficient transactions occur. While Rust has overflow checks in debug mode, Anchor's release profile may optimize them away.

```rust
merchant.total_revenue += coupon.price;  // Can overflow u64
```

**Attack Scenario**:
1. Attacker creates millions of micro-transactions
2. `total_revenue` wraps around to 0
3. Merchant analytics corrupted
4. Potential tax/accounting issues

**Recommendation**:
```rust
use std::num::Saturating;

// Use checked arithmetic
merchant.total_revenue = merchant.total_revenue
    .checked_add(coupon.price)
    .ok_or(ErrorCode::ArithmeticOverflow)?;

// Or use saturating add (caps at u64::MAX)
merchant.total_revenue = merchant.total_revenue.saturating_add(coupon.price);
```

---

#### **H-2: No Access Control on update_loyalty_badge()**

**Location**: `lib.rs:251-278`, `lib.rs:460-470`

**Description**:
The `UpdateLoyaltyBadge` context only requires that the signer matches the badge owner, but does NOT verify WHO is calling this function or if the purchase actually happened.

```rust
#[derive(Accounts)]
pub struct UpdateLoyaltyBadge<'info> {
    #[account(
        mut,
        seeds = [b"loyalty", user.key().as_ref()],
        bump = loyalty_badge.bump
    )]
    pub loyalty_badge: Account<'info, LoyaltyBadge>,

    pub user: Signer<'info>,  // ❌ User can call this themselves!
}

pub fn update_loyalty_badge(
    ctx: Context<UpdateLoyaltyBadge>,
    purchase_amount: u64,     // ❌ User-supplied, not verified!
    savings_amount: u64,      // ❌ User-supplied, not verified!
) -> Result<()> {
    let badge = &mut ctx.accounts.loyalty_badge;
    badge.deals_purchased += 1;
    badge.total_saved += savings_amount;
    badge.points += (purchase_amount / 1_000_000) as u32;
    // ...
}
```

**Attack Scenario**:
1. Attacker calls `update_loyalty_badge` directly
2. Passes `purchase_amount = u64::MAX`
3. Instantly becomes Platinum tier
4. Gains access to exclusive perks/deals

**Impact**: HIGH - Loyalty system bypass, unfair advantages

**Recommendation**:
```rust
// OPTION 1: Only allow program to update (via CPI)
// Call update_loyalty_badge internally from purchase_coupon

pub fn purchase_coupon(ctx: Context<PurchaseCoupon>) -> Result<()> {
    // ... existing logic ...

    // Update loyalty automatically (internal call)
    if let Some(badge) = &mut ctx.accounts.loyalty_badge {
        badge.deals_purchased += 1;
        badge.total_saved += calculate_savings(&coupon);
        badge.points += (coupon.price / 1_000_000) as u32;
        update_tier(badge);
    }

    Ok(())
}

// OPTION 2: Require coupon account validation
#[derive(Accounts)]
pub struct UpdateLoyaltyBadge<'info> {
    // ... existing accounts ...

    /// Proof that user actually purchased this coupon
    #[account(
        constraint = coupon.mint == recent_purchase.mint,
        constraint = recent_purchase.owner == user.key()
    )]
    pub recent_purchase: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"coupon", coupon.mint.as_ref()],
        bump = coupon.bump
    )]
    pub coupon: Account<'info, Coupon>,
}
```

---

#### **H-3: Review Spam / Sybil Attack**

**Location**: `lib.rs:179-210`, `lib.rs:395-422`

**Description**:
A single user can only submit ONE review per coupon (due to PDA seeds), but an attacker with multiple wallets can spam fake reviews to manipulate merchant ratings.

```rust
seeds = [b"review", coupon.key().as_ref(), user.key().as_ref()]
```

**Attack Scenarios**:
1. **Rating Manipulation**: Competitor creates 100 wallets, leaves 1-star reviews
2. **Fake Reputation**: Merchant creates 100 wallets, leaves 5-star reviews
3. **DoS via Storage**: Attacker creates millions of review accounts

**Impact**: HIGH - Trust system compromise, merchant reputation fraud

**Recommendation**:
```rust
// FIX 1: Only allow verified purchasers to review
#[derive(Accounts)]
pub struct SubmitReview<'info> {
    // ... existing accounts ...

    /// Proof user owns/owned the coupon NFT
    #[account(
        constraint = user_token_account.mint == coupon.mint,
        constraint = user_token_account.owner == user.key() ||
                     was_previous_owner(&user_token_account, user.key())
    )]
    pub user_token_account: Account<'info, TokenAccount>,
}

pub fn submit_review(
    ctx: Context<SubmitReview>,
    rating: u8,
    comment: String,
) -> Result<()> {
    // Verify user actually purchased (not just viewing)
    require!(
        ctx.accounts.user_token_account.amount >= 1,
        ErrorCode::MustOwnCouponToReview
    );

    // ... rest of logic ...
}

// FIX 2: Add review cost (anti-spam)
#[derive(Accounts)]
pub struct SubmitReview<'info> {
    // ... existing ...

    /// Optional: Require small SOL deposit
    #[account(
        mut,
        constraint = review_deposit.lamports() >= 1_000_000  // 0.001 SOL
    )]
    pub review_deposit: SystemAccount<'info>,
}

// FIX 3: Weighted ratings (more purchases = more weight)
impl Merchant {
    pub fn calculate_weighted_rating(&self) -> f64 {
        // Weight reviews by reviewer's purchase history
        // (requires tracking reviewer metrics)
    }
}
```

---

### 🟡 MEDIUM SEVERITY

#### **M-1: Missing Freeze Authority Check**

**Location**: `lib.rs:320`, `lib.rs:361`

**Description**:
The contract accepts any `Mint` account without verifying its freeze authority. A malicious merchant could use a mint where they control freeze authority, then freeze NFTs after sale.

**Recommendation**:
```rust
#[derive(Accounts)]
pub struct CreateCoupon<'info> {
    // ... existing ...

    #[account(
        constraint = mint.freeze_authority.is_none() @ ErrorCode::MintMustNotHaveFreezeAuthority
    )]
    pub mint: Account<'info, Mint>,
}
```

---

#### **M-2: Unvalidated Price Change**

**Location**: `lib.rs:46-99`

**Description**:
A merchant could create a coupon with `price = 0` or `price = u64::MAX`, breaking economic logic.

**Recommendation**:
```rust
const MIN_PRICE: u64 = 1_000;      // 0.001 USDC
const MAX_PRICE: u64 = 1_000_000_000_000;  // 1M USDC

require!(
    price >= MIN_PRICE && price <= MAX_PRICE,
    ErrorCode::InvalidPrice
);
```

---

#### **M-3: Expiry Timestamp Manipulation**

**Location**: `lib.rs:59-61`

**Description**:
Merchant could set `expiry_timestamp` to far future (year 2500) or very near (5 seconds), creating UX issues.

**Recommendation**:
```rust
const MIN_EXPIRY_DURATION: i64 = 3600;         // 1 hour
const MAX_EXPIRY_DURATION: i64 = 31536000;     // 1 year

let current_time = Clock::get()?.unix_timestamp;
require!(
    expiry_timestamp > current_time + MIN_EXPIRY_DURATION,
    ErrorCode::ExpiryTooSoon
);
require!(
    expiry_timestamp < current_time + MAX_EXPIRY_DURATION,
    ErrorCode::ExpiryTooFar
);
```

---

#### **M-4: Race Condition in Coupon Purchase**

**Location**: `lib.rs:112-115`

**Description**:
Multiple users could submit transactions simultaneously when `total_purchases == max_redemptions - 1`. Some transactions will fail, but users have already paid gas.

**Impact**: Poor UX, wasted transaction fees

**Recommendation**:
```rust
// Add optimistic concurrency check
#[derive(Accounts)]
pub struct PurchaseCoupon<'info> {
    // ... existing ...

    #[account(
        mut,
        constraint = coupon.total_purchases < coupon.max_redemptions @ ErrorCode::SoldOut
    )]
    pub coupon: Account<'info, Coupon>,
}

// Frontend should implement optimistic locking:
// 1. Fetch latest coupon.total_purchases
// 2. Show "1 remaining" warning
// 3. Use recent blockhash for quick failure
```

---

### 🟢 LOW SEVERITY

#### **L-1: Missing Event Fields**

Events don't include enough context for off-chain indexers. Add `category`, `price`, `merchant_name` to events.

#### **L-2: No Emergency Pause Mechanism**

No way to globally pause the contract in case of exploit discovery. Add admin-controlled pause.

#### **L-3: String Encoding Not Validated**

UTF-8 strings (`name`, `description`, `comment`) not validated. Could contain invalid UTF-8 or control characters.

---

## Gas Optimization Issues

### **G-1: Unnecessary String Clones**

```rust
// Line 38 & 94: Unnecessary clone
emit!(MerchantInitialized {
    name: merchant.name.clone(),  // EXPENSIVE: String clone in event
});
```

**Fix**: Events are serialized anyway, no need to clone:
```rust
emit!(MerchantInitialized {
    name: merchant.name,  // Move instead of clone
});
```

### **G-2: Inefficient Vector Storage**

`Coupon.redeemed_by: Vec<Pubkey>` (if implemented) would grow unbounded. Use Merkle tree or bitmap instead.

---

## Architecture Recommendations

### **A-1: Implement NFT Burning on Redemption**

Currently, redeemed NFTs remain in user wallets. Best practice:

```rust
use anchor_spl::token::Burn;

pub fn redeem_coupon(ctx: Context<RedeemCoupon>) -> Result<()> {
    // ... existing checks ...

    // Burn the NFT after redemption
    let burn_accounts = Burn {
        mint: ctx.accounts.mint.to_account_info(),
        from: ctx.accounts.user_nft_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::burn(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_accounts),
        1
    )?;

    Ok(())
}
```

### **A-2: Add Metaplex Integration**

Current code has placeholder comment (line 130). Implement actual Metaplex NFT minting:

```rust
use mpl_token_metadata::{
    instruction::create_metadata_accounts_v3,
    state::DataV2,
};

pub fn purchase_coupon(ctx: Context<PurchaseCoupon>) -> Result<()> {
    // ... existing logic ...

    // Create Metaplex metadata
    let metadata_account = create_metadata_accounts_v3(
        ctx.accounts.metadata_program.key(),
        ctx.accounts.metadata.key(),
        ctx.accounts.mint.key(),
        // ... metadata fields ...
    );

    Ok(())
}
```

### **A-3: Implement Close Instructions**

Missing `close_merchant()`, `close_coupon()` to reclaim rent. Add:

```rust
pub fn close_expired_coupon(ctx: Context<CloseCoupon>) -> Result<()> {
    let coupon = &ctx.accounts.coupon;
    let clock = Clock::get()?;

    require!(
        clock.unix_timestamp > coupon.expiry_timestamp + 86400, // 24h grace period
        ErrorCode::CouponNotExpired
    );

    // Rent is automatically returned to merchant via close constraint
    Ok(())
}

#[derive(Accounts)]
pub struct CloseCoupon<'info> {
    #[account(
        mut,
        close = merchant_authority,
        seeds = [b"coupon", coupon.mint.as_ref()],
        bump = coupon.bump,
        constraint = coupon.merchant == merchant.key()
    )]
    pub coupon: Account<'info, Coupon>,

    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    pub merchant: Account<'info, Merchant>,
}
```

---

## Testing Recommendations

### **Critical Tests Missing**

1. **Reentrancy Test**: Simulate malicious token with callback
2. **Duplicate Redemption Test**: Verify same user can't redeem twice
3. **Overflow Test**: Test u64 limits on revenue/points
4. **Sybil Attack Test**: Verify review spam prevention
5. **Concurrent Purchase Test**: 10 users buy last coupon simultaneously

### **Suggested Test Structure**

```typescript
// tests/dealchain.ts
describe("Security Tests", () => {
  describe("Reentrancy Protection", () => {
    it("prevents reentrant purchase", async () => {
      // Deploy malicious token with callback
      // Attempt reentrant purchase
      // Verify state consistency
    });
  });

  describe("Duplicate Redemption Prevention", () => {
    it("blocks second redemption by same user", async () => {
      await program.methods.redeemCoupon().rpc();

      try {
        await program.methods.redeemCoupon().rpc();
        assert.fail("Should have thrown AlreadyRedeemed");
      } catch (err) {
        assert.equal(err.code, "AlreadyRedeemed");
      }
    });
  });

  describe("Integer Overflow", () => {
    it("handles max revenue gracefully", async () => {
      // Create coupon with price = u64::MAX / 2
      // Purchase twice
      // Verify no overflow
    });
  });
});
```

---

## Compliance & Legal Considerations

### **KYC/AML Requirements**

For merchants handling real-world value:
- Implement merchant verification system
- Store encrypted KYC data off-chain
- Add compliance flags to Merchant struct

### **Refund Mechanism**

No way for users to get refunds if merchant goes out of business:
- Add escrow period (funds locked for 7 days)
- Implement dispute resolution
- Add merchant bond requirements

---

## Summary of Required Fixes (Priority Order)

### **Before Devnet Testing**
1. ✅ Fix C-2: Add duplicate redemption prevention
2. ✅ Fix C-1: Implement CEI pattern for purchase
3. ✅ Fix H-2: Secure loyalty badge updates
4. ✅ Fix H-1: Add overflow protection

### **Before Mainnet**
5. ✅ Fix H-3: Implement review verification
6. ✅ Fix M-1: Add freeze authority check
7. ✅ Fix M-2 & M-3: Add price/time constraints
8. ✅ Implement A-1: NFT burning on redemption
9. ✅ Implement A-2: Full Metaplex integration
10. ✅ Add comprehensive test suite

### **Post-Launch Enhancements**
11. Add emergency pause mechanism
12. Implement close instructions for rent reclamation
13. Add weighted review system
14. Implement escrow/refund system

---

## Final Recommendations

### **DO NOT DEPLOY TO MAINNET** until:
- [ ] All CRITICAL and HIGH issues are resolved
- [ ] Professional third-party audit completed
- [ ] Comprehensive test suite with 90%+ coverage
- [ ] Bug bounty program launched
- [ ] Emergency response plan documented

### **Estimated Fix Timeline**
- Critical fixes: 2-3 days
- High priority fixes: 3-4 days
- Testing & validation: 3-5 days
- **Total**: ~10-12 days development time

### **Audit Cost Estimate** (Professional)
- Internal review: COMPLETED (this report)
- Community audit: $5k-10k
- Professional audit (Kudelski, OtterSec, etc.): $15k-40k

---

## Auditor Notes

This contract shows good understanding of Anchor framework and implements many security best practices (PDA usage, constraint checks, events). However, the critical issues around reentrancy and duplicate redemption MUST be addressed before any production use.

The architecture is solid and the codebase is clean, making fixes straightforward to implement.

**Recommended Next Steps**:
1. Implement all C-* and H-* fixes
2. Add comprehensive tests
3. Deploy to devnet with test scenarios
4. Conduct community bug bounty on devnet
5. Schedule professional audit
6. Gradual mainnet rollout with monitoring

---

**Report Generated**: 2025-10-15
**Audit Methodology**: Manual code review, threat modeling, attack simulation
**Tools Used**: Static analysis, Anchor framework analysis, Solana validator testing

For questions or clarifications, contact: security@dealchain.app

---

## Appendix: Secure Code Examples

See `SECURITY_FIXES.md` for complete fixed implementations of all vulnerable functions.

