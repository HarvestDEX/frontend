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

const itemKeyframes = `
@keyframes item-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
@keyframes coin-spin {
  0% { transform: scaleX(1); }
  40% { transform: scaleX(0.1); }
  50% { transform: scaleX(1); }
  100% { transform: scaleX(1); }
}
`

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
    if (val >= 100) return val.toFixed(2)
    if (val >= 10) return val.toFixed(2)
    return val.toFixed(4)
  }

  return (
    <section
      style={{
        background: 'var(--bg)',
        padding: '80px 24px',
        borderTop: '4px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{itemKeyframes}</style>

      {/* Decorative bushes */}
      <div className="absolute bottom-0 left-0 pointer-events-none flex items-end hidden md:flex">
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.4 }} />
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.3, marginLeft: '4px' }} />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none items-end hidden md:flex">
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.3, marginRight: '4px' }} />
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.4 }} />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--card)',
              border: '2px solid var(--gold)',
              boxShadow: '0 -2px 0 0 var(--gold), 0 2px 0 0 var(--gold), -2px 0 0 0 var(--gold), 2px 0 0 0 var(--gold)',
              padding: '12px 28px',
              marginBottom: '16px',
            }}
          >
            <img
              src="/sprites/usdc-coin.png"
              alt="coin"
              width={24}
              height={24}
              style={{ imageRendering: 'pixelated', animation: 'coin-spin 3s ease-in-out infinite' }}
            />
            <h2
              className="pixel-font"
              style={{
                fontSize: 'clamp(10px, 2vw, 16px)',
                color: 'var(--gold)',
                margin: 0,
              }}
            >
              TODAY&apos;S HARVEST
            </h2>
            <img
              src="/sprites/usdc-coin.png"
              alt="coin"
              width={24}
              height={24}
              style={{ imageRendering: 'pixelated', animation: 'coin-spin 3s ease-in-out 1.5s infinite' }}
            />
          </div>
          <p
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: 'var(--muted)',
            }}
          >
            Live prices from global commodity markets — updated every 10 minutes
          </p>
        </div>

        {/* Inventory grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {COMMODITIES.map((commodity, idx) => (
            <div
              key={commodity.symbol}
              style={{
                background: 'var(--card)',
                border: `2px solid ${commodity.color}`,
                boxShadow: `0 -2px 0 0 ${commodity.color}, 0 2px 0 0 ${commodity.color}, -2px 0 0 0 ${commodity.color}, 2px 0 0 0 ${commodity.color}`,
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 -2px 0 0 ${commodity.color}, 0 4px 0 0 ${commodity.color}, -2px 0 0 0 ${commodity.color}, 2px 0 0 0 ${commodity.color}, 0 0 20px 3px ${commodity.color}33`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 -2px 0 0 ${commodity.color}, 0 2px 0 0 ${commodity.color}, -2px 0 0 0 ${commodity.color}, 2px 0 0 0 ${commodity.color}`
              }}
            >
              {/* Item slot corner decoration */}
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  border: `2px solid ${commodity.color}`,
                  opacity: 0.4,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  width: '8px',
                  height: '8px',
                  border: `2px solid ${commodity.color}`,
                  opacity: 0.4,
                }}
              />

              {/* Sprite with floating animation */}
              <div
                style={{
                  animation: `item-float ${2.5 + idx * 0.4}s ease-in-out ${idx * 0.3}s infinite`,
                  filter: 'drop-shadow(0 4px 0px rgba(0,0,0,0.5))',
                }}
              >
                <img
                  src={commodity.sprite}
                  alt={commodity.name}
                  width={64}
                  height={64}
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Symbol in commodity color */}
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

              {/* Price row with USDC coin */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid rgba(240,192,96,0.3)',
                  padding: '6px 12px',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/sprites/usdc-coin.png"
                  alt="usdc"
                  width={16}
                  height={16}
                  style={{ imageRendering: 'pixelated', flexShrink: 0 }}
                />
                <span
                  className="price-gold"
                  style={{ fontSize: '26px', letterSpacing: '1px' }}
                >
                  {getPrice(commodity.symbol)}
                </span>
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

              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    background: loading ? 'var(--muted)' : error ? 'var(--red)' : 'var(--accent)',
                    flexShrink: 0,
                    animation: (!loading && !error) ? 'check-pulse 2s ease-in-out infinite' : 'none',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '13px',
                    color: 'var(--muted)',
                  }}
                >
                  {loading ? 'loading...' : error ? 'unavailable' : 'live feed'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* APAC note — styled as an in-game notice */}
        <div
          style={{
            background: 'var(--card)',
            border: '2px solid var(--gold)',
            boxShadow: '0 -2px 0 0 var(--gold), 0 2px 0 0 var(--gold), -2px 0 0 0 var(--gold), 2px 0 0 0 var(--gold)',
            padding: '16px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '20px',
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
                fontSize: '15px',
                color: 'var(--muted)',
                margin: '8px 0 0',
              }}
            >
              ⏱ Last oracle update: {new Date(prices.updatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
