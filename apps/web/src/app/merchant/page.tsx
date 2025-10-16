/**
 * Merchant Dashboard
 *
 * Comprehensive dashboard for merchants to create and manage
 * their deal campaigns, track sales, and view analytics.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Plus,
  Store,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'

// Mock merchant data
const mockMerchantData = {
  name: 'Café Solana',
  verified: true,
  totalSales: 12450,
  totalRevenue: 156_500_000, // 156.5 USDC
  totalCustomers: 847,
  activeCampaigns: 3,
  rating: 4.8,
  reviews: 120,
}

// Mock campaigns
const mockCampaigns = [
  {
    id: '1',
    title: '50% Off Premium Coffee',
    discount: 50,
    price: 5_000_000, // 5 USDC
    originalPrice: 10_000_000,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
    remaining: 45,
    total: 100,
    sold: 55,
    revenue: 275_000_000, // 275 USDC
    status: 'active' as const,
  },
  {
    id: '2',
    title: '30% Off Breakfast Menu',
    discount: 30,
    price: 7_000_000,
    originalPrice: 10_000_000,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
    expiry: Date.now() + 14 * 24 * 60 * 60 * 1000,
    remaining: 23,
    total: 50,
    sold: 27,
    revenue: 189_000_000,
    status: 'active' as const,
  },
  {
    id: '3',
    title: 'Buy 2 Get 1 Free - Pastries',
    discount: 33,
    price: 12_000_000,
    originalPrice: 18_000_000,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    expiry: Date.now() + 3 * 24 * 60 * 60 * 1000,
    remaining: 8,
    total: 30,
    sold: 22,
    revenue: 264_000_000,
    status: 'active' as const,
  },
]

export default function MerchantPage() {
  const { connected } = useWallet()
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  // Format price in USDC
  const formatPrice = (lamports: number) => {
    return (lamports / 1_000_000).toFixed(2)
  }

  // Format time remaining
  const formatTimeRemaining = (timestamp: number) => {
    const now = Date.now()
    const diff = timestamp - now
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))

    if (days > 1) return `${days} days left`
    if (days === 1) return '1 day left'

    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours > 1) return `${hours} hours left`

    return 'Expiring soon'
  }

  // Not connected state
  if (!connected) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-20">
        <Card className="border-2 border-primary/20 text-center p-12">
          <Store className="h-16 w-16 mx-auto text-primary mb-6" />
          <h1 className="text-3xl font-bold mb-4">Merchant Dashboard</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Connect your wallet to access your merchant dashboard and start creating deals
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{mockMerchantData.name}</h1>
            {mockMerchantData.verified && (
              <Badge variant="info" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage your deals, track sales, and grow your business
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>
                  Create a new discount campaign for your customers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Deal Title</label>
                  <Input placeholder="e.g., 50% Off Premium Coffee" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Discount %</label>
                    <Input type="number" placeholder="50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (USDC)</label>
                    <Input type="number" placeholder="5.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Total Supply</label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Expiry (Days)</label>
                    <Input type="number" placeholder="7" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Deal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatPrice(mockMerchantData.totalRevenue)} USDC
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              From {mockMerchantData.totalSales} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockMerchantData.totalCustomers}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Unique buyers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Active Campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockMerchantData.activeCampaigns}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockMerchantData.rating}/5</p>
            <p className="text-sm text-muted-foreground mt-1">
              {mockMerchantData.reviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Campaigns</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {mockCampaigns.map((campaign) => (
            <Card key={campaign.id} className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Campaign Image */}
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{campaign.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="secondary">{campaign.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeRemaining(campaign.expiry)}
                          </span>
                          {campaign.status === 'active' && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-lg font-semibold">
                          {formatPrice(campaign.price)} USDC
                        </p>
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(campaign.originalPrice)} USDC
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sold</p>
                        <p className="text-lg font-semibold">
                          {campaign.sold}/{campaign.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((campaign.sold / campaign.total) * 100).toFixed(0)}% sold
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-lg font-semibold">{campaign.remaining}</p>
                        {campaign.remaining < 10 && (
                          <Badge variant="warning" className="text-xs mt-1">
                            Low stock
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-lg font-semibold">
                          {formatPrice(campaign.revenue)} USDC
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${(campaign.sold / campaign.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to grow your business?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create exclusive deals, reach more customers, and build loyalty with DealChain's
            NFT-powered coupon marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-5 w-5" />
              Create New Deal
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
