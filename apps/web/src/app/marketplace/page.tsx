/**
 * Marketplace Page
 *
 * Browse and filter NFT coupons with beautiful cards.
 * Implements crypto UX best practices.
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  SlidersHorizontal,
  Clock,
  Tag,
  TrendingUp,
  Star,
  Store,
} from 'lucide-react'
import { formatPrice, formatTimeAgo } from '@/lib/utils'

// Mock data for demonstration
const mockDeals = [
  {
    id: '1',
    title: '50% Off Premium Coffee',
    merchant: 'Café Solana',
    discount: 50,
    price: 5_000_000, // 5 USDC in lamports
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    remaining: 45,
    total: 100,
    rating: 4.8,
    verified: true,
  },
  {
    id: '2',
    title: '30% Off Gym Membership',
    merchant: 'FitChain Gym',
    discount: 30,
    price: 25_000_000, // 25 USDC
    category: 'Health',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    expiry: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
    remaining: 12,
    total: 50,
    rating: 4.9,
    verified: true,
  },
  {
    id: '3',
    title: '40% Off Movie Tickets',
    merchant: 'Cinema NFT',
    discount: 40,
    price: 8_000_000, // 8 USDC
    category: 'Entertainment',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
    expiry: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
    remaining: 8,
    total: 20,
    rating: 4.7,
    verified: true,
  },
]

const categories = ['All', 'Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Education', 'Services']

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [sortBy, setSortBy] = React.useState('recent')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground text-lg">
          Discover exclusive deals from verified merchants
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== 'All' && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory('All')}
                className="ml-1 hover:bg-background rounded-full"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDeals.map((deal) => (
          <Link key={deal.id} href={`/marketplace/${deal.id}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
              {/* Deal Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              <div className="absolute top-3 left-3">
                <Badge variant="success" className="text-lg font-bold">
                  -{deal.discount}%
                </Badge>
              </div>
              {deal.verified && (
                <div className="absolute top-3 right-3">
                  <Badge variant="info">Verified</Badge>
                </div>
              )}
            </div>

            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                    {deal.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Store className="h-3 w-3" />
                    {deal.merchant}
                  </CardDescription>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{deal.rating}</span>
                <span className="text-muted-foreground">(120 reviews)</span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(deal.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(deal.price / (1 - deal.discount / 100))}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTimeAgo(deal.expiry)}
                  </div>
                  <div>
                    {deal.remaining}/{deal.total} left
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${100 - (deal.remaining / deal.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button className="w-full gap-2" size="lg">
                <TrendingUp className="h-4 w-4" />
                View Details
              </Button>
            </CardFooter>
          </Card>
        </Link>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-12 text-center">
        <Button variant="outline" size="lg">
          Load More Deals
        </Button>
      </div>
    </div>
  )
}
