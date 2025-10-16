/**
 * Wallet Button Component
 *
 * Beautiful wallet connection button following crypto UX standards.
 * Displays wallet address when connected, shows connection dialog when not.
 */

'use client'

import * as React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { truncateAddress } from '@/lib/utils'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'

export function WalletButton() {
  const { publicKey, wallet, disconnect, select, wallets, connected } =
    useWallet()
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setOpen(false)
  }

  // If connected, show wallet info
  if (connected && publicKey) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {truncateAddress(publicKey.toBase58())}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet Connected</DialogTitle>
            <DialogDescription>
              You're connected with{' '}
              {wallet?.adapter.name || 'your wallet'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-2">
                Wallet Address
              </p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono">
                  {truncateAddress(publicKey.toBase58(), 8)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleDisconnect}
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // If not connected, show wallet selection
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to DealChain
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {wallets
            .filter(
              (wallet) =>
                wallet.readyState === WalletReadyState.Installed ||
                wallet.readyState === WalletReadyState.Loadable
            )
            .map((wallet) => (
              <Button
                key={wallet.adapter.name}
                variant="outline"
                className="justify-start gap-3 h-auto p-4"
                onClick={() => {
                  select(wallet.adapter.name)
                  setOpen(false)
                }}
              >
                {wallet.adapter.icon && (
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    className="h-6 w-6"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold">{wallet.adapter.name}</p>
                  {wallet.readyState === WalletReadyState.Installed && (
                    <p className="text-xs text-muted-foreground">Detected</p>
                  )}
                </div>
              </Button>
            ))}

          {wallets.filter(
            (wallet) =>
              wallet.readyState === WalletReadyState.Installed ||
              wallet.readyState === WalletReadyState.Loadable
          ).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No wallet detected</p>
              <p className="text-sm">
                Please install a Solana wallet like{' '}
                <a
                  href="https://phantom.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Phantom
                </a>{' '}
                or{' '}
                <a
                  href="https://solflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Solflare
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
