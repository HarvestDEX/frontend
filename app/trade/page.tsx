'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ethers } from 'ethers'
import { hashkeyTestnet } from '../lib/wagmi'
import { useEthersSigner } from '../lib/useEthersSigner'
import { getContracts } from '../lib/contracts'
import PriceTicker from '../components/trade/PriceTicker'
import PriceChart from '../components/trade/PriceChart'
import SpotTrading from '../components/trade/SpotTrading'
import PerpTrading from '../components/trade/PerpTrading'

type Tab = 'spot' | 'perp'

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
]

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<Tab>('spot')
  const [contracts, setContracts] = useState<ReturnType<typeof getContracts> | null>(null)
  const [usdcBalance, setUsdcBalance] = useState<bigint>(BigInt(0))
  const [faucetLoading, setFaucetLoading] = useState(false)
  const [faucetError, setFaucetError] = useState('')
  const [faucetSuccess, setFaucetSuccess] = useState('')

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount()
  const { connect, isPending: connectLoading, error: connectErr } = useConnect()
  const { switchChain } = useSwitchChain()
  const signer = useEthersSigner()

  // Wrong chain detection
  const wrongChain = isConnected && chain?.id !== hashkeyTestnet.id

  // Init contracts when signer is available
  useEffect(() => {
    if (signer) {
      const ctrs = getContracts(signer)
      setContracts(ctrs)
    } else {
      setContracts(null)
    }
  }, [signer])

  const fetchUsdcBalance = useCallback(async (
    ctrs: ReturnType<typeof getContracts>,
    addr: string
  ) => {
    try {
      const bal: bigint = await ctrs.usdc.balanceOf(addr)
      setUsdcBalance(bal)
    } catch {
      // silently fail
    }
  }, [])

  // Fetch balance when contracts/address change
  useEffect(() => {
    if (contracts && address) {
      fetchUsdcBalance(contracts, address)
    }
  }, [contracts, address, fetchUsdcBalance])

  const refreshBalance = useCallback(() => {
    if (contracts && address) {
      fetchUsdcBalance(contracts, address)
    }
  }, [contracts, address, fetchUsdcBalance])

  function handleConnect() {
    connect({ connector: injected() })
  }

  function handleSwitchChain() {
    switchChain({ chainId: hashkeyTestnet.id })
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Background pixel grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,124,89,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,89,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          zIndex: 0,
        }}
      />

      {/* Subtle dark ground gradient */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '48px',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.3))',
          zIndex: 0,
        }}
      />

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
              src="/logo.png"
              alt="HarvestDEX"
              width={36}
              height={36}
              style={{ imageRendering: 'pixelated', borderRadius: '50%' }}
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
            {wrongChain ? (
              <button
                onClick={handleSwitchChain}
                className="pixel-btn"
                style={{
                  background: '#3a1a00',
                  border: '2px solid var(--red)',
                  color: 'var(--red)',
                  fontSize: '8px',
                }}
              >
                WRONG CHAIN - SWITCH
              </button>
            ) : isConnected && address ? (
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
                  {truncateAddress(address)}
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
                {connectLoading ? 'CONNECTING...' : 'CONNECT'}
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

        {connectErr && (
          <div className="px-4 py-1" style={{ background: 'var(--red)', color: 'var(--white)' }}>
            <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
              {connectErr.message?.includes('rejected') ? 'Connection rejected.' : 'Failed to connect wallet.'}
            </span>
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
                {faucetLoading ? 'CLAIMING...' : 'CLAIM 1000 USDC'}
              </button>
              {!isConnected && (
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

        {/* ── PRICE CHART ────────────────────────────────────────── */}
        <PriceChart />

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
        </div>
      </main>
    </div>
  )
}
