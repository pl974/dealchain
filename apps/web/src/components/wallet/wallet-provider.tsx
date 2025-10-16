/**
 * Wallet Provider Component
 *
 * Configures Solana wallet adapter with all major wallets.
 * Wrap your app with this to enable wallet functionality.
 */

'use client'

import * as React from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

export function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Get network from environment (devnet, testnet, mainnet-beta)
  const network =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) ||
    WalletAdapterNetwork.Devnet

  // Get RPC endpoint from environment or use default
  const endpoint = React.useMemo(
    () =>
      process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl(network),
    [network]
  )

  // Configure wallets
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
