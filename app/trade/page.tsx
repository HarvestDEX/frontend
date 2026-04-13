'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ethers } from 'ethers'
import { connectWallet, getContracts } from '../lib/contracts'
import PriceTicker from '../components/trade/PriceTicker'
import SpotTrading from '../components/trade/SpotTrading'
import PerpTrading from '../components/trade/PerpTrading'
import LPPool from '../components/trade/LPPool'

type Tab = 'spot' | 'perp' | 'lp'

function truncateAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

const TAB_CONFIG: {
  key: Tab
  label: string
  sprite: string
  spriteW: number
  spriteH: number
  description: string
}[] = [
  {
    key: 'spot',
    label: 'MARKET',
    sprite: '/sprites/market-stall.png',
    spriteW: 40,
    spriteH: 40,
    description: 'Buy & sell crops',
  },
  {
    key: 'perp',
    label: 'BARN',
    sprite: '/sprites/barn.png',
    spriteW: 40,
    spriteH: 40,
    description: 'Long / Short quests',
  },
  {
    key: 'lp',
    label: 'TREASURY',
    sprite: '/sprites/treasure-chest.png',
    spriteW: 32,
    spriteH: 32,
    description: 'Earn from fees',
  },
]

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<Tab>('spot')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contracts, setContracts] = useState<ReturnType<typeof getContracts> | null>(null)
  const [usdcBalance, setUsdcBalance] = useState<bigint>(BigInt(0))
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [faucetLoading, setFaucetLoading] = useState(false)
  const [faucetError, setFaucetError] = useState('')
  const [faucetSuccess, setFaucetSuccess] = useState('')

  const fetchUsdcBalance = useCallback(async (
    ctrs: ReturnType<typeof getContracts>,
    address: string
  ) => {
    try {
      const bal: bigint = await ctrs.usdc.balanceOf(address)
      setUsdcBalance(bal)
    } catch {
      // silently fail
    }
  }, [])

  const refreshBalance = useCallback(() => {
    if (contracts && walletAddress) {
      fetchUsdcBalance(contracts, walletAddress)
    }
  }, [contracts, walletAddress, fetchUsdcBalance])

  async function handleConnect() {
    setConnectLoading(true)
    setConnectError('')
    try {
      const provider = await connectWallet()
      const s = await provider.getSigner()
      const address = await s.getAddress()
      const ctrs = getContracts(s)

      setSigner(s)
      setContracts(ctrs)
      setWalletAddress(address)
      await fetchUsdcBalance(ctrs, address)
    } catch (err: any) {
      if (err?.code === 4001) {
        setConnectError('Connection rejected.')
      } else {
        setConnectError(err?.message || 'Failed to connect wallet.')
      }
    } finally {
      setConnectLoading(false)
    }
  }

  async function handleFaucet() {
    if (!contracts) return
    setFaucetLoading(true)
    setFaucetError('')
    setFaucetSuccess('')
    try {
      const tx = await contracts.usdc.faucet()
      await tx.wait()
      setFaucetSuccess('You claimed 1000 USDC!')
      refreshBalance()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setFaucetError('Transaction rejected.')
      } else if (err?.reason?.includes('cooldown')) {
        setFaucetError('The well is dry. Come back tomorrow!')
      } else {
        setFaucetError(err?.reason || err?.message || 'Faucet claim failed.')
      }
    } finally {
      setFaucetLoading(false)
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return
    const handleAccountsChanged = () => {
      setWalletAddress(null)
      setSigner(null)
      setContracts(null)
      setUsdcBalance(BigInt(0))
    }
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative edge sprites */}
      <div style={{ position: 'fixed', bottom: '80px', left: '12px', zIndex: 0, opacity: 0.5, pointerEvents: 'none' }}>
        <img src="/sprites/tree.png" alt="" width={48} height={64} style={{ imageRendering: 'pixelated', display: 'block' }} />
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', display: 'block', marginTop: '4px' }} />
      </div>
      <div style={{ position: 'fixed', bottom: '80px', right: '12px', zIndex: 0, opacity: 0.5, pointerEvents: 'none' }}>
        <img src="/sprites/tree.png" alt="" width={48} height={64} style={{ imageRendering: 'pixelated', display: 'block' }} />
        <img src="/sprites/bush.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', display: 'block', marginTop: '4px', marginLeft: 'auto' }} />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '3px solid var(--border)',
          boxShadow: '0 2px 0 0 #2a4c2a',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Top row: logo + wallet + back */}
        <div className="flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
          {/* Logo + farmer avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/sprites/farmer-south.png"
              alt="farmer"
              width={34}
              height={34}
              style={{ imageRendering: 'pixelated' }}
            />
            <div>
              <div className="pixel-font text-[11px]" style={{ color: 'var(--accent)', lineHeight: 1.4 }}>
                HarvestDEX
              </div>
              <div style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '14px', lineHeight: 1 }}>
                Market
              </div>
            </div>
          </div>

          {/* Price ticker */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <PriceTicker />
          </div>

          {/* Wallet + Back */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {walletAddress ? (
              /* Player name tag */
              <div
                className="flex items-center gap-2 px-3 py-1"
                style={{
                  background: 'var(--card)',
                  border: '2px solid var(--gold)',
                  boxShadow: 'inset -2px -2px 0 0 #7a5a20, inset 2px 2px 0 0 #f0e080',
                }}
              >
                <img
                  src="/sprites/farmer-east.png"
                  alt=""
                  width={20}
                  height={20}
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="pixel-font text-[8px]" style={{ color: 'var(--gold)' }}>
                  {truncateAddress(walletAddress)}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connectLoading}
                className="pixel-btn"
                style={{
                  background: connectLoading ? 'var(--surface)' : '#1a1200',
                  border: '2px solid var(--gold)',
                  color: 'var(--gold)',
                  boxShadow: 'inset -2px -2px 0 0 #7a5a20, inset 2px 2px 0 0 #f0e080',
                  opacity: connectLoading ? 0.7 : 1,
                }}
              >
                {connectLoading ? 'CONNECTING...' : '⚔ CONNECT'}
              </button>
            )}

            {/* Back to Village */}
            <Link
              href="/"
              className="flex items-center gap-1 px-2 py-1"
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                color: 'var(--muted)',
                textDecoration: 'none',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '8px',
              }}
            >
              <img src="/sprites/signpost.png" alt="" width={14} height={18} style={{ imageRendering: 'pixelated' }} />
              VILLAGE
            </Link>
          </div>
        </div>

        {connectError && (
          <div className="px-4 py-1" style={{ background: 'var(--red)', color: 'var(--white)' }}>
            <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>{connectError}</span>
          </div>
        )}
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-5 flex flex-col gap-5" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── VILLAGE WELL / FAUCET ─────────────────────────────── */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 p-4"
          style={{
            background: 'var(--card)',
            border: '2px solid var(--border)',
            boxShadow: '0 -2px 0 0 var(--border), 0 2px 0 0 var(--border), -2px 0 0 0 var(--border), 2px 0 0 0 var(--border)',
          }}
        >
          {/* Left: Well + title + balance */}
          <div className="flex items-center gap-3">
            <img
              src="/sprites/well.png"
              alt="village well"
              width={48}
              height={56}
              style={{ imageRendering: 'pixelated', flexShrink: 0 }}
            />
            <div>
              <p className="pixel-font text-[9px]" style={{ color: 'var(--gold)' }}>USDC FAUCET</p>
              <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                Claim 1000 USDC per day
              </p>
              {/* USDC balance */}
              <div className="flex items-center gap-1 mt-1">
                <img
                  src="/sprites/usdc-coin.png"
                  alt="usdc"
                  width={18}
                  height={18}
                  style={{ imageRendering: 'pixelated' }}
                />
                <span style={{ color: 'var(--gold)', fontFamily: 'VT323, monospace', fontSize: '22px' }}>
                  {(Number(usdcBalance) / 1e6).toFixed(2)}
                </span>
                <span className="pixel-font text-[7px]" style={{ color: 'var(--gold)', marginLeft: '2px' }}>
                  USDC
                </span>
              </div>
            </div>
          </div>

          {/* Right: Faucet button + messages */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <button
                onClick={handleFaucet}
                disabled={faucetLoading || !contracts}
                className="pixel-btn pixel-btn-primary"
                style={{ opacity: faucetLoading || !contracts ? 0.6 : 1 }}
              >
                {faucetLoading ? 'CLAIMING...' : '💧 CLAIM 1000 USDC'}
              </button>
              {!walletAddress && (
                <span style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                  Connect wallet first
                </span>
              )}
            </div>
            {faucetError && (
              <p style={{ color: 'var(--red)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{faucetError}</p>
            )}
            {faucetSuccess && (
              <p style={{ color: 'var(--accent)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{faucetSuccess}</p>
            )}
          </div>
        </div>

        {/* ── RPG TAB BAR ───────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: isActive ? 'var(--card)' : 'var(--surface)',
                  border: isActive ? '2px solid var(--gold)' : '2px solid var(--border)',
                  boxShadow: isActive
                    ? 'inset -2px -2px 0 0 #7a5a20, inset 2px 2px 0 0 #f0e080, 0 0 8px 1px rgba(240,192,96,0.3)'
                    : 'none',
                  cursor: 'pointer',
                  transition: 'none',
                  outline: 'none',
                }}
              >
                <img
                  src={tab.sprite}
                  alt={tab.label}
                  width={tab.spriteW}
                  height={tab.spriteH}
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="text-left">
                  <div
                    className="pixel-font text-[9px]"
                    style={{ color: isActive ? 'var(--gold)' : 'var(--muted)' }}
                  >
                    {tab.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'VT323, monospace',
                      fontSize: '14px',
                      color: isActive ? 'var(--white)' : 'var(--muted)',
                    }}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── TAB CONTENT ───────────────────────────────────────── */}
        <div>
          {activeTab === 'spot' && (
            <SpotTrading
              contracts={contracts}
              signer={signer}
              onTxSuccess={refreshBalance}
            />
          )}
          {activeTab === 'perp' && (
            <PerpTrading
              contracts={contracts}
              signer={signer}
              onTxSuccess={refreshBalance}
            />
          )}
          {activeTab === 'lp' && (
            <LPPool
              contracts={contracts}
              signer={signer}
              onTxSuccess={refreshBalance}
            />
          )}
        </div>
      </main>
    </div>
  )
}
