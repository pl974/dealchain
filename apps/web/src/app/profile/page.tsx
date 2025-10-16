/**
 * User Profile & Wallet Page
 *
 * View purchased NFT coupons, loyalty points, transaction history,
 * and account settings.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Wallet,
  User,
  ShoppingBag,
  Award,
  History,
  Settings,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  Gift,
  TrendingUp,
  Sparkles,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'

// Mock user data
const mockUserData = {
  username: 'SolanaDealer',
  joinedDate: '2025-01-15',
  totalPurchases: 12,
  totalSpent: 87_500_000, // 87.5 USDC
  loyaltyPoints: 875,
  loyaltyTier: 'Silver' as const,
  nextTierPoints: 1500,
}

// Loyalty tiers
const loyaltyTiers = [
  { name: 'Bronze', minPoints: 0, color: 'text-amber-700', icon: '🥉' },
  { name: 'Silver', minPoints: 500, color: 'text-gray-400', icon: '🥈' },
  { name: 'Gold', minPoints: 1500, color: 'text-yellow-500', icon: '🥇' },
  { name: 'Platinum', minPoints: 5000, color: 'text-cyan-500', icon: '💎' },
]

// Mock owned deals/coupons
const mockOwnedDeals = [
  {
    id: '1',
    title: '50% Off Premium Coffee',
    merchant: 'Café Solana',
    discount: 50,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    purchaseDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    expiry: Date.now() + 5 * 24 * 60 * 60 * 1000,
    redeemed: false,
    nftMint: '5Ghy...k8Tz',
  },
  {
    id: '2',
    title: '30% Off Gym Membership',
    merchant: 'FitChain Gym',
    discount: 30,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    purchaseDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
    expiry: Date.now() + 9 * 24 * 60 * 60 * 1000,
    redeemed: false,
    nftMint: '7Abc...x9Qw',
  },
  {
    id: '3',
    title: 'Buy 2 Get 1 Free - Pastries',
    merchant: 'Café Solana',
    discount: 33,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    purchaseDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    expiry: Date.now() - 1 * 24 * 60 * 60 * 1000,
    redeemed: true,
    nftMint: '9Def...m2Kl',
  },
]

// Mock transaction history
const mockTransactions = [
  {
    id: '1',
    type: 'purchase' as const,
    title: 'Purchased 50% Off Premium Coffee',
    amount: 5_000_000,
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    signature: 'AbC123...xYz789',
  },
  {
    id: '2',
    type: 'purchase' as const,
    title: 'Purchased 30% Off Gym Membership',
    amount: 25_000_000,
    date: Date.now() - 5 * 24 * 60 * 60 * 1000,
    signature: 'DeF456...wVu012',
  },
  {
    id: '3',
    type: 'redeem' as const,
    title: 'Redeemed Buy 2 Get 1 Free - Pastries',
    amount: 0,
    date: Date.now() - 7 * 24 * 60 * 60 * 1000,
    signature: 'GhI789...tSr345',
  },
]

export default function ProfilePage() {
  const { connected, publicKey } = useWallet()
  const [copiedAddress, setCopiedAddress] = React.useState(false)
  const [copiedNft, setCopiedNft] = React.useState<string | null>(null)

  // Format price in USDC
  const formatPrice = (lamports: number) => {
    return (lamports / 1_000_000).toFixed(2)
  }

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Format time remaining
  const formatTimeRemaining = (timestamp: number) => {
    const now = Date.now()
    const diff = timestamp - now

    if (diff < 0) return 'Expired'

    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    if (days > 1) return `${days} days left`
    if (days === 1) return '1 day left'

    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours > 1) return `${hours} hours left`

    return 'Expiring soon'
  }

  // Truncate address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, type: 'address' | 'nft' = 'address') => {
    navigator.clipboard.writeText(text)
    if (type === 'address') {
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } else {
      setCopiedNft(text)
      setTimeout(() => setCopiedNft(null), 2000)
    }
  }

  // Get current tier progress
  const getCurrentTierProgress = () => {
    const currentTier = loyaltyTiers.findIndex((t) => t.name === mockUserData.loyaltyTier)
    const nextTier = loyaltyTiers[currentTier + 1]

    if (!nextTier) {
      return { progress: 100, nextTierName: 'Max Tier', pointsNeeded: 0 }
    }

    const currentTierMin = loyaltyTiers[currentTier].minPoints
    const nextTierMin = nextTier.minPoints
    const progress = ((mockUserData.loyaltyPoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100
    const pointsNeeded = nextTierMin - mockUserData.loyaltyPoints

    return { progress, nextTierName: nextTier.name, pointsNeeded }
  }

  const tierProgress = getCurrentTierProgress()

  // Not connected state
  if (!connected || !publicKey) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-20">
        <Card className="border-2 border-primary/20 text-center p-12">
          <User className="h-16 w-16 mx-auto text-primary mb-6" />
          <h1 className="text-3xl font-bold mb-4">User Profile</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Connect your wallet to view your profile, deals, and rewards
          </p>
          <Button size="lg" asChild>
            <Link href="/">Connect Wallet</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
            {mockUserData.username[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{mockUserData.username}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(new Date(mockUserData.joinedDate).getTime())}
              </span>
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                {truncateAddress(publicKey.toBase58())}
                <button
                  onClick={() => copyToClipboard(publicKey.toBase58(), 'address')}
                  className="hover:text-foreground transition-colors"
                >
                  {copiedAddress ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Total Purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockUserData.totalPurchases}</p>
            <p className="text-sm text-muted-foreground mt-1">NFT coupons owned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatPrice(mockUserData.totalSpent)} USDC
            </p>
            <p className="text-sm text-muted-foreground mt-1">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Loyalty Points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockUserData.loyaltyPoints}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tierProgress.pointsNeeded} to {tierProgress.nextTierName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Loyalty Tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loyaltyTiers.find((t) => t.name === mockUserData.loyaltyTier)?.icon}{' '}
              {mockUserData.loyaltyTier}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Progress */}
      <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Loyalty Rewards Progress</h3>
              <p className="text-sm text-muted-foreground">
                Earn points with every purchase and unlock exclusive benefits
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </Button>
          </div>

          {/* Tier Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{mockUserData.loyaltyPoints} points</span>
              <span className="text-muted-foreground">
                {tierProgress.pointsNeeded} points to {tierProgress.nextTierName}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all"
                style={{ width: `${Math.min(tierProgress.progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              {loyaltyTiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`text-center ${
                    mockUserData.loyaltyPoints >= tier.minPoints
                      ? tier.color
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="text-2xl mb-1">{tier.icon}</div>
                  <div className="text-xs font-medium">{tier.name}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs-like section */}
      <div className="space-y-6">
        {/* My Deals Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            My Deals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockOwnedDeals.map((deal) => (
              <Card
                key={deal.id}
                className={`border-2 ${
                  deal.redeemed
                    ? 'opacity-60 border-muted'
                    : 'border-primary/20 hover:border-primary/50'
                } transition-all`}
              >
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/70 backdrop-blur">
                      -{deal.discount}%
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    {deal.redeemed ? (
                      <Badge variant="success">Redeemed</Badge>
                    ) : (
                      <Badge variant="info">Active</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground">{deal.merchant}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Purchased</span>
                    <span className="font-medium">{formatDate(deal.purchaseDate)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span
                      className={`font-medium ${
                        deal.expiry < Date.now()
                          ? 'text-destructive'
                          : deal.expiry < Date.now() + 3 * 24 * 60 * 60 * 1000
                            ? 'text-warning'
                            : ''
                      }`}
                    >
                      {formatTimeRemaining(deal.expiry)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <span className="text-muted-foreground">NFT Mint</span>
                    <button
                      onClick={() => copyToClipboard(deal.nftMint, 'nft')}
                      className="flex items-center gap-1 font-mono hover:text-primary transition-colors"
                    >
                      {deal.nftMint}
                      {copiedNft === deal.nftMint ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {!deal.redeemed && deal.expiry > Date.now() && (
                    <Button className="w-full gap-2" size="sm">
                      <CheckCircle className="h-4 w-4" />
                      Redeem Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <History className="h-6 w-6" />
            Transaction History
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            tx.type === 'purchase'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {tx.type === 'purchase' ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {tx.amount > 0 && (
                          <p className="font-semibold">
                            {formatPrice(tx.amount)} USDC
                          </p>
                        )}
                        <a
                          href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                        >
                          {truncateAddress(tx.signature)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
