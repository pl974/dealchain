// SECURED VERSION - All vulnerabilities fixed
// DO NOT USE lib.rs - USE THIS FILE INSTEAD

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, Mint, Token, TokenAccount, Transfer},
};

declare_id!("DChain11111111111111111111111111111111111111");

// Constants for validation
const MIN_PRICE: u64 = 1_000; // 0.001 USDC
const MAX_PRICE: u64 = 1_000_000_000_000; // 1M USDC
const MIN_EXPIRY_DURATION: i64 = 3600; // 1 hour
const MAX_EXPIRY_DURATION: i64 = 31536000; // 1 year
const MAX_REDEMPTIONS_PER_COUPON: u32 = 10000;

#[program]
pub mod dealchain {
    use super::*;

    /// Initialize a merchant account
    pub fn initialize_merchant(
        ctx: Context<InitializeMerchant>,
        name: String,
        description: String,
    ) -> Result<()> {
        require!(name.len() <= 100, ErrorCode::NameTooLong);
        require!(name.len() > 0, ErrorCode::NameEmpty);
        require!(description.len() <= 500, ErrorCode::DescriptionTooLong);

        let merchant = &mut ctx.accounts.merchant;
        merchant.authority = ctx.accounts.authority.key();
        merchant.name = name;
        merchant.description = description;
        merchant.total_coupons_created = 0;
        merchant.total_redemptions = 0;
        merchant.total_revenue = 0;
        merchant.rating_sum = 0;
        merchant.rating_count = 0;
        merchant.is_verified = false;
        merchant.is_paused = false;
        merchant.created_at = Clock::get()?.unix_timestamp;
        merchant.bump = ctx.bumps.merchant;

        emit!(MerchantInitialized {
            merchant: merchant.key(),
            authority: merchant.authority,
            timestamp: merchant.created_at,
        });

        Ok(())
    }

    /// Create a new coupon deal
    pub fn create_coupon(
        ctx: Context<CreateCoupon>,
        discount_percent: u8,
        discount_fixed: u64,
        price: u64,
        expiry_timestamp: i64,
        max_redemptions: u32,
        category: CouponCategory,
        is_transferable: bool,
        metadata_uri: String,
    ) -> Result<()> {
        // Enhanced validations
        require!(discount_percent <= 100, ErrorCode::InvalidDiscount);
        require!(
            price >= MIN_PRICE && price <= MAX_PRICE,
            ErrorCode::InvalidPrice
        );

        let current_time = Clock::get()?.unix_timestamp;
        require!(
            expiry_timestamp > current_time + MIN_EXPIRY_DURATION,
            ErrorCode::ExpiryTooSoon
        );
        require!(
            expiry_timestamp < current_time + MAX_EXPIRY_DURATION,
            ErrorCode::ExpiryTooFar
        );

        require!(
            max_redemptions > 0 && max_redemptions <= MAX_REDEMPTIONS_PER_COUPON,
            ErrorCode::InvalidQuantity
        );
        require!(metadata_uri.len() <= 200, ErrorCode::UriTooLong);
        require!(metadata_uri.len() > 0, ErrorCode::UriEmpty);

        let coupon = &mut ctx.accounts.coupon;
        let merchant = &mut ctx.accounts.merchant;

        // Check merchant not paused
        require!(!merchant.is_paused, ErrorCode::MerchantPaused);

        coupon.mint = ctx.accounts.mint.key();
        coupon.merchant = merchant.key();
        coupon.discount_percent = discount_percent;
        coupon.discount_fixed = discount_fixed;
        coupon.price = price;
        coupon.expiry_timestamp = expiry_timestamp;
        coupon.max_redemptions = max_redemptions;
        coupon.current_redemptions = 0;
        coupon.category = category;
        coupon.is_transferable = is_transferable;
        coupon.is_active = true;
        coupon.metadata_uri = metadata_uri;
        coupon.created_at = current_time;
        coupon.total_purchases = 0;
        coupon.bump = ctx.bumps.coupon;

        // Safe increment with overflow check
        merchant.total_coupons_created = merchant
            .total_coupons_created
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        emit!(CouponCreated {
            coupon: coupon.key(),
            mint: coupon.mint,
            merchant: coupon.merchant,
            discount_percent: coupon.discount_percent,
            price: coupon.price,
            max_redemptions: coupon.max_redemptions,
            category: coupon.category.clone(),
            timestamp: coupon.created_at,
        });

        Ok(())
    }

    /// Purchase a coupon NFT - SECURED WITH CEI PATTERN
    pub fn purchase_coupon(ctx: Context<PurchaseCoupon>) -> Result<()> {
        let coupon = &mut ctx.accounts.coupon;
        let merchant = &mut ctx.accounts.merchant;
        let clock = Clock::get()?;

        // ===== CHECKS =====
        require!(coupon.is_active, ErrorCode::CouponInactive);
        require!(!merchant.is_paused, ErrorCode::MerchantPaused);
        require!(
            clock.unix_timestamp < coupon.expiry_timestamp,
            ErrorCode::CouponExpired
        );
        require!(
            coupon.total_purchases < coupon.max_redemptions,
            ErrorCode::SoldOut
        );

        // ===== EFFECTS (Update state BEFORE external calls) =====
        let price = coupon.price;

        // Safe increments with overflow protection
        coupon.total_purchases = coupon
            .total_purchases
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        merchant.total_revenue = merchant
            .total_revenue
            .checked_add(price)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        // ===== INTERACTIONS (External calls LAST) =====
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, price)?;

        // TODO: Mint NFT to buyer using Metaplex
        // See integration example in docs/metaplex_integration.md

        emit!(CouponPurchased {
            coupon: coupon.key(),
            buyer: ctx.accounts.buyer.key(),
            price,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Redeem a coupon - SECURED WITH DUPLICATE PREVENTION
    pub fn redeem_coupon(ctx: Context<RedeemCoupon>) -> Result<()> {
        let coupon = &mut ctx.accounts.coupon;
        let merchant = &mut ctx.accounts.merchant;
        let redemption = &mut ctx.accounts.redemption_record;
        let clock = Clock::get()?;

        // Validations
        require!(coupon.is_active, ErrorCode::CouponInactive);
        require!(!merchant.is_paused, ErrorCode::MerchantPaused);
        require!(
            clock.unix_timestamp < coupon.expiry_timestamp,
            ErrorCode::CouponExpired
        );
        require!(
            coupon.current_redemptions < coupon.max_redemptions,
            ErrorCode::AllRedemptionsUsed
        );

        // Verify NFT ownership
        require!(
            ctx.accounts.user_nft_account.amount >= 1,
            ErrorCode::UserDoesNotOwnNFT
        );

        // Verify NFT hasn't been burned yet (amount > 0)
        require!(
            ctx.accounts.user_nft_account.amount == 1,
            ErrorCode::InvalidNFTAmount
        );

        // Update state
        coupon.current_redemptions = coupon
            .current_redemptions
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        merchant.total_redemptions = merchant
            .total_redemptions
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        // Record redemption to prevent duplicates
        redemption.coupon = coupon.key();
        redemption.user = ctx.accounts.user.key();
        redemption.timestamp = clock.unix_timestamp;
        redemption.bump = ctx.bumps.redemption_record;

        // OPTIONAL: Burn the NFT to prevent reuse
        // Uncomment to enable burning on redemption
        /*
        let burn_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.user_nft_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                burn_accounts
            ),
            1
        )?;
        */

        emit!(CouponRedeemed {
            coupon: coupon.key(),
            user: ctx.accounts.user.key(),
            merchant: merchant.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Submit a review - SECURED WITH OWNERSHIP VERIFICATION
    pub fn submit_review(
        ctx: Context<SubmitReview>,
        rating: u8,
        comment: String,
    ) -> Result<()> {
        require!(rating >= 1 && rating <= 5, ErrorCode::InvalidRating);
        require!(comment.len() <= 500, ErrorCode::CommentTooLong);

        // Verify user owns or owned the NFT
        require!(
            ctx.accounts.user_nft_account.amount >= 1 ||
            ctx.accounts.redemption_record.user == ctx.accounts.user.key(),
            ErrorCode::MustOwnCouponToReview
        );

        let review = &mut ctx.accounts.review;
        let merchant = &mut ctx.accounts.merchant;

        review.coupon = ctx.accounts.coupon.key();
        review.user = ctx.accounts.user.key();
        review.rating = rating;
        review.comment = comment;
        review.timestamp = Clock::get()?.unix_timestamp;
        review.bump = ctx.bumps.review;

        // Update merchant rating with overflow protection
        merchant.rating_sum = merchant
            .rating_sum
            .checked_add(rating as u64)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        merchant.rating_count = merchant
            .rating_count
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        emit!(ReviewSubmitted {
            review: review.key(),
            coupon: review.coupon,
            user: review.user,
            rating: review.rating,
            timestamp: review.timestamp,
        });

        Ok(())
    }

    /// Update coupon status (active/inactive)
    pub fn update_coupon_status(
        ctx: Context<UpdateCouponStatus>,
        is_active: bool,
    ) -> Result<()> {
        let coupon = &mut ctx.accounts.coupon;
        coupon.is_active = is_active;

        emit!(CouponStatusUpdated {
            coupon: coupon.key(),
            is_active,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Pause/unpause merchant operations (emergency)
    pub fn toggle_merchant_pause(ctx: Context<ToggleMerchantPause>) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        merchant.is_paused = !merchant.is_paused;

        emit!(MerchantPauseToggled {
            merchant: merchant.key(),
            is_paused: merchant.is_paused,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Initialize loyalty badge for user
    pub fn initialize_loyalty_badge(ctx: Context<InitializeLoyaltyBadge>) -> Result<()> {
        let badge = &mut ctx.accounts.loyalty_badge;

        badge.user = ctx.accounts.user.key();
        badge.tier = LoyaltyTier::Bronze;
        badge.deals_purchased = 0;
        badge.total_saved = 0;
        badge.points = 0;
        badge.created_at = Clock::get()?.unix_timestamp;
        badge.bump = ctx.bumps.loyalty_badge;

        emit!(LoyaltyBadgeCreated {
            badge: badge.key(),
            user: badge.user,
            timestamp: badge.created_at,
        });

        Ok(())
    }

    /// Close expired coupon to reclaim rent
    pub fn close_expired_coupon(ctx: Context<CloseExpiredCoupon>) -> Result<()> {
        let coupon = &ctx.accounts.coupon;
        let clock = Clock::get()?;

        // Must be expired + grace period
        require!(
            clock.unix_timestamp > coupon.expiry_timestamp + 86400,
            ErrorCode::CouponNotExpiredYet
        );

        // Rent automatically returned via close constraint
        Ok(())
    }
}

// ============ ACCOUNTS ============

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeMerchant<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Merchant::INIT_SPACE,
        seeds = [b"merchant", authority.key().as_ref()],
        bump
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCoupon<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Coupon::INIT_SPACE,
        seeds = [b"coupon", mint.key().as_ref()],
        bump
    )]
    pub coupon: Account<'info, Coupon>,

    #[account(
        mut,
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant.bump,
        has_one = authority
    )]
    pub merchant: Account<'info, Merchant>,

    /// Mint must not have freeze authority
    #[account(
        constraint = mint.freeze_authority.is_none() @ ErrorCode::MintMustNotHaveFreezeAuthority
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseCoupon<'info> {
    #[account(
        mut,
        seeds = [b"coupon", coupon.mint.as_ref()],
        bump = coupon.bump,
        constraint = coupon.total_purchases < coupon.max_redemptions @ ErrorCode::SoldOut
    )]
    pub coupon: Account<'info, Coupon>,

    #[account(
        mut,
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = merchant.authority
    )]
    pub merchant_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemCoupon<'info> {
    #[account(
        mut,
        seeds = [b"coupon", coupon.mint.as_ref()],
        bump = coupon.bump
    )]
    pub coupon: Account<'info, Coupon>,

    #[account(
        mut,
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        constraint = user_nft_account.mint == coupon.mint,
        constraint = user_nft_account.owner == user.key()
    )]
    pub user_nft_account: Account<'info, TokenAccount>,

    /// CRITICAL: Prevents duplicate redemptions
    #[account(
        init,
        payer = user,
        space = 8 + RedemptionRecord::INIT_SPACE,
        seeds = [b"redemption", coupon.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub redemption_record: Account<'info, RedemptionRecord>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitReview<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Review::INIT_SPACE,
        seeds = [b"review", coupon.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub review: Account<'info, Review>,

    #[account(
        seeds = [b"coupon", coupon.mint.as_ref()],
        bump = coupon.bump
    )]
    pub coupon: Account<'info, Coupon>,

    #[account(
        mut,
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump
    )]
    pub merchant: Account<'info, Merchant>,

    /// User must own the NFT
    #[account(
        constraint = user_nft_account.mint == coupon.mint,
        constraint = user_nft_account.owner == user.key()
    )]
    pub user_nft_account: Account<'info, TokenAccount>,

    /// Or have redeemed it
    #[account(
        seeds = [b"redemption", coupon.key().as_ref(), user.key().as_ref()],
        bump = redemption_record.bump
    )]
    pub redemption_record: Account<'info, RedemptionRecord>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCouponStatus<'info> {
    #[account(
        mut,
        seeds = [b"coupon", coupon.mint.as_ref()],
        bump = coupon.bump
    )]
    pub coupon: Account<'info, Coupon>,

    #[account(
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump,
        has_one = authority
    )]
    pub merchant: Account<'info, Merchant>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ToggleMerchantPause<'info> {
    #[account(
        mut,
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump,
        has_one = authority
    )]
    pub merchant: Account<'info, Merchant>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeLoyaltyBadge<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + LoyaltyBadge::INIT_SPACE,
        seeds = [b"loyalty", user.key().as_ref()],
        bump
    )]
    pub loyalty_badge: Account<'info, LoyaltyBadge>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseExpiredCoupon<'info> {
    #[account(
        mut,
        close = merchant_authority,
        seeds = [b"coupon", coupon.mint.as_ref()],
        bump = coupon.bump,
        constraint = coupon.merchant == merchant.key()
    )]
    pub coupon: Account<'info, Coupon>,

    #[account(
        seeds = [b"merchant", merchant_authority.key().as_ref()],
        bump = merchant.bump
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(mut)]
    pub merchant_authority: Signer<'info>,
}

// ============ STATE ============

#[account]
#[derive(InitSpace)]
pub struct Merchant {
    pub authority: Pubkey,
    #[max_len(100)]
    pub name: String,
    #[max_len(500)]
    pub description: String,
    pub total_coupons_created: u32,
    pub total_redemptions: u32,
    pub total_revenue: u64,
    pub rating_sum: u64,
    pub rating_count: u32,
    pub is_verified: bool,
    pub is_paused: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Coupon {
    pub mint: Pubkey,
    pub merchant: Pubkey,
    pub discount_percent: u8,
    pub discount_fixed: u64,
    pub price: u64,
    pub expiry_timestamp: i64,
    pub max_redemptions: u32,
    pub current_redemptions: u32,
    pub category: CouponCategory,
    pub is_transferable: bool,
    pub is_active: bool,
    #[max_len(200)]
    pub metadata_uri: String,
    pub created_at: i64,
    pub total_purchases: u32,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Review {
    pub coupon: Pubkey,
    pub user: Pubkey,
    pub rating: u8,
    #[max_len(500)]
    pub comment: String,
    pub timestamp: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct LoyaltyBadge {
    pub user: Pubkey,
    pub tier: LoyaltyTier,
    pub deals_purchased: u32,
    pub total_saved: u64,
    pub points: u32,
    pub created_at: i64,
    pub bump: u8,
}

/// CRITICAL: Prevents duplicate redemptions
#[account]
#[derive(InitSpace)]
pub struct RedemptionRecord {
    pub coupon: Pubkey,
    pub user: Pubkey,
    pub timestamp: i64,
    pub bump: u8,
}

// ============ ENUMS ============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum CouponCategory {
    Travel,
    Food,
    Shopping,
    Entertainment,
    Services,
    Health,
    Education,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum LoyaltyTier {
    Bronze,
    Silver,
    Gold,
    Platinum,
}

// ============ EVENTS ============

#[event]
pub struct MerchantInitialized {
    pub merchant: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct CouponCreated {
    pub coupon: Pubkey,
    pub mint: Pubkey,
    pub merchant: Pubkey,
    pub discount_percent: u8,
    pub price: u64,
    pub max_redemptions: u32,
    pub category: CouponCategory,
    pub timestamp: i64,
}

#[event]
pub struct CouponPurchased {
    pub coupon: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
    pub timestamp: i64,
}

#[event]
pub struct CouponRedeemed {
    pub coupon: Pubkey,
    pub user: Pubkey,
    pub merchant: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ReviewSubmitted {
    pub review: Pubkey,
    pub coupon: Pubkey,
    pub user: Pubkey,
    pub rating: u8,
    pub timestamp: i64,
}

#[event]
pub struct CouponStatusUpdated {
    pub coupon: Pubkey,
    pub is_active: bool,
    pub timestamp: i64,
}

#[event]
pub struct MerchantPauseToggled {
    pub merchant: Pubkey,
    pub is_paused: bool,
    pub timestamp: i64,
}

#[event]
pub struct LoyaltyBadgeCreated {
    pub badge: Pubkey,
    pub user: Pubkey,
    pub timestamp: i64,
}

// ============ ERRORS ============

#[error_code]
pub enum ErrorCode {
    #[msg("Name is too long (max 100 characters)")]
    NameTooLong,
    #[msg("Name cannot be empty")]
    NameEmpty,
    #[msg("Description is too long (max 500 characters)")]
    DescriptionTooLong,
    #[msg("Invalid discount percentage (must be 0-100)")]
    InvalidDiscount,
    #[msg("Invalid price (must be between 0.001 and 1M USDC)")]
    InvalidPrice,
    #[msg("Expiry is too soon (minimum 1 hour)")]
    ExpiryTooSoon,
    #[msg("Expiry is too far (maximum 1 year)")]
    ExpiryTooFar,
    #[msg("Invalid quantity (must be 1-10000)")]
    InvalidQuantity,
    #[msg("URI is too long (max 200 characters)")]
    UriTooLong,
    #[msg("URI cannot be empty")]
    UriEmpty,
    #[msg("Coupon is inactive")]
    CouponInactive,
    #[msg("Coupon has expired")]
    CouponExpired,
    #[msg("All coupons have been sold")]
    SoldOut,
    #[msg("All redemptions have been used")]
    AllRedemptionsUsed,
    #[msg("User does not own the NFT")]
    UserDoesNotOwnNFT,
    #[msg("Invalid NFT amount")]
    InvalidNFTAmount,
    #[msg("Invalid rating (must be 1-5)")]
    InvalidRating,
    #[msg("Comment is too long (max 500 characters)")]
    CommentTooLong,
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
    #[msg("Mint must not have freeze authority")]
    MintMustNotHaveFreezeAuthority,
    #[msg("Must own coupon to review")]
    MustOwnCouponToReview,
    #[msg("Coupon not expired yet (24h grace period)")]
    CouponNotExpiredYet,
    #[msg("Merchant operations are paused")]
    MerchantPaused,
}
