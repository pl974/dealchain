# 🛍️ DealChain

> **The Future of Coupons is Here** - Revolutionizing the Coupon Industry on Solana

DealChain is a Web3 discount marketplace where coupons become tradable NFTs. Built on Solana for lightning-fast transactions, true ownership, and zero platform fees.

[![Built with Solana](https://img.shields.io/badge/Built%20with-Solana-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Features

### For Users
- 🎫 **NFT Coupons** - Your deals are true assets you own and control
- ⚡ **Instant Transactions** - Powered by Solana's high-performance blockchain
- 💰 **Zero Platform Fees** - Keep 100% of your savings
- 🏆 **Loyalty Rewards** - Earn points and unlock tiers (Bronze → Silver → Gold → Platinum)
- ✅ **Verified Reviews** - Only real buyers can review merchants
- 🔄 **Tradable Assets** - Buy, sell, gift, or trade your coupons freely

### For Merchants
- 📊 **Campaign Management** - Create and track discount campaigns
- 📈 **Real-time Analytics** - Monitor sales, revenue, and customer engagement
- 🎯 **Targeted Marketing** - Reach crypto-native customers
- 🔒 **Instant Settlement** - Get paid immediately in USDC
- 📱 **Easy Onboarding** - Set up campaigns in minutes
- 🌐 **Global Reach** - No geographical limitations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Solana wallet (Phantom, Solflare, etc.)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/pl974/dealchain.git
cd dealchain

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit http://localhost:3000 to see the app in action!

### Project Structure

```
dealchain/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   │   ├── page.tsx           # Landing page
│       │   │   ├── marketplace/       # Browse deals
│       │   │   ├── merchant/          # Merchant dashboard
│       │   │   └── profile/           # User profile
│       │   ├── components/  # React components
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   ├── wallet/           # Wallet integration
│       │   │   └── layout/           # Layout components
│       │   └── lib/         # Utilities
│       └── public/          # Static assets
├── packages/
│   └── anchor/              # Solana smart contracts
│       ├── programs/
│       │   └── dealchain/   # Anchor program
│       └── tests/           # Contract tests
├── CHANGELOG.md             # Version history
├── UI_UX_OVERVIEW.md        # Design documentation
└── turbo.json               # Turborepo configuration
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

### Blockchain
- **Network**: [Solana](https://solana.com/)
- **Framework**: [Anchor](https://www.anchor-lang.com/)
- **Wallet Adapter**: [@solana/wallet-adapter-react](https://github.com/solana-labs/wallet-adapter)
- **Supported Wallets**: Phantom, Solflare, Torus, Ledger

### Infrastructure
- **Monorepo**: [Turborepo](https://turbo.build/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend) + Solana (contracts)

---

## 📱 Pages Overview

### 🏠 Landing Page (`/`)
- Hero section with value proposition
- Feature showcase (6 key features)
- Stats highlights (NFT-powered, 0% fees, instant, 100% ownership)
- Call-to-action buttons
- Fully responsive with animated background

### 🛒 Marketplace (`/marketplace`)
- Browse all available deals
- Search and filter functionality
- Deal cards with images, discounts, ratings
- Stock levels and expiry countdowns
- Progress bars for visual stock indicators
- Category filtering (Food, Travel, Shopping, etc.)

### 🏪 Merchant Dashboard (`/merchant`)
- Campaign management interface
- Real-time stats (revenue, sales, customers, rating)
- Campaign cards with detailed metrics
- Create deal dialog
- Edit/Delete/View campaign actions
- Low stock warnings
- Visual progress bars

### 👤 User Profile (`/profile`)
- User stats and wallet info
- Loyalty tier system with progress bar
- My Deals section (owned NFT coupons)
- Transaction history with explorer links
- Copy-to-clipboard for addresses
- Redeem functionality for active coupons

---

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (crypto standard)
- **Secondary**: Complementary accent
- **Background**: Adaptive dark/light
- **Muted**: Subtle grays for secondary content
- **Success**: Green (verified, active)
- **Warning**: Yellow (expiring soon)
- **Info**: Blue (verified merchants)
- **Destructive**: Red (critical actions)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold with gradient text
- **Body**: Clean 16px base
- **Code**: Monospace for addresses

### Components
All components built with shadcn/ui + Radix UI:
- Card (with Header, Content, Footer)
- Badge (7 variants)
- Button (5 variants, 4 sizes)
- Input (text, number, file)
- Select (dropdown with keyboard nav)
- Dialog (modals with animations)

See `UI_UX_OVERVIEW.md` for detailed design documentation.

---

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (all workspaces)
pnpm dev:web          # Start web app only
pnpm dev:anchor       # Start Anchor localnet

# Building
pnpm build            # Build all workspaces
pnpm build:web        # Build web app only
pnpm build:anchor     # Build Anchor program

# Testing
pnpm test             # Run all tests
pnpm test:web         # Test web app
pnpm test:anchor      # Test smart contracts

# Linting
pnpm lint             # Lint all workspaces
pnpm lint:fix         # Auto-fix linting issues

# Cleaning
pnpm clean            # Clean all build artifacts
```

### Environment Variables

Create `.env.local` in `apps/web/`:

```env
# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com

# Smart Contract
NEXT_PUBLIC_PROGRAM_ID=your_program_id_here

# Optional
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

---

## 🧪 Testing

### Smart Contract Testing

```bash
cd packages/anchor
anchor test
```

### Frontend Testing

```bash
cd apps/web
pnpm test
```

### E2E Testing

```bash
pnpm test:e2e
```

---

## 🚢 Deployment

### Smart Contract Deployment

```bash
# Deploy to devnet
cd packages/anchor
anchor build
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

### Frontend Deployment

The frontend is automatically deployed via GitHub Actions on push to `master`.

Manual deployment:
```bash
cd apps/web
pnpm build
vercel --prod
```

---

## 📖 Documentation

- **UI/UX Overview**: See `UI_UX_OVERVIEW.md` for complete design documentation
- **Changelog**: See `CHANGELOG.md` for version history and roadmap
- **Smart Contract**: See `packages/anchor/programs/dealchain/` for contract code
- **Components**: See `apps/web/src/components/` for component library

---

## 🗺️ Roadmap

### Version 1.1.0 (Next)
- [ ] Real blockchain integration (replace mock data)
- [ ] Transaction signing and confirmation flows
- [ ] Deal detail pages
- [ ] Advanced filtering and search
- [ ] Dark/Light theme toggle

### Version 1.2.0
- [ ] NFT redemption with QR codes
- [ ] Merchant verification process
- [ ] Review and rating system
- [ ] Points redemption
- [ ] Email/Push notifications

### Version 2.0.0 (Vision)
- [ ] Secondary marketplace for trading
- [ ] P2P trading with escrow
- [ ] Merchant analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-chain support

See `CHANGELOG.md` for detailed roadmap.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the incredible blockchain platform
- **Anchor** - For the amazing Solana development framework
- **shadcn/ui** - For beautiful, accessible components
- **Next.js Team** - For the best React framework
- **Vercel** - For seamless deployments

---

## 📞 Contact & Links

- **GitHub**: [github.com/pl974/dealchain](https://github.com/pl974/dealchain)
- **Live Demo**: [Coming Soon]
- **Documentation**: See project docs
- **Issues**: [GitHub Issues](https://github.com/pl974/dealchain/issues)

---

<div align="center">

**Built with 💜 on Solana - Revolutionizing the Coupon Industry**

[⭐ Star this repo](https://github.com/pl974/dealchain) | [🐛 Report Bug](https://github.com/pl974/dealchain/issues) | [💡 Request Feature](https://github.com/pl974/dealchain/issues)

</div>
