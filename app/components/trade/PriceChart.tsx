'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { COMMODITIES } from '../../lib/constants'

type CommoditySymbol = 'RICE' | 'COFFEE' | 'CORN' | 'CPO'

interface PricePoint {
  price: number
  time: string
}

const TIME_OPTIONS = [
  { label: '6H', hours: 6 },
  { label: '24H', hours: 24 },
  { label: '3D', hours: 72 },
  { label: '7D', hours: 168 },
]

export default function PriceChart() {
  const [symbol, setSymbol] = useState<CommoditySymbol>('RICE')
  const [timeRange, setTimeRange] = useState(24)
  const [data, setData] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<{ price: number; time: string; x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const commodity = COMMODITIES.find((c) => c.symbol === symbol)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/v1/price-history?symbol=${symbol}&hours=${timeRange}`)
      if (!res.ok) throw new Error('fetch failed')
      const json = await res.json()
      setData(json.data || [])
    } catch {
      setError(true)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [symbol, timeRange])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || data.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    const w = rect.width
    const h = 200

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, w, h)

    const prices = data.map((d) => d.price)
    const minP = Math.min(...prices)
    const maxP = Math.max(...prices)
    const range = maxP - minP || 1
    const padding = { top: 16, bottom: 24, left: 0, right: 0 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    const toX = (i: number) => padding.left + (i / (data.length - 1)) * chartW
    const toY = (price: number) => padding.top + chartH - ((price - minP) / range) * chartH

    // Determine color based on price trend
    const isUp = prices[prices.length - 1] >= prices[0]
    const lineColor = isUp ? '#7bc67a' : '#e05050'
    const fillColor = isUp ? 'rgba(123,198,122,0.08)' : 'rgba(224,80,80,0.08)'

    // Grid lines (horizontal)
    ctx.strokeStyle = 'rgba(74,124,89,0.15)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()
    }

    // Fill area under line
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(prices[0]))
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(toX(i), toY(prices[i]))
    }
    ctx.lineTo(toX(data.length - 1), padding.top + chartH)
    ctx.lineTo(toX(0), padding.top + chartH)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.fill()

    // Draw line
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(prices[0]))
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(toX(i), toY(prices[i]))
    }
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 2
    ctx.stroke()

    // End dot
    const lastX = toX(data.length - 1)
    const lastY = toY(prices[prices.length - 1])
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = lineColor
    ctx.fill()

    // Glow on end dot
    ctx.beginPath()
    ctx.arc(lastX, lastY, 8, 0, Math.PI * 2)
    ctx.fillStyle = isUp ? 'rgba(123,198,122,0.2)' : 'rgba(224,80,80,0.2)'
    ctx.fill()

    // Price labels on right
    ctx.fillStyle = '#6b8f6b'
    ctx.font = '12px VT323, monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`$${maxP.toFixed(2)}`, w - 4, padding.top + 12)
    ctx.fillText(`$${minP.toFixed(2)}`, w - 4, padding.top + chartH - 2)

  }, [data])

  // Handle mouse move on canvas for hover tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (data.length < 2 || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const w = rect.width
    const idx = Math.round((x / w) * (data.length - 1))
    const clamped = Math.max(0, Math.min(data.length - 1, idx))
    const point = data[clamped]
    if (point) {
      const padding = { top: 16, bottom: 24 }
      const chartH = 200 - padding.top - padding.bottom
      const prices = data.map((d) => d.price)
      const minP = Math.min(...prices)
      const maxP = Math.max(...prices)
      const range = maxP - minP || 1
      const y = padding.top + chartH - ((point.price - minP) / range) * chartH
      setHoveredPoint({ price: point.price, time: point.time, x: (clamped / (data.length - 1)) * w, y })
    }
  }, [data])

  const priceChange = data.length >= 2
    ? ((data[data.length - 1].price - data[0].price) / data[0].price * 100)
    : 0
  const isUp = priceChange >= 0

  return (
    <div className="pixel-card" style={{ padding: '16px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '16px' }}>📈</span>
          <span className="pixel-font text-[10px]" style={{ color: 'var(--gold)' }}>PRICE CHART</span>
        </div>

        {/* Time range */}
        <div className="flex gap-1">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.hours}
              onClick={() => setTimeRange(opt.hours)}
              className="pixel-btn"
              style={{
                padding: '2px 8px',
                fontSize: '8px',
                background: timeRange === opt.hours ? 'var(--accent)' : 'var(--surface)',
                borderColor: timeRange === opt.hours ? 'var(--accent)' : 'var(--border)',
                color: timeRange === opt.hours ? 'var(--bg)' : 'var(--muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity selector */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {COMMODITIES.map((c) => (
          <button
            key={c.symbol}
            onClick={() => setSymbol(c.symbol as CommoditySymbol)}
            className="pixel-btn"
            style={{
              padding: '4px 8px',
              fontSize: '8px',
              background: symbol === c.symbol ? 'var(--surface)' : 'transparent',
              borderColor: symbol === c.symbol ? c.color : 'var(--border)',
              color: symbol === c.symbol ? c.color : 'var(--muted)',
            }}
          >
            <img
              src={c.sprite}
              alt={c.name}
              width={16}
              height={16}
              style={{ imageRendering: 'pixelated', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}
            />
            {c.symbol}
          </button>
        ))}
      </div>

      {/* Current price + change */}
      {data.length > 0 && (
        <div className="flex items-center gap-3 mb-2">
          {commodity && (
            <img src={commodity.sprite} alt="" width={28} height={28} style={{ imageRendering: 'pixelated' }} />
          )}
          <span style={{ fontFamily: "'VT323', monospace", fontSize: '28px', color: 'var(--gold)' }}>
            ${data[data.length - 1].price.toFixed(2)}
          </span>
          <span
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: isUp ? 'var(--accent)' : 'var(--red)',
            }}
          >
            {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
          </span>
        </div>
      )}

      {/* Chart area */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
          borderRadius: '0',
        }}
      >
        {loading && (
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'VT323', monospace",
            fontSize: '18px',
            color: 'var(--muted)',
          }}>
            Loading chart data...
          </div>
        )}

        {error && (
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'VT323', monospace",
            fontSize: '18px',
            color: 'var(--muted)',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <span>No price history yet</span>
            <span style={{ fontSize: '14px' }}>Chart data will appear after first cron run</span>
          </div>
        )}

        {!loading && !error && data.length < 2 && (
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'VT323', monospace",
            fontSize: '18px',
            color: 'var(--muted)',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <span>Not enough data points</span>
            <span style={{ fontSize: '14px' }}>Prices are recorded every 10 minutes</span>
          </div>
        )}

        {!loading && !error && data.length >= 2 && (
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
            style={{ display: 'block', cursor: 'crosshair' }}
          />
        )}

        {/* Hover tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(hoveredPoint.x, (containerRef.current?.getBoundingClientRect().width || 200) - 120),
              top: Math.max(0, hoveredPoint.y - 48),
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              padding: '4px 8px',
              pointerEvents: 'none',
              zIndex: 10,
              fontFamily: "'VT323', monospace",
              fontSize: '14px',
            }}
          >
            <div style={{ color: 'var(--gold)' }}>${hoveredPoint.price.toFixed(4)}</div>
            <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
              {new Date(hoveredPoint.time).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
