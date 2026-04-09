'use client'

import { useEffect, useState } from 'react'
import { COMMODITIES, BACKEND_URL } from '../../lib/constants'

interface PriceData {
  RICE: number
  COFFEE: number
  CORN: number
  CPO: number
  updatedAt: string
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<PriceData | null>(null)
  const [minutesAgo, setMinutesAgo] = useState<number>(0)
  const [error, setError] = useState(false)

  async function fetchPrices() {
    try {
      const res = await fetch(`${BACKEND_URL}/v1/prices`)
      if (!res.ok) throw new Error('fetch failed')
      const data: PriceData = await res.json()
      setPrices(data)
      setError(false)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!prices) return
    function updateAge() {
      const diff = Math.floor((Date.now() - new Date(prices!.updatedAt).getTime()) / 60000)
      setMinutesAgo(diff)
    }
    updateAge()
    const timer = setInterval(updateAge, 60_000)
    return () => clearInterval(timer)
  }, [prices])

  if (error) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          boxShadow: 'inset -2px -2px 0 0 #1a2a1a, inset 2px 2px 0 0 #3a5a3a',
        }}
      >
        <img src="/sprites/signpost.png" alt="" width={16} height={20} style={{ imageRendering: 'pixelated' }} />
        <span className="pixel-font text-[8px]" style={{ color: 'var(--red)' }}>MARKET CLOSED</span>
      </div>
    )
  }

  if (!prices) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1"
        style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}
      >
        <span className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>READING BOARD...</span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto flex-nowrap px-2 py-1"
      style={{
        background: '#1a1200',
        border: '2px solid #7a5a20',
        boxShadow: 'inset -2px -2px 0 0 #0a0800, inset 2px 2px 0 0 #b08030',
      }}
    >
      {/* Board label */}
      <span
        className="pixel-font text-[7px] flex-shrink-0 mr-2"
        style={{ color: '#b08030' }}
      >
        MARKET
      </span>

      {COMMODITIES.map((c, i) => {
        const price = prices[c.symbol as keyof PriceData]
        if (typeof price !== 'number') return null
        return (
          <div key={c.symbol} className="flex items-center gap-1 flex-shrink-0">
            {i > 0 && (
              <span style={{ color: '#7a5a20', margin: '0 4px' }}>|</span>
            )}
            <img
              src={c.sprite}
              alt={c.name}
              width={20}
              height={20}
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="pixel-font text-[7px]" style={{ color: '#b08030' }}>{c.symbol}</span>
            <img
              src="/sprites/gold-coin.png"
              alt="gold"
              width={12}
              height={12}
              style={{ imageRendering: 'pixelated' }}
            />
            <span style={{ color: 'var(--gold)', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
              {price.toFixed(2)}
            </span>
          </div>
        )
      })}

      <span
        className="flex-shrink-0 ml-3 text-[var(--muted)]"
        style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}
      >
        {minutesAgo === 0
          ? 'Messenger just arrived'
          : `Last messenger: ${minutesAgo}m ago`}
      </span>
    </div>
  )
}
