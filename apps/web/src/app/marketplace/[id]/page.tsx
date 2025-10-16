/**
 * Deal Detail Page
 *
 * Comprehensive view of a single deal with all information,
 * merchant details, reviews, and purchase action.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Store,
  Clock,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  Share2,
  Heart,
  ShoppingCart,
  MapPin,
  Calendar,
  Tag,
  TrendingUp,
} from 'lucide-react'

// Mock deal data (would come from API/blockchain)
const mockDeal = {
  id: '1',
  title: '50% Off Premium Coffee',
  merchant: {
    name: 'Café Solana',
    verified: true,
    rating: 4.8,
    totalReviews: 120,
    totalSales: 847,
    location: 'San Francisco, CA',
  },
  discount: 50,
  price: 5_000_000, // 5 USDC
  originalPrice: 10_000_000,
  category: 'Food & Beverage',
  image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  description:
    'Enjoy our premium artisan coffee at half price! This exclusive deal includes any coffee drink from our specialty menu, featuring single-origin beans roasted in-house. Valid for both hot and iced beverages.',
  terms: [
    'Valid for one beverage per coupon',
    'Cannot be combined with other offers',
    'Not valid on wholesale coffee beans',
    'Must show NFT in wallet to redeem',
    'Redeemable at any Café Solana location',
  ],
  expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
  remaining: 45,
  total: 100,
  sold: 55,
  createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  benefits: [
    'Transferable NFT',
    'Tradable on secondary market',
    'Earn 50 loyalty points',
    'Verified merchant',
  ],
}

// Mock reviews
const mockReviews = [
  {
    id: '1',
    user: '5Ghy...k8Tz',
    rating: 5,
    comment: 'Amazing coffee! The baristas are super friendly and the ambiance is perfect for working.',
    date: Date.now() - 1 * 24 * 60 * 60 * 1000,
    verified: true,
  },
  {
    id: '2',
    user: '7Abc...x9Qw',
    rating: 4,
    comment: 'Great deal and high-quality coffee. Redemption process was seamless!',
    date: Date.now() - 3 * 24 * 60 * 60 * 1000,
    verified: true,
  },
  {
    id: '3',
    user: '9Def...m2Kl',
    rating: 5,
    comment: 'Love that I can trade this NFT with friends. The future of coupons is here!',
    date: Date.now() - 5 * 24 * 60 * 60 * 1000,
    verified: true,
  },
]

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { connected } = useWallet()
  const [isFavorite, setIsFavorite] = React.useState(false)

  // Format price in USDC
  const formatPrice = (lamports: number) => {
    return (lamports / 1_000_000).toFixed(2)
  }

  // Format time remaining
  const formatTimeRemaining = (timestamp: number) => {
    const now = Date.now()
    const diff = timestamp - now
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

    if (days > 1) return `${days} days ${hours}h left`
    if (days === 1) return `1 day ${hours}h left`
    if (hours > 1) return `${hours} hours left`
    return 'Expiring soon'
  }

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Truncate address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="gap-2 mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="overflow-hidden border-2">
            <div className="relative h-96 bg-muted">
              <img
                src={mockDeal.image}
                alt={mockDeal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-1 bg-black/70 backdrop-blur">
                  -{mockDeal.discount}%
                </Badge>
                {mockDeal.merchant.verified && (
                  <Badge variant="info" className="gap-1 bg-black/70 backdrop-blur">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/70 backdrop-blur hover:bg-black/90"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/70 backdrop-blur hover:bg-black/90"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Deal Info */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-3">
                    {mockDeal.category}
                  </Badge>
                  <CardTitle className="text-3xl mb-2">{mockDeal.title}</CardTitle>
                  <CardDescription className="text-base">
                    {mockDeal.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Merchant Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{mockDeal.merchant.name}</h3>
                    {mockDeal.merchant.verified && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {renderStars(mockDeal.merchant.rating)}
                      <span className="ml-1">
                        {mockDeal.merchant.rating} ({mockDeal.merchant.totalReviews})
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {mockDeal.merchant.totalSales} sales
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {mockDeal.merchant.location}
                    </span>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/merchant/${mockDeal.id}`}>View Store</Link>
                </Button>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-semibold mb-3">What You Get</h3>
                <div className="grid grid-cols-2 gap-3">
                  {mockDeal.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <h3 className="font-semibold mb-3">Terms & Conditions</h3>
                <ul className="space-y-2">
                  {mockDeal.terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                Only verified NFT owners can leave reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium font-mono text-sm">
                            {truncateAddress(review.user)}
                          </span>
                          {review.verified && (
                            <Badge variant="success" className="text-xs">
                              Verified Owner
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Purchase Card */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-primary/20 sticky top-4">
            <CardContent className="p-6 space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">
                    {formatPrice(mockDeal.price)} USDC
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(mockDeal.originalPrice)} USDC
                  </span>
                </div>
                <p className="text-sm text-green-500 font-medium">
                  Save {formatPrice(mockDeal.originalPrice - mockDeal.price)} USDC
                </p>
              </div>

              {/* Stock & Expiry */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Expires
                  </span>
                  <span
                    className={`font-medium ${
                      mockDeal.expiry < Date.now() + 3 * 24 * 60 * 60 * 1000
                        ? 'text-warning'
                        : ''
                    }`}
                  >
                    {formatTimeRemaining(mockDeal.expiry)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Stock</span>
                    <span className="font-medium">
                      {mockDeal.remaining}/{mockDeal.total} left
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${(mockDeal.sold / mockDeal.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((mockDeal.sold / mockDeal.total) * 100).toFixed(0)}% sold
                  </p>
                </div>
              </div>

              {/* Purchase Button */}
              {connected ? (
                <Button className="w-full gap-2" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  Buy Now
                </Button>
              ) : (
                <Button className="w-full gap-2" size="lg" asChild>
                  <Link href="/">Connect Wallet to Buy</Link>
                </Button>
              )}

              {/* Additional Info */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Earn <span className="font-medium text-foreground">50 points</span> with this purchase
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    NFT minted to your wallet instantly
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Listed {formatDate(mockDeal.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
