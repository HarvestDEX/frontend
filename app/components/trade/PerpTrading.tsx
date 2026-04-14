'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseUnits } from 'viem'
import { config } from '../../lib/wagmi'
import { COMMODITIES, LEVERAGE_OPTIONS, CONTRACT_ADDRESSES } from '../../lib/constants'
import { USDC_CONTRACT, ORACLE_CONTRACT, PM_CONTRACT } from '../../lib/contracts'

interface Props {
  onTxSuccess: () => void
}

type Direction = 'LONG' | 'SHORT'
type CommoditySymbol = 'RICE' | 'COFFEE' | 'CORN' | 'CPO'

interface Position {
  id: number
  symbol: string
  direction: number
  collateral: bigint
  size: bigint
  entryPrice: bigint
  leverage: number
  pnl?: bigint
  currentPrice?: bigint
}

function formatUsdc(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(2)
}

function formatPrice(raw: bigint): string {
  return (Number(raw) / 1e8).toFixed(2)
}

export default function PerpTrading({ onTxSuccess }: Props) {
  const { address, isConnected } = useAccount()

  const [symbol, setSymbol] = useState<CommoditySymbol>('RICE')
  const [direction, setDirection] = useState<Direction>('LONG')
  const [collateral, setCollateral] = useState('')
  const [leverage, setLeverage] = useState<number>(2)
  const [entryPrice, setEntryPrice] = useState<bigint | null>(null)
  const [openLoading, setOpenLoading] = useState(false)
  const [openError, setOpenError] = useState('')
  const [openSuccess, setOpenSuccess] = useState('')

  const [positions, setPositions] = useState<Position[]>([])
  const [posLoading, setPosLoading] = useState(false)
  const [closeLoading, setCloseLoading] = useState<number | null>(null)
  const [closeError, setCloseError] = useState('')

  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    readContract(config, {
      ...ORACLE_CONTRACT, functionName: 'getPriceRaw', args: [symbol],
    }).then((r: any) => setEntryPrice(r[0])).catch(() => setEntryPrice(null))
  }, [symbol])

  const fetchPositions = useCallback(async () => {
    if (!isConnected || !address) return
    setPosLoading(true)
    try {
      const nextId = await readContract(config, {
        ...PM_CONTRACT, functionName: 'nextPositionId',
      }) as bigint
      const fetched: Position[] = []
      for (let i = 0; i < Number(nextId); i++) {
        const pos = await readContract(config, {
          ...PM_CONTRACT, functionName: 'getPosition', args: [BigInt(i)],
        }) as any
        if (pos.trader.toLowerCase() !== address.toLowerCase()) continue
        if (Number(pos.status) !== 0) continue
        let pnl: bigint | undefined, currentPrice: bigint | undefined
        try {
          const r = await readContract(config, {
            ...PM_CONTRACT, functionName: 'getUnrealizedPnL', args: [BigInt(i)],
          }) as [bigint, bigint]
          pnl = r[0]; currentPrice = r[1]
        } catch {}
        fetched.push({
          id: i, symbol: pos.symbol, direction: Number(pos.direction),
          collateral: pos.collateral, size: pos.size, entryPrice: pos.entryPrice,
          leverage: Number(pos.leverage), pnl, currentPrice,
        })
      }
      setPositions(fetched)
    } catch {} finally { setPosLoading(false) }
  }, [isConnected, address])

  useEffect(() => { fetchPositions() }, [fetchPositions])

  async function handleOpen() {
    if (!isConnected || !collateral) return
    setOpenLoading(true); setOpenError(''); setOpenSuccess('')
    try {
      const amt = parseUnits(collateral, 6)
      const notional = amt * BigInt(leverage)
      const fee = (notional * BigInt(10)) / BigInt(10000)
      await writeContractAsync({
        ...USDC_CONTRACT, functionName: 'approve',
        args: [CONTRACT_ADDRESSES.positionManager as `0x${string}`, amt + fee],
      })
      await writeContractAsync({
        ...PM_CONTRACT, functionName: direction === 'LONG' ? 'openLong' : 'openShort',
        args: [symbol, leverage, amt],
      })
      setOpenSuccess(`Opened ${direction} ${symbol} x${leverage}!`)
      setCollateral(''); onTxSuccess(); fetchPositions()
    } catch (err: any) {
      if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
        setOpenError('Transaction rejected.')
      } else {
        setOpenError(err?.shortMessage || err?.message || 'Failed.')
      }
    } finally { setOpenLoading(false) }
  }

  async function handleClose(id: number) {
    setCloseLoading(id); setCloseError('')
    try {
      await writeContractAsync({
        ...PM_CONTRACT, functionName: 'closePosition', args: [BigInt(id)],
      })
      onTxSuccess(); fetchPositions()
    } catch (err: any) {
      setCloseError(err?.shortMessage || 'Failed to close.')
    } finally { setCloseLoading(null) }
  }

  const notional = collateral && !isNaN(Number(collateral))
    ? (Number(collateral) * leverage).toFixed(2) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Open position form */}
      <div className="pixel-card" style={{ padding: '10px' }}>
        {/* Direction toggle */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          <button onClick={() => setDirection('LONG')}
            style={{
              flex: 1, padding: '4px', cursor: 'pointer',
              fontFamily: 'Press Start 2P, monospace', fontSize: '8px',
              background: direction === 'LONG' ? 'var(--blue)' : 'var(--surface)',
              border: `2px solid ${direction === 'LONG' ? 'var(--blue)' : 'var(--border)'}`,
              color: direction === 'LONG' ? 'var(--white)' : 'var(--muted)',
            }}>
            LONG
          </button>
          <button onClick={() => setDirection('SHORT')}
            style={{
              flex: 1, padding: '4px', cursor: 'pointer',
              fontFamily: 'Press Start 2P, monospace', fontSize: '8px',
              background: direction === 'SHORT' ? 'var(--red)' : 'var(--surface)',
              border: `2px solid ${direction === 'SHORT' ? '#a03030' : 'var(--border)'}`,
              color: direction === 'SHORT' ? 'var(--white)' : 'var(--muted)',
            }}>
            SHORT
          </button>
        </div>

        {/* Commodity */}
        <div style={{ marginBottom: '8px' }}>
          <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>COMMODITY</label>
          <div className="flex gap-1 mt-1 flex-wrap">
            {COMMODITIES.map((c) => (
              <button key={c.symbol} onClick={() => setSymbol(c.symbol as CommoditySymbol)}
                style={{
                  padding: '3px 6px', fontSize: '7px', cursor: 'pointer',
                  fontFamily: 'Press Start 2P, monospace',
                  background: symbol === c.symbol ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${symbol === c.symbol ? 'var(--accent)' : 'var(--border)'}`,
                  color: symbol === c.symbol ? 'var(--bg)' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                <img src={c.sprite} alt="" width={14} height={14} style={{ imageRendering: 'pixelated' }} />
                {c.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Collateral */}
        <div style={{ marginBottom: '8px' }}>
          <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>COLLATERAL (USDC)</label>
          <input type="number" min="0" step="1" value={collateral}
            onChange={(e) => setCollateral(e.target.value)} placeholder="100"
            className="pixel-input" style={{ marginTop: '4px', padding: '6px 8px', fontSize: '16px' }} />
        </div>

        {/* Leverage */}
        <div style={{ marginBottom: '8px' }}>
          <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>LEVERAGE</label>
          <div className="flex gap-2 mt-1">
            {LEVERAGE_OPTIONS.map((lv) => {
              const active = leverage === lv
              const colors: Record<number, string> = { 1: 'var(--accent)', 2: '#f0c060', 3: 'var(--red)', 5: '#9030d0' }
              return (
                <button key={lv} onClick={() => setLeverage(lv)}
                  style={{
                    padding: '3px 8px', cursor: 'pointer',
                    fontFamily: 'Press Start 2P, monospace', fontSize: '8px',
                    background: active ? (colors[lv] || 'var(--accent)') : 'var(--surface)',
                    border: `1px solid ${active ? (colors[lv] || 'var(--accent)') : 'var(--border)'}`,
                    color: active ? (lv <= 2 ? 'var(--bg)' : 'var(--white)') : 'var(--muted)',
                  }}>
                  {lv}x
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview */}
        {(notional || entryPrice) && (
          <div style={{
            padding: '6px 8px', marginBottom: '8px',
            background: '#0a1a0a', border: '1px solid var(--border)',
            fontFamily: 'VT323, monospace', fontSize: '14px',
          }}>
            {entryPrice && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Entry price</span>
                <span style={{ color: 'var(--gold)' }}>${formatPrice(entryPrice)}</span>
              </div>
            )}
            {notional && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Notional</span>
                <span style={{ color: 'var(--gold)' }}>{notional} USDC</span>
              </div>
            )}
            {notional && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Fee (0.1%)</span>
                <span style={{ color: 'var(--muted)' }}>{(Number(notional) * 0.001).toFixed(2)} USDC</span>
              </div>
            )}
          </div>
        )}

        {openError && <p style={{ color: 'var(--red)', fontFamily: 'VT323', fontSize: '14px', margin: '0 0 6px' }}>{openError}</p>}
        {openSuccess && <p style={{ color: 'var(--accent)', fontFamily: 'VT323', fontSize: '14px', margin: '0 0 6px' }}>{openSuccess}</p>}

        <button onClick={handleOpen} disabled={openLoading || !collateral || !isConnected}
          className={`pixel-btn w-full ${direction === 'LONG' ? 'pixel-btn-blue' : 'pixel-btn-red'}`}
          style={{ opacity: openLoading || !collateral || !isConnected ? 0.6 : 1, padding: '8px' }}>
          {openLoading ? 'OPENING...' : `${direction} ${symbol} x${leverage}`}
        </button>

        {!isConnected && (
          <p style={{ color: 'var(--muted)', fontFamily: 'VT323', fontSize: '14px', textAlign: 'center', marginTop: '6px' }}>
            Connect wallet to trade
          </p>
        )}
      </div>

      {/* Active positions */}
      {isConnected && (
        <div className="pixel-card" style={{ padding: '10px' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="pixel-font text-[8px]" style={{ color: 'var(--gold)' }}>POSITIONS</span>
            {positions.length > 0 && (
              <span style={{
                fontFamily: 'Press Start 2P', fontSize: '7px',
                background: 'var(--accent)', color: 'var(--bg)', padding: '1px 5px',
              }}>{positions.length}</span>
            )}
          </div>

          {posLoading && (
            <p style={{ color: 'var(--muted)', fontFamily: 'VT323', fontSize: '15px' }}>Loading...</p>
          )}

          {!posLoading && positions.length === 0 && (
            <p style={{ color: 'var(--muted)', fontFamily: 'VT323', fontSize: '15px' }}>
              No open positions
            </p>
          )}

          {closeError && <p style={{ color: 'var(--red)', fontFamily: 'VT323', fontSize: '13px', marginBottom: '4px' }}>{closeError}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {positions.map((pos) => {
              const dirLabel = pos.direction === 0 ? 'LONG' : 'SHORT'
              const dirColor = pos.direction === 0 ? 'var(--blue)' : 'var(--red)'
              const pnlNum = pos.pnl !== undefined ? Number(pos.pnl) / 1e6 : null
              const pnlUp = pnlNum !== null && pnlNum >= 0
              const c = COMMODITIES.find((x) => x.symbol === pos.symbol)

              return (
                <div key={pos.id} style={{
                  padding: '6px 8px',
                  background: 'var(--surface)',
                  border: `1px solid ${pnlUp ? 'var(--accent)' : pnlNum !== null ? 'var(--red)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    {c && <img src={c.sprite} alt="" width={18} height={18} style={{ imageRendering: 'pixelated', flexShrink: 0 }} />}
                    <div style={{ fontFamily: 'VT323, monospace', fontSize: '14px', minWidth: 0 }}>
                      <span className="pixel-font text-[7px]" style={{ color: 'var(--white)' }}>{pos.symbol}</span>
                      <span className="pixel-font text-[7px]" style={{ color: dirColor, marginLeft: '4px' }}>{dirLabel}</span>
                      <span style={{ color: 'var(--muted)', marginLeft: '4px' }}>x{pos.leverage}</span>
                      <br />
                      <span style={{ color: 'var(--muted)' }}>{formatUsdc(pos.collateral)} USDC</span>
                      {pnlNum !== null && (
                        <span style={{ color: pnlUp ? 'var(--accent)' : 'var(--red)', marginLeft: '6px', fontWeight: 'bold' }}>
                          {pnlUp ? '+' : ''}{pnlNum.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleClose(pos.id)} disabled={closeLoading === pos.id}
                    style={{
                      padding: '3px 8px', cursor: 'pointer', flexShrink: 0,
                      fontFamily: 'Press Start 2P', fontSize: '6px',
                      background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)',
                      opacity: closeLoading === pos.id ? 0.6 : 1,
                    }}>
                    {closeLoading === pos.id ? '...' : 'CLOSE'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
