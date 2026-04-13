'use client'

import Link from 'next/link'
import { EXPLORER_URL } from '../../lib/constants'

const links = [
  { label: 'ENTER MARKET', href: '/trade', external: false },
  { label: 'GITHUB', href: 'https://github.com/HarvestDEX', external: true },
  { label: 'DORAHACKS', href: 'https://dorahacks.io/hackathon/2045', external: true },
  { label: 'EXPLORER', href: EXPLORER_URL, external: true },
]

const walkKeyframes = `
@keyframes walk-right {
  0% { transform: translateX(-20px); }
  100% { transform: translateX(20px); }
}
@keyframes hud-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
`

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--surface)',
        borderTop: '4px solid var(--border)',
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{walkKeyframes}</style>

      {/* Ground / grass strip at top of footer */}
      <div
        style={{
          height: '24px',
          background: 'linear-gradient(180deg, var(--bg), #1a3a10)',
          borderBottom: '4px solid #2a5a18',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Walking farmer */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '50%',
            animation: 'walk-right 4s ease-in-out infinite alternate',
          }}
        >
          <img
            src="/sprites/farmer-east.png"
            alt="farmer"
            width={34}
            height={34}
            style={{ imageRendering: 'pixelated', display: 'block' }}
          />
        </div>
      </div>

      {/* Main footer content */}
      <div
        style={{
          padding: '40px 24px 28px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* HUD top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          {/* Logo with farmer sprite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/sprites/farmer-south.png"
              alt="farmer"
              width={34}
              height={34}
              style={{ imageRendering: 'pixelated' }}
            />
            <span
              className="pixel-font"
              style={{ fontSize: '12px', color: 'var(--accent)' }}
            >
              HarvestDEX
            </span>
          </div>

          {/* Divider pixel */}
          <div style={{ width: '4px', height: '4px', background: 'var(--border)' }} />

          {/* Hackathon badge */}
          <div
            style={{
              background: 'var(--card)',
              border: '2px solid var(--gold)',
              boxShadow: '0 -2px 0 0 var(--gold), 0 2px 0 0 var(--gold), -2px 0 0 0 var(--gold), 2px 0 0 0 var(--gold)',
              padding: '4px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: 'var(--gold)',
                animation: 'hud-blink 2.5s ease-in-out infinite',
              }}
            >
              ★ HACKATHON 2026 ★
            </span>
          </div>
        </div>

        {/* Nav links as pixel buttons */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          {links.map(({ label, href, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '7px',
                    color: 'var(--muted)',
                    border: '2px solid var(--border)',
                    padding: '6px 12px',
                    background: 'var(--card)',
                    cursor: 'pointer',
                    boxShadow: 'inset -2px -2px 0 0 rgba(0,0,0,0.4), inset 2px 2px 0 0 rgba(255,255,255,0.05)',
                    transition: 'color 0.1s, border-color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--muted)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {label}
                </div>
              </a>
            ) : (
              <Link key={label} href={href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '7px',
                    color: 'var(--accent)',
                    border: '2px solid var(--accent)',
                    padding: '6px 12px',
                    background: 'var(--card)',
                    cursor: 'pointer',
                    boxShadow: 'inset -2px -2px 0 0 #2a4c2a, inset 2px 2px 0 0 #9be09a',
                  }}
                >
                  ▶ {label}
                </div>
              </Link>
            )
          )}
        </nav>

        {/* Pixel divider */}
        <div
          style={{
            height: '4px',
            background: `repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 8px, transparent 8px, transparent 16px)`,
            marginBottom: '20px',
            opacity: 0.6,
          }}
        />

        {/* HUD info row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          {/* Chain info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--card)',
              border: '2px solid var(--border)',
              padding: '4px 10px',
            }}
          >
            <div style={{ width: '6px', height: '6px', background: 'var(--accent)' }} />
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '16px',
                color: 'var(--muted)',
              }}
            >
              HashKey Testnet · Chain ID: 133
            </span>
          </div>

          {/* DeFi track */}
          <div
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '16px',
              color: 'var(--muted)',
            }}
          >
            DeFi Track
          </div>
        </div>

        {/* Bottom credits */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: "'VT323', monospace",
            fontSize: '18px',
            color: 'var(--border)',
            margin: 0,
          }}
        >
          Built with 🌾 on HashKey Chain · HashKey Chain Horizon Hackathon 2026
        </p>
      </div>
    </footer>
  )
}
