import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HarvestDEX — Agricultural Commodity RWA DEX',
  description: 'Trade tokenized RICE, COFFEE, CORN, and CPO with live prices on HashKey Chain',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
