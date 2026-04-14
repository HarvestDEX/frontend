'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { hashkeyTestnet } from '../lib/wagmi'
import { USDC_CONTRACT } from '../lib/contracts'
import PriceChart from '../components/trade/PriceChart'
import SpotTrading from '../components/trade/SpotTrading'
import PerpTrading from '../components/trade/PerpTrading'

type Tab = 'spot' | 'perp'

function truncateAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<Tab>('spot')
  const [faucetError, setFaucetError] = useState('')
  const [faucetSuccess, setFaucetSuccess] = useState('')

  const { address, isConnected, chain } = useAccount()
  const { connect, isPending: connectLoading, error: connectErr } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const wrongChain = isConnected && chain?.id !== hashkeyTestnet.id

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    ...USDC_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected && !wrongChain },
  })

  const { writeContractAsync: writeFaucet, isPending: faucetLoading, data: faucetTxHash } = useWriteContract()

  const { isSuccess: faucetTxSuccess } = useWaitForTransactionReceipt({ hash: faucetTxHash })

  useEffect(() => {
    if (faucetTxSuccess) {
      setFaucetSuccess('Claimed 1000 USDC!')
      refetchBalance()
    }
  }, [faucetTxSuccess, refetchBalance])

  function handleConnect() {
    connect({ connector: injected() })
  }

  function handleSwitchChain() {
    switchChain({ chainId: hashkeyTestnet.id })
  }

  async function handleFaucet() {
    setFaucetError('')
    setFaucetSuccess('')
    try {
      await writeFaucet({ ...USDC_CONTRACT, functionName: 'faucet' })
    } catch (err: any) {
      if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
        setFaucetError('Transaction rejected.')
      } else if (err?.message?.includes('cooldown')) {
        setFaucetError('Come back tomorrow!')
      } else {
        setFaucetError(err?.shortMessage || err?.message || 'Failed.')
      }
    }
  }

  const balance = usdcBalance ? (Number(usdcBalance as bigint) / 1e6).toFixed(2) : '0.00'

  return (
    <div style={{
      background: 'var(--bg)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(74,124,89,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,89,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px', zIndex: 0,
      }} />

      {/* ── TOP BAR ──────────────────────────────────────── */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '2px solid var(--border)',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        flexWrap: 'wrap',
      }}>
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="HarvestDEX" width={28} height={28}
            style={{ imageRendering: 'pixelated', borderRadius: '50%' }} />
          <span className="pixel-font text-[9px]" style={{ color: 'var(--accent)' }}>HarvestDEX</span>
        </div>

        {/* Balance + Faucet */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isConnected && (
            <>
              <img src="/sprites/usdc-coin.png" alt="usdc" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
              <span style={{ color: 'var(--gold)', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
                {balance} USDC
              </span>
              <button
                onClick={handleFaucet}
                disabled={faucetLoading || wrongChain}
                style={{
                  padding: '2px 8px', fontSize: '8px', cursor: 'pointer',
                  fontFamily: 'Press Start 2P, monospace',
                  background: 'var(--accent)', border: '1px solid var(--accent)',
                  color: 'var(--bg)',
                  opacity: faucetLoading ? 0.6 : 1,
                }}>
                {faucetLoading ? '...' : '+1000'}
              </button>
              {faucetSuccess && <span style={{ color: 'var(--accent)', fontFamily: 'VT323', fontSize: '14px' }}>{faucetSuccess}</span>}
              {faucetError && <span style={{ color: 'var(--red)', fontFamily: 'VT323', fontSize: '14px' }}>{faucetError}</span>}
            </>
          )}
        </div>

        {/* Wallet + Nav */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {wrongChain ? (
            <button onClick={handleSwitchChain} style={{
              padding: '3px 8px', fontSize: '8px', cursor: 'pointer',
              fontFamily: 'Press Start 2P, monospace',
              background: '#3a1a00', border: '2px solid var(--red)', color: 'var(--red)',
            }}>SWITCH CHAIN</button>
          ) : isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1"
                style={{ background: 'var(--card)', border: '1px solid var(--gold)' }}>
                <img src="/sprites/farmer-east.png" alt="" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
                <span className="pixel-font text-[7px]" style={{ color: 'var(--gold)' }}>
                  {truncateAddress(address)}
                </span>
              </div>
              <button onClick={() => disconnect()} title="Disconnect"
                style={{
                  padding: '2px 6px', cursor: 'pointer',
                  background: 'var(--surface)', border: '1px solid var(--red)',
                  color: 'var(--red)', fontSize: '10px', fontFamily: 'VT323',
                }}>
                X
              </button>
            </div>
          ) : (
            <button onClick={handleConnect} disabled={connectLoading}
              style={{
                padding: '4px 10px', fontSize: '8px', cursor: 'pointer',
                fontFamily: 'Press Start 2P, monospace',
                background: '#1a1200', border: '2px solid var(--gold)', color: 'var(--gold)',
                opacity: connectLoading ? 0.6 : 1,
              }}>
              {connectLoading ? '...' : 'CONNECT'}
            </button>
          )}

          <Link href="/" style={{
            padding: '3px 8px', textDecoration: 'none',
            fontFamily: 'Press Start 2P, monospace', fontSize: '7px',
            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <img src="/sprites/signpost.png" alt="" width={12} height={14} style={{ imageRendering: 'pixelated' }} />
            HOME
          </Link>
        </div>

        {connectErr && (
          <div style={{
            width: '100%', padding: '2px 8px',
            background: 'var(--red)', color: 'var(--white)',
            fontFamily: 'VT323, monospace', fontSize: '14px',
          }}>
            {connectErr.message?.includes('rejected') ? 'Connection rejected.' : 'Failed to connect.'}
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ─── fills remaining viewport ──── */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '8px',
        padding: '8px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        minHeight: 0,
      }}>

        {/* ── LEFT COLUMN: Chart ────────────────────────── */}
        <div style={{
          flex: '1 1 55%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <div className="pixel-card" style={{
            padding: '10px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            <PriceChart />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Trading ─────────────────────── */}
        <div style={{
          flex: '1 1 45%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '6px',
            flexShrink: 0,
          }}>
            <button
              onClick={() => setActiveTab('spot')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 8px',
                cursor: 'pointer',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '8px',
                background: activeTab === 'spot' ? 'var(--card)' : 'var(--surface)',
                border: activeTab === 'spot' ? '2px solid var(--gold)' : '2px solid var(--border)',
                color: activeTab === 'spot' ? 'var(--gold)' : 'var(--muted)',
                boxShadow: activeTab === 'spot' ? '0 0 6px rgba(240,192,96,0.2)' : 'none',
              }}>
              <img src="/sprites/market-stall.png" alt="" width={24} height={24} style={{ imageRendering: 'pixelated' }} />
              MARKET
            </button>
            <button
              onClick={() => setActiveTab('perp')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 8px',
                cursor: 'pointer',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '8px',
                background: activeTab === 'perp' ? 'var(--card)' : 'var(--surface)',
                border: activeTab === 'perp' ? '2px solid var(--gold)' : '2px solid var(--border)',
                color: activeTab === 'perp' ? 'var(--gold)' : 'var(--muted)',
                boxShadow: activeTab === 'perp' ? '0 0 6px rgba(240,192,96,0.2)' : 'none',
              }}>
              <img src="/sprites/barn.png" alt="" width={24} height={24} style={{ imageRendering: 'pixelated' }} />
              LONG/SHORT
            </button>
          </div>

          {/* Scrollable trading panel */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
          }}>
            {activeTab === 'spot' && (
              <SpotTradingCompact onTxSuccess={() => refetchBalance()} />
            )}
            {activeTab === 'perp' && (
              <PerpTradingCompact onTxSuccess={() => refetchBalance()} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Compact Spot Trading (inline, fits in panel) ──────────────
function SpotTradingCompact({ onTxSuccess }: { onTxSuccess: () => void }) {
  return (
    <div style={{ height: '100%' }}>
      <SpotTrading onTxSuccess={onTxSuccess} />
    </div>
  )
}

function PerpTradingCompact({ onTxSuccess }: { onTxSuccess: () => void }) {
  return (
    <div style={{ height: '100%' }}>
      <PerpTrading onTxSuccess={onTxSuccess} />
    </div>
  )
}
