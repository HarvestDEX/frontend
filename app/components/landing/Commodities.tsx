'use client'

import { useEffect, useState } from 'react'
import { COMMODITIES, BACKEND_URL } from '../../lib/constants'

interface Prices {
  RICE?: number
  COFFEE?: number
  CORN?: number
  CPO?: number
  updatedAt?: string
}

export default function Commodities() {
  const [prices, setPrices] = useState<Prices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${BACKEND_URL}/v1/prices`)
      .then((r) => r.json())
      .then((data) => {
        setPrices(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const getPrice = (symbol: string): string => {
    if (loading) return '...'
    if (error || !prices) return 'N/A'
    const val = prices[symbol as keyof Prices]
    if (typeof val !== 'number') return 'N/A'
    if (val >= 100) return `$${val.toFixed(2)}`
    if (val >= 10) return `$${val.toFixed(2)}`
    return `$${val.toFixed(4)}`
  }

  return (
    <section
      style={{
        background: 'var(--surface)',
        padding: '80px 24px',
        borderTop: '2px solid var(--border)',
        borderBottom: '2px solid var(--border)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <h2
          className="pixel-font text-center mb-4"
          style={{
            fontSize: 'clamp(12px, 2.5vw, 20px)',
            color: 'var(--white)',
          }}
        >
          Commodities
        </h2>

        <p
          className="text-center mb-10"
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: '18px',
            color: 'var(--muted)',
          }}
        >
          Live prices from global commodity markets
        </p>

        {/* Commodity Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {COMMODITIES.map((commodity) => (
            <div
              key={commodity.symbol}
              className="pixel-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              {/* Sprite */}
              <div
                style={{
                  fontSize: '48px',
                  lineHeight: 1,
                  filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))',
                }}
              >
                {commodity.sprite}
              </div>

              {/* Symbol */}
              <div
                className="pixel-font"
                style={{
                  fontSize: '9px',
                  color: commodity.color,
                }}
              >
                {commodity.symbol}
              </div>

              {/* Full name */}
              <div
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: '15px',
                  color: 'var(--muted)',
                  lineHeight: '1.3',
                }}
              >
                {commodity.fullName}
              </div>

              {/* Price */}
              <div
                className="price-gold"
                style={{
                  fontSize: '28px',
                  letterSpacing: '1px',
                }}
              >
                {getPrice(commodity.symbol)}
              </div>

              {/* Unit */}
              <div
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: '14px',
                  color: 'var(--muted)',
                }}
              >
                {commodity.unit}
              </div>

              {/* Status dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    background: loading ? 'var(--muted)' : error ? 'var(--red)' : 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '13px',
                    color: 'var(--muted)',
                  }}
                >
                  {loading ? 'loading...' : error ? 'unavailable' : 'live'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* APAC note */}
        <div
          className="pixel-card text-center"
          style={{
            padding: '16px 24px',
            borderColor: 'var(--gold)',
            boxShadow: '0 -2px 0 0 var(--gold), 0 2px 0 0 var(--gold), -2px 0 0 0 var(--gold), 2px 0 0 0 var(--gold)',
          }}
        >
          <p
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: 'var(--gold)',
              margin: 0,
              lineHeight: '1.5',
            }}
          >
            🌏 APAC Focus: RICE and CPO are Indonesia/Malaysia&apos;s most traded commodities
          </p>
          {prices?.updatedAt && (
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
                margin: '8px 0 0',
              }}
            >
              Last updated: {new Date(prices.updatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
