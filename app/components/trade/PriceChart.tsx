'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { COMMODITIES } from '../../lib/constants'

type CommoditySymbol = 'RICE' | 'COFFEE' | 'CORN' | 'CPO'

interface PricePoint {
  price: number
  time: string
}

const BASE_PRICES: Record<string, number> = {
  RICE: 17.55,
  COFFEE: 427.80,
  CORN: 7.31,
  CPO: 1180.64,
}

const TIME_OPTIONS = [
  { label: '6H', hours: 6 },
  { label: '24H', hours: 24 },
  { label: '3D', hours: 72 },
  { label: '7D', hours: 168 },
]

// Generate realistic simulated price history with random walk
function generateSimulatedHistory(symbol: string, hours: number): PricePoint[] {
  const basePrice = BASE_PRICES[symbol] || 17.55
  const points: PricePoint[] = []
  const intervalMin = 10 // every 10 minutes
  const totalPoints = Math.floor((hours * 60) / intervalMin)
  const now = Date.now()

  let price = basePrice * (1 + (Math.random() - 0.5) * 0.04) // start with slight offset

  for (let i = totalPoints; i >= 0; i--) {
    const time = new Date(now - i * intervalMin * 60 * 1000).toISOString()
    // Random walk: small changes each step
    const volatility = basePrice * 0.002 // 0.2% per step
    price += (Math.random() - 0.48) * volatility // slight upward bias
    price = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, price)) // clamp +-10%
    points.push({ price: parseFloat(price.toFixed(4)), time })
  }

  return points
}

export default function PriceChart() {
  const [symbol, setSymbol] = useState<CommoditySymbol>('RICE')
  const [timeRange, setTimeRange] = useState(24)
  const [dbData, setDbData] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<{ price: number; time: string; x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate stable simulated data per symbol+timeRange combo
  const [simSeed, setSimSeed] = useState(0)
  const simulatedData = useMemo(
    () => generateSimulatedHistory(symbol, timeRange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol, timeRange, simSeed]
  )

  // Use DB data if available (2+ points), otherwise simulated
  const data = dbData.length >= 2 ? dbData : simulatedData

  const commodity = COMMODITIES.find((c) => c.symbol === symbol)

  // Try to fetch from DB (non-blocking, fallback to simulated)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/v1/price-history?symbol=${symbol}&hours=${timeRange}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!cancelled && json?.data?.length >= 2) {
          setDbData(json.data)
        } else {
          setDbData([])
        }
      })
      .catch(() => { if (!cancelled) setDbData([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [symbol, timeRange])

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
    const h = rect.height || 160

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, w, h)

    const prices = data.map((d) => d.price)
    const minP = Math.min(...prices)
    const maxP = Math.max(...prices)
    const range = maxP - minP || 1
    const padding = { top: 10, bottom: 16, left: 0, right: 0 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    const toX = (i: number) => padding.left + (i / (data.length - 1)) * chartW
    const toY = (price: number) => padding.top + chartH - ((price - minP) / range) * chartH

    const isUp = prices[prices.length - 1] >= prices[0]
    const lineColor = isUp ? '#7bc67a' : '#e05050'
    const fillColor = isUp ? 'rgba(123,198,122,0.08)' : 'rgba(224,80,80,0.08)'

    // Grid lines
    ctx.strokeStyle = 'rgba(74,124,89,0.12)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartH / 3) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()
    }

    // Fill area
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(prices[0]))
    for (let i = 1; i < data.length; i++) ctx.lineTo(toX(i), toY(prices[i]))
    ctx.lineTo(toX(data.length - 1), padding.top + chartH)
    ctx.lineTo(toX(0), padding.top + chartH)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.fill()

    // Line
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(prices[0]))
    for (let i = 1; i < data.length; i++) ctx.lineTo(toX(i), toY(prices[i]))
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1.5
    ctx.stroke()

    // End dot + glow
    const lastX = toX(data.length - 1)
    const lastY = toY(prices[prices.length - 1])
    ctx.beginPath()
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2)
    ctx.fillStyle = lineColor
    ctx.fill()
    ctx.beginPath()
    ctx.arc(lastX, lastY, 6, 0, Math.PI * 2)
    ctx.fillStyle = isUp ? 'rgba(123,198,122,0.2)' : 'rgba(224,80,80,0.2)'
    ctx.fill()

    // Price labels
    ctx.fillStyle = '#6b8f6b'
    ctx.font = '11px VT323, monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`$${maxP.toFixed(2)}`, w - 4, padding.top + 10)
    ctx.fillText(`$${minP.toFixed(2)}`, w - 4, padding.top + chartH - 2)
  }, [data])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (data.length < 2 || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const w = rect.width
    const idx = Math.round((x / w) * (data.length - 1))
    const clamped = Math.max(0, Math.min(data.length - 1, idx))
    const point = data[clamped]
    if (point) {
      const padding = { top: 10, bottom: 16 }
      const h = rect.height || 160
      const chartH = h - padding.top - padding.bottom
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
        <div className="flex items-center gap-2">
          {commodity && (
            <img src={commodity.sprite} alt="" width={20} height={20} style={{ imageRendering: 'pixelated' }} />
          )}
          <span className="pixel-font text-[9px]" style={{ color: 'var(--gold)' }}>
            {symbol}
          </span>
          {data.length > 0 && (
            <>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: '22px', color: 'var(--gold)' }}>
                ${data[data.length - 1].price.toFixed(2)}
              </span>
              <span style={{
                fontFamily: "'VT323', monospace", fontSize: '15px',
                color: isUp ? 'var(--accent)' : 'var(--red)',
              }}>
                {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
              </span>
            </>
          )}
        </div>

        <div className="flex gap-1">
          {TIME_OPTIONS.map((opt) => (
            <button key={opt.hours} onClick={() => setTimeRange(opt.hours)}
              style={{
                padding: '1px 6px', fontSize: '8px', cursor: 'pointer',
                fontFamily: 'Press Start 2P, monospace',
                background: timeRange === opt.hours ? 'var(--accent)' : 'transparent',
                border: `1px solid ${timeRange === opt.hours ? 'var(--accent)' : 'var(--border)'}`,
                color: timeRange === opt.hours ? 'var(--bg)' : 'var(--muted)',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity tabs */}
      <div className="flex gap-1 mb-1">
        {COMMODITIES.map((c) => (
          <button key={c.symbol} onClick={() => setSymbol(c.symbol as CommoditySymbol)}
            style={{
              padding: '2px 6px', fontSize: '8px', cursor: 'pointer',
              fontFamily: 'Press Start 2P, monospace',
              background: symbol === c.symbol ? 'var(--surface)' : 'transparent',
              border: `1px solid ${symbol === c.symbol ? c.color : 'transparent'}`,
              color: symbol === c.symbol ? c.color : 'var(--muted)',
            }}>
            <img src={c.sprite} alt={c.name} width={12} height={12}
              style={{ imageRendering: 'pixelated', display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
            {c.symbol}
          </button>
        ))}
      </div>

      {/* Chart area — fills remaining space */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '80px',
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid var(--border)',
        }}
      >
        {data.length >= 2 && (
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
            style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
          />
        )}

        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            left: Math.min(hoveredPoint.x, (containerRef.current?.getBoundingClientRect().width || 200) - 110),
            top: Math.max(0, hoveredPoint.y - 40),
            background: 'var(--surface)', border: '1px solid var(--border)',
            padding: '2px 6px', pointerEvents: 'none', zIndex: 10,
            fontFamily: "'VT323', monospace", fontSize: '13px',
          }}>
            <div style={{ color: 'var(--gold)' }}>${hoveredPoint.price.toFixed(4)}</div>
            <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
              {new Date(hoveredPoint.time).toLocaleString()}
            </div>
          </div>
        )}

        {dbData.length < 2 && !loading && (
          <div style={{
            position: 'absolute', bottom: '4px', right: '6px',
            fontFamily: "'VT323', monospace", fontSize: '11px', color: 'var(--muted)',
            opacity: 0.6,
          }}>
            simulated data
          </div>
        )}
      </div>
    </div>
  )
}
