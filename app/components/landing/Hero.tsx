'use client'

import Link from 'next/link'

const commodityRow = [
  { sprite: '/sprites/rice.png', symbol: 'RICE' },
  { sprite: '/sprites/coffee.png', symbol: 'COFFEE' },
  { sprite: '/sprites/corn.png', symbol: 'CORN' },
  { sprite: '/sprites/cpo.png', symbol: 'CPO' },
]

const floatKeyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}
@keyframes bounce-item {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-4px) scale(1.05); }
}
`

const stars = [
  { top: '8%', left: '12%', delay: '0s', size: 3 },
  { top: '15%', left: '78%', delay: '0.5s', size: 2 },
  { top: '25%', left: '55%', delay: '1.2s', size: 2 },
  { top: '5%', left: '40%', delay: '0.8s', size: 3 },
  { top: '18%', left: '88%', delay: '1.5s', size: 2 },
  { top: '30%', left: '5%', delay: '0.3s', size: 2 },
  { top: '12%', left: '65%', delay: '1.8s', size: 3 },
]

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050d1a 0%, #0a1628 20%, #0f1a0f 55%, #1a2e1a 100%)',
        paddingTop: '60px',
        paddingBottom: '0px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{floatKeyframes}</style>

      {/* Pixel grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,124,89,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,89,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
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
            opacity: 0.4,
            animation: `twinkle ${1.5 + i * 0.4}s ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}

      {/* Moon */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '6%',
          right: '8%',
          width: '28px',
          height: '28px',
          background: '#f0c060',
          boxShadow: '0 0 12px rgba(240,192,96,0.4)',
          imageRendering: 'pixelated',
        }}
      />

      {/* Left trees */}
      <div className="absolute bottom-0 left-0 pointer-events-none flex items-end">
        <img src="/sprites/tree.png" alt="" width={48} height={64} style={{ imageRendering: 'pixelated', opacity: 0.9 }} />
        <img src="/sprites/tree.png" alt="" width={48} height={64} style={{ imageRendering: 'pixelated', opacity: 0.7, marginLeft: '-8px', marginBottom: '-8px' }} />
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.8 }} />
      </div>

      {/* Right trees */}
      <div className="absolute bottom-0 right-0 pointer-events-none flex items-end">
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.8 }} />
        <img src="/sprites/tree.png" alt="" width={48} height={64} style={{ imageRendering: 'pixelated', opacity: 0.7, marginLeft: '-8px', marginBottom: '-8px' }} />
        <img src="/sprites/tree.png" alt="" width={48} height={64} style={{ imageRendering: 'pixelated', opacity: 0.9 }} />
      </div>

      {/* Signpost left */}
      <div className="absolute pointer-events-none hidden md:block" style={{ bottom: '32px', left: '10%' }}>
        <img src="/sprites/signpost.png" alt="" width={48} height={64} style={{ imageRendering: 'pixelated', opacity: 0.7 }} />
      </div>

      {/* Well right */}
      <div className="absolute pointer-events-none hidden md:block" style={{ bottom: '32px', right: '10%' }}>
        <img src="/sprites/well.png" alt="" width={48} height={56} style={{ imageRendering: 'pixelated', opacity: 0.7 }} />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 text-center pb-20">

        {/* Game badge */}
        <div
          className="inline-block mb-6 px-4 py-2 text-xs"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--gold)',
            color: 'var(--gold)',
            fontFamily: "'Press Start 2P', monospace",
            boxShadow: '0 -2px 0 0 var(--gold), 0 2px 0 0 var(--gold), -2px 0 0 0 var(--gold), 2px 0 0 0 var(--gold)',
            fontSize: '8px',
          }}
        >
          ★ PRESS START ★
        </div>

        {/* Title */}
        <h1
          className="pixel-font mb-2"
          style={{
            fontSize: 'clamp(28px, 6vw, 56px)',
            color: 'var(--accent)',
            textShadow: '4px 4px 0px #1a3a1a, 0 0 24px rgba(123,198,122,0.4)',
            lineHeight: '1.4',
          }}
        >
          HarvestDEX
        </h1>

        {/* Subtitle */}
        <p
          className="pixel-font mb-8"
          style={{
            fontSize: 'clamp(8px, 1.5vw, 12px)',
            color: 'var(--gold)',
            lineHeight: '2.2',
            textShadow: '2px 2px 0px #6b4a00',
          }}
        >
          Welcome to the Harvest Market
        </p>

        {/* Farmer mascot */}
        <div
          className="mb-8"
          style={{
            animation: 'float 3s ease-in-out infinite',
            display: 'inline-block',
            filter: 'drop-shadow(0 8px 0px rgba(0,0,0,0.5))',
          }}
        >
          <img
            src="/sprites/farmer-south.png"
            alt="Farmer"
            width={68}
            height={68}
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Description */}
        <p
          className="mb-8"
          style={{
            fontSize: '20px',
            color: 'var(--muted)',
            fontFamily: "'VT323', monospace",
            maxWidth: '440px',
            lineHeight: '1.6',
          }}
        >
          A pixel farming marketplace where you trade real crops, open positions at the barn, and earn gold from every harvest.
        </p>

        {/* Inventory bar — 4 commodity sprites */}
        <div
          className="flex justify-center gap-3 mb-10 flex-wrap"
          style={{
            background: 'rgba(10,18,10,0.7)',
            border: '2px solid var(--border)',
            boxShadow: '0 -2px 0 0 var(--border), 0 2px 0 0 var(--border), -2px 0 0 0 var(--border), 2px 0 0 0 var(--border)',
            padding: '12px 20px',
            display: 'inline-flex',
          }}
        >
          {commodityRow.map(({ sprite, symbol }, idx) => (
            <div
              key={symbol}
              className="flex flex-col items-center gap-1"
              style={{
                padding: '8px 12px',
                background: 'var(--card)',
                border: '2px solid var(--border)',
                animation: `bounce-item ${2 + idx * 0.3}s ease-in-out ${idx * 0.2}s infinite`,
                minWidth: '64px',
              }}
            >
              <img
                src={sprite}
                alt={symbol}
                width={40}
                height={40}
                style={{ imageRendering: 'pixelated' }}
              />
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '6px',
                  color: 'var(--gold)',
                }}
              >
                {symbol}
              </span>
            </div>
          ))}
        </div>

        {/* RPG-style CTA buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/trade">
            <button
              className="pixel-btn pixel-btn-primary"
              style={{ fontSize: '10px', padding: '12px 24px' }}
            >
              ▶ ENTER MARKET
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
                background: 'transparent',
                color: 'var(--white)',
                borderColor: 'var(--border)',
                fontSize: '10px',
                padding: '12px 24px',
              }}
            >
              📜 VIEW MAP
            </button>
          </a>
        </div>

        {/* Ground strip */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '28px',
            background: '#1a3a10',
            borderTop: '4px solid #2a5a18',
          }}
        />
      </div>
    </section>
  )
}
