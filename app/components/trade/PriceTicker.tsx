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
      <div className="flex items-center gap-2 text-[var(--muted)] text-sm">
        <span className="pixel-font text-[8px]">ORACLE</span>
        <span style={{ color: 'var(--red)' }}>OFFLINE</span>
      </div>
    )
  }

  if (!prices) {
    return (
      <div className="flex items-center gap-2 text-[var(--muted)]">
        <span className="pixel-font text-[8px]">LOADING...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto flex-nowrap">
      {COMMODITIES.map((c) => {
        const price = prices[c.symbol as keyof PriceData]
        if (typeof price !== 'number') return null
        return (
          <div key={c.symbol} className="flex items-center gap-1 flex-shrink-0">
            <span>{c.sprite}</span>
            <span className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>{c.symbol}</span>
            <span className="price-gold">${price.toFixed(2)}</span>
          </div>
        )
      })}
      <span className="text-[var(--muted)] text-sm flex-shrink-0 ml-2">
        {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}
      </span>
    </div>
  )
}
