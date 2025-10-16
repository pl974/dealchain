/**
 * Landing Page
 *
 * Modern, crypto-styled landing page with hero section,
 * features, and call-to-action.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Shield,
  Coins,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              <Sparkles className="h-3 w-3 mr-1" />
              Built for MonkeDAO Grant - Cypherpunk Hackathon 2025
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              Web3 Discount
              <br />
              Marketplace
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Buy, trade, and redeem NFT coupons on Solana. Your deals, your
              assets, your control.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="gap-2 text-lg px-8" asChild>
                <Link href="/marketplace">
                  Explore Deals
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8"
                asChild
              >
                <Link href="/merchant">
                  Become a Merchant
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  NFT
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Powered Coupons
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  0%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Platform Fee
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  Instant
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redemption
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  100%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Ownership
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why DealChain?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built on Solana for speed, security, and true ownership
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Built on Solana</CardTitle>
                <CardDescription>
                  Production-ready smart contract deployed on Solana's
                  high-performance blockchain.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Powered by Solana for instant transactions and low fees.
                  Trade deals in seconds.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>True Ownership</CardTitle>
                <CardDescription>
                  Your coupons are NFTs. Trade, gift, or resell them freely.
                  You're in control.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Merchant-Friendly</CardTitle>
                <CardDescription>
                  Easy onboarding for merchants. Create campaigns, track sales,
                  and grow your business.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Loyalty Rewards</CardTitle>
                <CardDescription>
                  Earn points with every purchase. Unlock tiers from Bronze to
                  Platinum.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Verified Reviews</CardTitle>
                <CardDescription>
                  Only real buyers can review. Authentic feedback from verified
                  NFT owners.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Saving?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect your wallet and explore exclusive deals from verified
                merchants
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/marketplace">
                    Browse Marketplace
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/docs">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
