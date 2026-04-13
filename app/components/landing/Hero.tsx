'use client'

import Link from 'next/link'

const commodityRow = [
  { sprite: '/sprites/rice.png', symbol: 'RICE', color: '#f0c060' },
  { sprite: '/sprites/coffee.png', symbol: 'COFFEE', color: '#c08040' },
  { sprite: '/sprites/corn.png', symbol: 'CORN', color: '#f0e060' },
  { sprite: '/sprites/cpo.png', symbol: 'CPO', color: '#80c060' },
]

const heroKeyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.7; }
}
@keyframes bounce-item {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-6px) scale(1.08); }
}
@keyframes glow-pulse {
  0%, 100% { text-shadow: 4px 4px 0px #1a3a1a, 0 0 20px rgba(123,198,122,0.3); }
  50% { text-shadow: 4px 4px 0px #1a3a1a, 0 0 40px rgba(123,198,122,0.6), 0 0 80px rgba(123,198,122,0.2); }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
`

const stars = [
  { top: '6%', left: '10%', delay: '0s', size: 3 },
  { top: '12%', left: '75%', delay: '0.5s', size: 2 },
  { top: '22%', left: '55%', delay: '1.2s', size: 2 },
  { top: '4%', left: '38%', delay: '0.8s', size: 3 },
  { top: '16%', left: '85%', delay: '1.5s', size: 2 },
  { top: '28%', left: '4%', delay: '0.3s', size: 2 },
  { top: '10%', left: '62%', delay: '1.8s', size: 3 },
  { top: '3%', left: '52%', delay: '2.1s', size: 2 },
  { top: '20%', left: '20%', delay: '0.6s', size: 2 },
  { top: '8%', left: '90%', delay: '1.0s', size: 3 },
]

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #020810 0%, #06101e 25%, #0a1628 45%, #0d1a12 70%, #111e14 100%)',
        paddingTop: '110px',
        paddingBottom: '0px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{heroKeyframes}</style>

      {/* Subtle pixel grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,124,89,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,89,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(2,8,16,0.6) 100%)',
        }}
      />

      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: '#e8f5e8',
            animation: `twinkle ${1.5 + i * 0.3}s ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}

      {/* Moon with glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '8%',
          right: '12%',
          width: '20px',
          height: '20px',
          background: '#f0c060',
          boxShadow: '0 0 20px rgba(240,192,96,0.5), 0 0 60px rgba(240,192,96,0.15)',
        }}
      />

      {/* Dark ground silhouette */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(180deg, transparent 0%, #060e06 30%, #040a04 100%)',
        }}
      />

      {/* Silhouette trees left */}
      <div className="absolute bottom-0 left-0 pointer-events-none hidden md:flex items-end" style={{ opacity: 0.3 }}>
        <div style={{ width: '40px', height: '56px', background: '#0a140a', marginRight: '-4px' }} />
        <div style={{ width: '32px', height: '40px', background: '#0a140a', borderRadius: '50% 50% 0 0' }} />
        <div style={{ width: '48px', height: '72px', background: '#081008', marginLeft: '-8px' }} />
      </div>

      {/* Silhouette trees right */}
      <div className="absolute bottom-0 right-0 pointer-events-none hidden md:flex items-end" style={{ opacity: 0.3 }}>
        <div style={{ width: '48px', height: '68px', background: '#081008', marginRight: '-8px' }} />
        <div style={{ width: '32px', height: '36px', background: '#0a140a', borderRadius: '50% 50% 0 0' }} />
        <div style={{ width: '44px', height: '60px', background: '#0a140a' }} />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-6 text-center" style={{ paddingBottom: '80px' }}>

        {/* HashKey Chain badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(240,192,96,0.08)',
            border: '1px solid rgba(240,192,96,0.25)',
            padding: '6px 16px',
            marginBottom: '24px',
            animation: 'fade-in 0.6s ease-out forwards',
          }}
        >
          <div style={{ width: '6px', height: '6px', background: 'var(--accent)', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: 'var(--gold)',
              letterSpacing: '1px',
            }}
          >
            BUILT ON HASHKEY CHAIN
          </span>
          <div style={{ width: '6px', height: '6px', background: 'var(--accent)', flexShrink: 0 }} />
        </div>

        {/* Title */}
        <h1
          className="pixel-font"
          style={{
            fontSize: 'clamp(32px, 7vw, 64px)',
            color: 'var(--accent)',
            animation: 'glow-pulse 4s ease-in-out infinite',
            lineHeight: '1.3',
            marginBottom: '12px',
          }}
        >
          HarvestDEX
        </h1>

        {/* Subtitle with decorative line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border))' }} />
          <p
            className="pixel-font"
            style={{
              fontSize: 'clamp(7px, 1.2vw, 10px)',
              color: 'var(--gold)',
              lineHeight: '2',
              textShadow: '2px 2px 0px #6b4a00',
              whiteSpace: 'nowrap',
            }}
          >
            TRADE REAL CROPS ON-CHAIN
          </p>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(270deg, transparent, var(--border))' }} />
        </div>

        {/* Farmer mascot — bigger */}
        <div
          style={{
            animation: 'float 3s ease-in-out infinite',
            display: 'inline-block',
            filter: 'drop-shadow(0 12px 8px rgba(0,0,0,0.7))',
            marginBottom: '20px',
          }}
        >
          <img
            src="/sprites/farmer-south.png"
            alt="Farmer"
            width={88}
            height={88}
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '22px',
            color: 'var(--muted)',
            fontFamily: "'VT323', monospace",
            maxWidth: '500px',
            lineHeight: '1.5',
            marginBottom: '28px',
            animation: 'slide-up 0.8s ease-out 0.2s backwards',
          }}
        >
          Spot trade agricultural commodities, open leveraged long/short positions, and earn USDC fees as a liquidity provider.
        </p>

        {/* Inventory bar — 4 commodity sprites */}
        <div
          className="flex justify-center gap-2 flex-wrap"
          style={{
            background: 'rgba(5,10,5,0.8)',
            border: '2px solid var(--border)',
            boxShadow: '0 -2px 0 0 var(--border), 0 2px 0 0 var(--border), -2px 0 0 0 var(--border), 2px 0 0 0 var(--border), inset 0 0 30px rgba(0,0,0,0.5)',
            padding: '10px 16px',
            display: 'inline-flex',
            marginBottom: '32px',
            animation: 'slide-up 0.8s ease-out 0.4s backwards',
          }}
        >
          {commodityRow.map(({ sprite, symbol, color }, idx) => (
            <div
              key={symbol}
              className="flex flex-col items-center gap-1"
              style={{
                padding: '8px 14px',
                background: 'rgba(36,51,36,0.6)',
                border: '2px solid var(--border)',
                animation: `bounce-item ${2.2 + idx * 0.3}s ease-in-out ${idx * 0.15}s infinite`,
                minWidth: '68px',
                cursor: 'default',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = color }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <img
                src={sprite}
                alt={symbol}
                width={44}
                height={44}
                style={{ imageRendering: 'pixelated' }}
              />
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '6px',
                  color: color,
                }}
              >
                {symbol}
              </span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          className="flex justify-center gap-4 flex-wrap"
          style={{ animation: 'slide-up 0.8s ease-out 0.6s backwards' }}
        >
          <Link href="/trade">
            <button
              className="pixel-btn pixel-btn-primary"
              style={{
                fontSize: '11px',
                padding: '14px 32px',
                letterSpacing: '1px',
              }}
            >
              ENTER MARKET
            </button>
          </Link>
          <a
            href="https://github.com/HarvestDEX"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="pixel-btn"
              style={{
                background: 'rgba(26,46,26,0.6)',
                color: 'var(--muted)',
                borderColor: 'var(--border)',
                fontSize: '11px',
                padding: '14px 32px',
                letterSpacing: '1px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--white)'
                e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              VIEW SOURCE
            </button>
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            animation: 'float 2s ease-in-out infinite',
            opacity: 0.4,
          }}
        >
          <span style={{ fontFamily: "'VT323', monospace", fontSize: '14px', color: 'var(--muted)' }}>
            scroll
          </span>
          <div style={{ width: '2px', height: '12px', background: 'var(--muted)' }} />
          <div style={{ width: '8px', height: '8px', borderRight: '2px solid var(--muted)', borderBottom: '2px solid var(--muted)', transform: 'rotate(45deg)', marginTop: '-6px' }} />
        </div>
      </div>
    </section>
  )
}
