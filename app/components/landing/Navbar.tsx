'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="pixel-navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(15,26,15,0.92)' : 'transparent',
        borderBottom: scrolled ? '2px solid var(--border)' : '2px solid transparent',
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        boxShadow: scrolled ? '0 4px 0 0 rgba(0,0,0,0.3)' : 'none',
        padding: '0 16px',
      }}
    >
      <div
        className="max-w-5xl mx-auto flex items-center justify-between"
        style={{ height: '52px' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/sprites/farmer-south.png"
            alt="farmer"
            width={28}
            height={28}
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="pixel-font"
            style={{
              fontSize: '11px',
              color: 'var(--accent)',
              textShadow: '2px 2px 0px #1a3a1a',
            }}
          >
            HarvestDEX
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-3">
          <a
            href="#features"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: 'var(--muted)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            Features
          </a>
          <a
            href="#how"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: 'var(--muted)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            How It Works
          </a>
          <a
            href="#prices"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: 'var(--muted)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            Prices
          </a>

          {/* Divider */}
          <div style={{ width: '2px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

          {/* CTA */}
          <Link href="/trade">
            <button
              className="pixel-btn pixel-btn-primary"
              style={{ fontSize: '8px', padding: '6px 14px' }}
            >
              ENTER MARKET
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
