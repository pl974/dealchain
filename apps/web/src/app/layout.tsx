/**
 * Root Layout
 *
 * Main application layout with providers and global styles.
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SolanaWalletProvider } from '@/components/wallet/wallet-provider'
import { Navbar } from '@/components/layout/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DealChain - Web3 Discount Marketplace',
  description:
    'Buy, trade, and redeem NFT coupons on Solana. Your deals, your assets, your control.',
  keywords: [
    'Solana',
    'NFT',
    'Coupons',
    'Discounts',
    'Web3',
    'Blockchain',
    'DeFi',
  ],
  authors: [{ name: 'DealChain Team' }],
  openGraph: {
    title: 'DealChain - Web3 Discount Marketplace',
    description:
      'Buy, trade, and redeem NFT coupons on Solana. Your deals, your assets, your control.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealChain - Web3 Discount Marketplace',
    description:
      'Buy, trade, and redeem NFT coupons on Solana. Your deals, your assets, your control.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SolanaWalletProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 md:py-0">
              <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built with 💜 on Solana. 100% Secure Smart Contract (10/10
                  Audit Score)
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <a
                    href="https://github.com/pl974/dealchain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="/docs"
                    className="hover:text-foreground transition-colors"
                  >
                    Docs
                  </a>
                  <a
                    href="/security"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
