'use client'

import { useEffect, useState } from 'react'
import { COMMODITIES, BACKEND_URL } from '../../lib/constants'

interface Prices {
  RICE?: number
  COFFEE?: number
  CORN?: number
  CPO?: number
}

const TICKER_ITEMS = COMMODITIES.map((c) => ({
  symbol: c.symbol,
  name: c.name,
  sprite: c.sprite,
  color: c.color,
}))

export default function PriceMarquee() {
  const [prices, setPrices] = useState<Prices | null>(null)

  useEffect(() => {
    fetch(`${BACKEND_URL}/v1/prices`)
      .then((r) => r.json())
      .then((data) => setPrices(data))
      .catch(() => {})
  }, [])

  const getPrice = (symbol: string): string => {
    if (!prices) return '...'
    const val = prices[symbol as keyof Prices]
    if (typeof val !== 'number') return '...'
    return val >= 10 ? val.toFixed(2) : val.toFixed(4)
  }

  // Double the items for seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      style={{
        background: '#0a0e06',
        borderTop: '3px solid var(--border)',
        borderBottom: '3px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '48px',
          background: 'linear-gradient(90deg, #0a0e06, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '48px',
          background: 'linear-gradient(270deg, #0a0e06, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <div className="marquee-track" style={{ padding: '10px 0' }}>
        {items.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="flex items-center gap-2 flex-shrink-0"
            style={{ marginRight: '40px' }}
          >
            <img
              src={item.sprite}
              alt={item.name}
              width={24}
              height={24}
              style={{ imageRendering: 'pixelated' }}
            />
            <span
              className="pixel-font"
              style={{ fontSize: '8px', color: item.color }}
            >
              {item.symbol}
            </span>
            <img
              src="/sprites/usdc-coin.png"
              alt="usdc"
              width={14}
              height={14}
              style={{ imageRendering: 'pixelated' }}
            />
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '22px',
                color: 'var(--gold)',
                letterSpacing: '1px',
              }}
            >
              ${getPrice(item.symbol)}
            </span>
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              USD
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
