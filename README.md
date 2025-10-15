# DealChain - Web3 Discount Marketplace

![DealChain Banner](https://via.placeholder.com/1200x300/8b5cf6/ffffff?text=DealChain+-+NFT+Coupons+on+Solana)

> **Transforming discounts into tradeable digital assets on Solana blockchain**

A decentralized coupon marketplace where every promotion is an NFT - verifiable, transferable, and user-owned. Built for the Cypherpunk Hackathon (MonkeDAO Grant).

---

## Features

- **NFT Coupons**: Each deal is a unique, transferable NFT with real-world utility
- **Merchant Dashboard**: Create and manage promotional campaigns with ease
- **Marketplace**: Browse, purchase, and resell discount NFTs
- **QR Redemption**: Secure on-chain verification system
- **Social Layer**: Reviews, ratings, and community-driven discovery
- **Loyalty Badges**: NFT-based reputation system with exclusive perks
- **Multi-Category**: Travel, Food, Shopping, Entertainment, and more

---

## Tech Stack

### Blockchain
- **Solana** - Fast, low-cost blockchain
- **Anchor 0.29.0** - Rust-based smart contract framework
- **Metaplex Token Metadata** - NFT standard implementation
- **SPL Token** - Token program for transactions

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Solana Wallet Adapter** - Multi-wallet support

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### Backend
- **Node.js + Express** - REST API
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Redis** - Caching and rate limiting
- **Bull** - Job queue for async tasks

### Storage & APIs
- **IPFS (Pinata)** - Decentralized metadata storage
- **Cloudinary** - Image optimization
- **Skyscanner API** - Flight deals aggregation
- **Booking.com API** - Hotel deals aggregation

---

## Project Structure

```
dealchain/
├── apps/
│   ├── web/                  # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/         # App router pages
│   │   │   ├── components/   # React components
│   │   │   ├── lib/         # Utilities and helpers
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── store/       # Zustand stores
│   │   │   └── types/       # TypeScript types
│   │   ├── public/          # Static assets
│   │   └── package.json
│   │
│   └── api/                  # Express backend API
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── controllers/ # Route controllers
│       │   ├── services/    # Business logic
│       │   ├── middleware/  # Express middleware
│       │   └── prisma/      # Database schema
│       └── package.json
│
├── packages/
│   ├── anchor/              # Solana smart contracts
│   │   ├── programs/
│   │   │   └── dealchain/
│   │   │       └── src/
│   │   │           └── lib.rs  # Main program
│   │   ├── tests/          # Anchor tests
│   │   ├── Anchor.toml
│   │   └── Cargo.toml
│   │
│   ├── ui/                  # Shared UI components
│   ├── config/              # Shared configuration
│   └── types/               # Shared TypeScript types
│
├── docs/                    # Documentation
├── package.json            # Root package.json (monorepo)
├── turbo.json              # Turborepo configuration
└── README.md
```

---

## Smart Contract Architecture

### Program Instructions

1. **`initialize_merchant`** - Register a new merchant account
2. **`create_coupon`** - Mint a new coupon NFT campaign
3. **`purchase_coupon`** - Buy a coupon NFT from marketplace
4. **`redeem_coupon`** - Redeem coupon at merchant location
5. **`submit_review`** - Leave a rating/review for a coupon
6. **`update_coupon_status`** - Activate/deactivate coupons
7. **`initialize_loyalty_badge`** - Create user loyalty NFT
8. **`update_loyalty_badge`** - Update loyalty tier and points

### Account Structures

#### Merchant Account
```rust
pub struct Merchant {
    pub authority: Pubkey,
    pub name: String,              // Max 100 chars
    pub description: String,       // Max 500 chars
    pub total_coupons_created: u32,
    pub total_redemptions: u32,
    pub total_revenue: u64,
    pub rating_sum: u64,
    pub rating_count: u32,
    pub is_verified: bool,
    pub created_at: i64,
    pub bump: u8,
}
```

#### Coupon Account
```rust
pub struct Coupon {
    pub mint: Pubkey,
    pub merchant: Pubkey,
    pub discount_percent: u8,      // 0-100
    pub discount_fixed: u64,
    pub price: u64,
    pub expiry_timestamp: i64,
    pub max_redemptions: u32,
    pub current_redemptions: u32,
    pub category: CouponCategory,
    pub is_transferable: bool,
    pub is_active: bool,
    pub metadata_uri: String,      // IPFS URI
    pub created_at: i64,
    pub total_purchases: u32,
    pub bump: u8,
}
```

#### Loyalty Badge Account
```rust
pub struct LoyaltyBadge {
    pub user: Pubkey,
    pub tier: LoyaltyTier,         // Bronze, Silver, Gold, Platinum
    pub deals_purchased: u32,
    pub total_saved: u64,
    pub points: u32,
    pub created_at: i64,
    pub bump: u8,
}
```

### Security Features

- **PDA (Program Derived Addresses)** for deterministic account generation
- **Ownership validation** before redemption
- **Expiry checks** to prevent expired coupon usage
- **Supply limits** to prevent over-redemption
- **Authority constraints** for merchant-only actions
- **Overflow checks** in release mode

---

## Installation & Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# Rust & Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# pnpm (recommended for monorepo)
npm install -g pnpm
```

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/dealchain.git
cd dealchain

# Install dependencies
pnpm install

# Generate Solana keypair (if needed)
solana-keygen new -o ~/.config/solana/id.json

# Setup environment variables
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
# Edit .env files with your configuration
```

### Environment Variables

#### Frontend (`apps/web/.env`)
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=DChain11111111111111111111111111111111111111
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Backend (`apps/api/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dealchain
REDIS_URL=redis://localhost:6379
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret
SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## Development

### Build Smart Contracts

```bash
# Build Anchor program
cd packages/anchor
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test
```

### Run Frontend

```bash
# From root directory
pnpm dev

# Or specifically run web app
cd apps/web
pnpm dev
```

Visit `http://localhost:3000`

### Run Backend API

```bash
# From root directory
cd apps/api
pnpm dev
```

API available at `http://localhost:4000`

### Run All in Parallel

```bash
# From root (uses Turborepo)
pnpm dev
```

---

## Usage Guide

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your Solana wallet (Phantom, Solflare, etc.)

2. **Browse Deals**
   - Navigate to Marketplace
   - Filter by category, price, location
   - Search for specific deals

3. **Purchase Coupon**
   - Click on a deal card
   - Review details and click "Buy Now"
   - Approve transaction in wallet
   - NFT minted to your wallet

4. **Redeem Coupon**
   - Go to "My Coupons" in profile
   - Select coupon to redeem
   - Generate QR code
   - Show QR to merchant for scanning

### For Merchants

1. **Register as Merchant**
   - Go to Merchant Dashboard
   - Click "Become a Merchant"
   - Fill in business details
   - Submit on-chain

2. **Create Deal**
   - Navigate to "Create Deal"
   - Upload deal image
   - Set discount, price, expiry, quantity
   - Select category
   - Mint NFT coupons

3. **Manage Deals**
   - View all active deals
   - Pause/activate deals
   - View analytics (sales, redemptions)

4. **Verify Redemptions**
   - Open QR scanner
   - Scan customer's coupon QR
   - Verify on-chain ownership
   - Approve redemption

---

## API Endpoints

### Deals
- `GET /api/deals` - List all deals
- `GET /api/deals/:id` - Get deal details
- `POST /api/deals` - Create new deal (merchant only)
- `PATCH /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Users
- `GET /api/users/:wallet` - Get user profile
- `GET /api/users/:wallet/coupons` - Get user's coupons
- `POST /api/users/:wallet/loyalty` - Initialize loyalty badge

### Merchants
- `GET /api/merchants` - List all merchants
- `GET /api/merchants/:id` - Get merchant details
- `POST /api/merchants` - Register merchant
- `GET /api/merchants/:id/analytics` - Get merchant analytics

### Redemptions
- `POST /api/redemptions/verify` - Verify QR code
- `POST /api/redemptions/redeem` - Submit redemption on-chain

---

## Testing

### Smart Contract Tests

```bash
cd packages/anchor
anchor test
```

### Frontend Tests

```bash
cd apps/web
pnpm test
```

### E2E Tests

```bash
# Run Cypress E2E tests
pnpm test:e2e
```

---

## Deployment

### Deploy Smart Contract

```bash
# Build for production
cd packages/anchor
anchor build --verifiable

# Deploy to mainnet-beta
anchor deploy --provider.cluster mainnet

# Update program ID in frontend
# Copy new program ID to apps/web/.env
```

### Deploy Frontend (Vercel)

```bash
# Link to Vercel
cd apps/web
vercel link

# Deploy to production
vercel --prod
```

### Deploy Backend (Railway)

```bash
# Initialize Railway project
cd apps/api
railway init

# Deploy
railway up
```

---

## Roadmap

### Phase 1: MVP (Hackathon)
- [x] Smart contract core functionality
- [x] Basic UI/UX
- [x] Merchant dashboard
- [x] User marketplace
- [x] QR redemption flow
- [ ] 1 external API integration

### Phase 2: Post-Hackathon
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Fiat payment integration
- [ ] More API integrations
- [ ] Multi-language support

### Phase 3: Growth
- [ ] White-label solution for businesses
- [ ] Group buying features
- [ ] Subscription model
- [ ] Cross-chain expansion
- [ ] DeFi integrations (staking, yield)

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## Security

### Audit Status
- [ ] Internal code review
- [ ] Community audit
- [ ] Professional third-party audit

### Reporting Vulnerabilities

Please report security vulnerabilities to security@dealchain.app

**Do not create public issues for security vulnerabilities.**

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Team

- **Lead Developer** - Blockchain Architecture
- **Frontend Developer** - UI/UX Implementation
- **Full-Stack Developer** - Backend & Integration

---

## Acknowledgments

- **MonkeDAO** for the grant opportunity
- **Solana Foundation** for the incredible ecosystem
- **Anchor Framework** for making Solana development accessible
- **Metaplex** for NFT standards
- **shadcn/ui** for beautiful components

---

## Links

- **Website**: https://dealchain.app
- **Documentation**: https://docs.dealchain.app
- **Twitter**: [@DealChainHQ](https://twitter.com/DealChainHQ)
- **Discord**: https://discord.gg/dealchain
- **GitHub**: https://github.com/dealchain/dealchain

---

## Support

Need help? Reach out:

- **Email**: support@dealchain.app
- **Discord**: Join our community server
- **GitHub Issues**: Open an issue for bugs/features

---

Built with 💜 on Solana | Powered by MonkeDAO

