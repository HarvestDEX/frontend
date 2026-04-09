'use client'

import Link from 'next/link'
import { EXPLORER_URL } from '../../lib/constants'

const links = [
  { label: 'Demo', href: '/trade', external: false },
  { label: 'GitHub', href: 'https://github.com', external: true },
  { label: 'DoraHacks', href: 'https://dorahacks.io/hackathon/2045', external: true },
  { label: 'Explorer', href: EXPLORER_URL, external: true },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--surface)',
        borderTop: '2px solid var(--border)',
        padding: '48px 24px 32px',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Logo row */}
        <div className="flex justify-center mb-8">
          <span
            className="pixel-font"
            style={{ fontSize: '14px', color: 'var(--accent)' }}
          >
            🌾 HarvestDEX
          </span>
        </div>

        {/* Links row */}
        <nav className="flex justify-center flex-wrap gap-6 mb-8">
          {links.map(({ label, href, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  transition: 'color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Divider */}
        <div
          style={{
            borderTop: '2px solid var(--border)',
            marginBottom: '24px',
          }}
        />

        {/* Hackathon info */}
        <p
          className="text-center mb-3"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: 'var(--muted)',
            lineHeight: '2',
          }}
        >
          HashKey Chain Horizon Hackathon 2026 · DeFi Track
        </p>

        {/* Chain info */}
        <p
          className="text-center mb-3"
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: '16px',
            color: 'var(--muted)',
          }}
        >
          HashKey Chain Testnet — Chain ID: 133
        </p>

        {/* Built with */}
        <p
          className="text-center"
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: '18px',
            color: 'var(--border)',
          }}
        >
          Built with 🌾 on HashKey Chain
        </p>
      </div>
    </footer>
  )
}
