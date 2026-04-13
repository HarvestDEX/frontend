import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HarvestDEX — Agricultural Commodity RWA DEX',
  description: 'Trade tokenized RICE, COFFEE, CORN, and CPO with live prices on HashKey Chain. Spot trading, perpetual long/short, and LP pool on HashKey Chain Testnet.',
  keywords: ['DeFi', 'RWA', 'HashKey Chain', 'commodity trading', 'RICE', 'COFFEE', 'CORN', 'CPO', 'DEX'],
  openGraph: {
    title: 'HarvestDEX — Trade Real Crops On-Chain',
    description: 'Agricultural commodity RWA DEX on HashKey Chain. Live prices, spot & perp trading, LP pool.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HarvestDEX — Trade Real Crops On-Chain',
    description: 'Agricultural commodity RWA DEX on HashKey Chain',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f1a0f" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
