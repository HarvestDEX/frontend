'use client'

import Link from 'next/link'

const commodityRow = [
  { sprite: '/sprites/rice.png', symbol: 'RICE' },
  { sprite: '/sprites/coffee.png', symbol: 'COFFEE' },
  { sprite: '/sprites/corn.png', symbol: 'CORN' },
  { sprite: '/sprites/cpo.png', symbol: 'CPO' },
]

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a120a 0%, #0f1a0f 40%, #1a2e1a 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      {/* Pixel grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,124,89,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,89,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Stars / dots decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '10%', left: '5%' },
          { top: '20%', left: '90%' },
          { top: '60%', left: '3%' },
          { top: '75%', left: '85%' },
          { top: '35%', left: '92%' },
          { top: '50%', left: '8%' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-1 h-1"
            style={{ ...pos, background: 'var(--accent)', opacity: 0.4 }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div
          className="inline-block mb-6 px-4 py-1 text-xs"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            color: 'var(--accent)',
            fontFamily: "'Press Start 2P', monospace",
          }}
        >
          HashKey Chain Testnet
        </div>

        {/* Title */}
        <h1
          className="pixel-font mb-4"
          style={{
            fontSize: 'clamp(24px, 5vw, 48px)',
            color: 'var(--accent)',
            textShadow: '4px 4px 0px #2a4c2a',
            lineHeight: '1.6',
          }}
        >
          HarvestDEX
        </h1>

        {/* Subtitle */}
        <p
          className="pixel-font mb-4"
          style={{
            fontSize: 'clamp(10px, 2vw, 16px)',
            color: 'var(--gold)',
            lineHeight: '2',
          }}
        >
          Trade Real Crops On-Chain
        </p>

        {/* Description */}
        <p
          className="mb-10"
          style={{
            fontSize: '20px',
            color: 'var(--muted)',
            fontFamily: "'VT323', monospace",
            maxWidth: '500px',
            margin: '0 auto 40px',
          }}
        >
          Live commodity prices. Spot &amp; Perp. HashKey Chain.
        </p>

        {/* Commodity Row */}
        <div className="flex justify-center gap-6 mb-10 flex-wrap">
          {commodityRow.map(({ sprite, symbol }) => (
            <div
              key={symbol}
              className="pixel-card flex flex-col items-center gap-2"
              style={{ minWidth: '80px', padding: '12px 16px' }}
            >
              <img src={sprite} alt={symbol} width={40} height={40} style={{ imageRendering: 'pixelated' }} />
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: 'var(--accent)',
                }}
              >
                {symbol}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/trade">
            <button className="pixel-btn pixel-btn-primary" style={{ fontSize: '10px' }}>
              ▶ PLAY DEMO
            </button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <button
              className="pixel-btn"
              style={{
                background: 'transparent',
                color: 'var(--white)',
                borderColor: 'var(--border)',
                fontSize: '10px',
              }}
            >
              VIEW GITHUB
            </button>
          </a>
        </div>
      </div>
    </section>
  )
}
