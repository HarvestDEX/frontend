'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { COMMODITIES, LEVERAGE_OPTIONS, CONTRACT_ADDRESSES } from '../../lib/constants'
import PixelCard from './PixelCard'

interface Props {
  contracts: any
  signer: ethers.Signer | null
  onTxSuccess: () => void
}

type Direction = 'LONG' | 'SHORT'
type CommoditySymbol = 'RICE' | 'COFFEE' | 'CORN' | 'CPO'

interface Position {
  id: number
  trader: string
  symbol: string
  direction: number // 0=LONG, 1=SHORT
  collateral: bigint
  size: bigint
  entryPrice: bigint
  leverage: number
  status: number // 0=OPEN, 1=CLOSED, 2=LIQUIDATED
  openedAt: bigint
  pnl?: bigint
  currentPrice?: bigint
}

function formatUsdc(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(2)
}

function formatPrice(raw: bigint): string {
  return (Number(raw) / 1e8).toFixed(4)
}

function formatPnl(raw: bigint): string {
  const n = Number(raw) / 1e6
  return (n >= 0 ? '+' : '') + n.toFixed(2)
}

export default function PerpTrading({ contracts, signer, onTxSuccess }: Props) {
  const [symbol, setSymbol] = useState<CommoditySymbol>('RICE')
  const [direction, setDirection] = useState<Direction>('LONG')
  const [collateral, setCollateral] = useState('')
  const [leverage, setLeverage] = useState<number>(1)
  const [entryPrice, setEntryPrice] = useState<bigint | null>(null)
  const [openLoading, setOpenLoading] = useState(false)
  const [openError, setOpenError] = useState('')
  const [openSuccess, setOpenSuccess] = useState('')

  const [positions, setPositions] = useState<Position[]>([])
  const [posLoading, setPosLoading] = useState(false)
  const [closeLoading, setCloseLoading] = useState<number | null>(null)
  const [closeError, setCloseError] = useState('')

  // Fetch current oracle price for preview
  useEffect(() => {
    if (!contracts) return
    contracts.oracle.getPriceRaw(symbol)
      .then((r: any) => setEntryPrice(r[0]))
      .catch(() => setEntryPrice(null))
  }, [contracts, symbol])

  // Fetch positions
  const fetchPositions = useCallback(async () => {
    if (!contracts || !signer) return
    setPosLoading(true)
    try {
      const address = await signer.getAddress()
      const nextId: bigint = await contracts.pm.nextPositionId()
      const total = Number(nextId)
      const fetched: Position[] = []

      for (let i = 0; i < total; i++) {
        const pos = await contracts.pm.getPosition(i)
        if (pos.trader.toLowerCase() !== address.toLowerCase()) continue
        if (pos.status !== BigInt(0)) continue // only OPEN

        let pnl: bigint | undefined
        let currentPrice: bigint | undefined
        try {
          const pnlResult = await contracts.pm.getUnrealizedPnL(i)
          pnl = pnlResult[0]
          currentPrice = pnlResult[1]
        } catch {}

        fetched.push({
          id: i,
          trader: pos.trader,
          symbol: pos.symbol,
          direction: Number(pos.direction),
          collateral: pos.collateral,
          size: pos.size,
          entryPrice: pos.entryPrice,
          leverage: Number(pos.leverage),
          status: Number(pos.status),
          openedAt: pos.openedAt,
          pnl,
          currentPrice,
        })
      }
      setPositions(fetched)
    } catch {
      // silently fail
    } finally {
      setPosLoading(false)
    }
  }, [contracts, signer])

  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

  async function handleOpen() {
    if (!contracts || !signer || !collateral) return
    setOpenLoading(true)
    setOpenError('')
    setOpenSuccess('')
    try {
      const collateralAmt = ethers.parseUnits(collateral, 6)
      const notional = collateralAmt * BigInt(leverage)
      const openFeeBps = BigInt(10)
      const openFee = (notional * openFeeBps) / BigInt(10000)
      const totalApprove = collateralAmt + openFee

      // Approve USDC
      const approveTx = await contracts.usdc.approve(CONTRACT_ADDRESSES.positionManager, totalApprove)
      await approveTx.wait()

      // Open position
      let tx
      if (direction === 'LONG') {
        tx = await contracts.pm.openLong(symbol, leverage, collateralAmt)
      } else {
        tx = await contracts.pm.openShort(symbol, leverage, collateralAmt)
      }
      await tx.wait()

      setOpenSuccess(`Opened ${direction} ${symbol} x${leverage}!`)
      setCollateral('')
      onTxSuccess()
      fetchPositions()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setOpenError('Transaction rejected.')
      } else {
        setOpenError(err?.reason || err?.message || 'Failed to open position.')
      }
    } finally {
      setOpenLoading(false)
    }
  }

  async function handleClose(positionId: number) {
    if (!contracts) return
    setCloseLoading(positionId)
    setCloseError('')
    try {
      const tx = await contracts.pm.closePosition(positionId)
      await tx.wait()
      onTxSuccess()
      fetchPositions()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setCloseError('Transaction rejected.')
      } else {
        setCloseError(err?.reason || err?.message || 'Failed to close position.')
      }
    } finally {
      setCloseLoading(null)
    }
  }

  const notional = collateral && !isNaN(Number(collateral))
    ? (Number(collateral) * leverage).toFixed(2)
    : null

  if (!contracts) {
    return (
      <PixelCard>
        <p style={{ color: 'var(--muted)' }} className="pixel-font text-[8px]">CONNECT WALLET TO TRADE</p>
      </PixelCard>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Open Position */}
      <PixelCard title="OPEN POSITION">
        <div className="flex flex-col gap-3">
          {/* Commodity */}
          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>COMMODITY</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value as CommoditySymbol)}
              className="pixel-input mt-1"
              style={{ background: 'var(--surface)' }}
            >
              {COMMODITIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.sprite} {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>DIRECTION</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setDirection('LONG')}
                className={`pixel-btn flex-1 ${direction === 'LONG' ? 'pixel-btn-blue' : ''}`}
                style={direction !== 'LONG' ? { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' } : {}}
              >
                LONG
              </button>
              <button
                onClick={() => setDirection('SHORT')}
                className={`pixel-btn flex-1 ${direction === 'SHORT' ? 'pixel-btn-red' : ''}`}
                style={direction !== 'SHORT' ? { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' } : {}}
              >
                SHORT
              </button>
            </div>
          </div>

          {/* Collateral */}
          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>COLLATERAL (USDC)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              placeholder="100"
              className="pixel-input mt-1"
            />
          </div>

          {/* Leverage */}
          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>LEVERAGE</label>
            <div className="flex gap-2 mt-1">
              {LEVERAGE_OPTIONS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLeverage(lv)}
                  className="pixel-btn flex-1"
                  style={
                    leverage === lv
                      ? { background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' }
                      : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }
                  }
                >
                  {lv}x
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {(notional || entryPrice) && (
            <div className="p-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {notional && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Notional</span>
                  <span className="price-gold">${notional} USDC</span>
                </div>
              )}
              {entryPrice && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Entry Price</span>
                  <span className="price-gold">${formatPrice(entryPrice)}</span>
                </div>
              )}
              {notional && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Open Fee (0.1%)</span>
                  <span style={{ color: 'var(--muted)' }}>
                    ${(Number(notional) * 0.001).toFixed(2)} USDC
                  </span>
                </div>
              )}
            </div>
          )}

          {openError && <p style={{ color: 'var(--red)' }} className="text-sm">{openError}</p>}
          {openSuccess && <p style={{ color: 'var(--accent)' }} className="text-sm">{openSuccess}</p>}

          <button
            onClick={handleOpen}
            disabled={openLoading || !collateral}
            className={`pixel-btn w-full ${direction === 'LONG' ? 'pixel-btn-blue' : 'pixel-btn-red'}`}
            style={{ opacity: openLoading || !collateral ? 0.6 : 1 }}
          >
            {openLoading ? 'OPENING...' : `OPEN ${direction} ${symbol} x${leverage}`}
          </button>
        </div>
      </PixelCard>

      {/* My Positions */}
      <PixelCard title="MY POSITIONS">
        {posLoading && (
          <p style={{ color: 'var(--muted)' }} className="text-sm">Loading positions...</p>
        )}
        {!posLoading && positions.length === 0 && (
          <p style={{ color: 'var(--muted)' }} className="text-sm">No open positions.</p>
        )}
        {closeError && <p style={{ color: 'var(--red)' }} className="text-sm mb-2">{closeError}</p>}
        <div className="flex flex-col gap-2">
          {positions.map((pos) => {
            const dirLabel = pos.direction === 0 ? 'LONG' : 'SHORT'
            const dirColor = pos.direction === 0 ? 'var(--blue)' : 'var(--red)'
            const pnlNum = pos.pnl !== undefined ? Number(pos.pnl) / 1e6 : null
            const pnlPositive = pnlNum !== null && pnlNum >= 0

            return (
              <div
                key={pos.id}
                className="p-3 flex flex-col gap-1"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>#{pos.id}</span>
                    <span className="pixel-font text-[8px]">{pos.symbol}</span>
                    <span className="pixel-font text-[8px]" style={{ color: dirColor }}>{dirLabel}</span>
                    <span className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>{pos.leverage}x</span>
                  </div>
                  <button
                    onClick={() => handleClose(pos.id)}
                    disabled={closeLoading === pos.id}
                    className="pixel-btn pixel-btn-red"
                    style={{ fontSize: '8px', padding: '4px 8px', opacity: closeLoading === pos.id ? 0.6 : 1 }}
                  >
                    {closeLoading === pos.id ? 'CLOSING...' : 'CLOSE'}
                  </button>
                </div>
                <div className="flex gap-4 text-sm">
                  <span style={{ color: 'var(--muted)' }}>
                    Collateral: <span className="price-gold">${formatUsdc(pos.collateral)}</span>
                  </span>
                  <span style={{ color: 'var(--muted)' }}>
                    Entry: <span className="price-gold">${formatPrice(pos.entryPrice)}</span>
                  </span>
                  {pos.currentPrice !== undefined && (
                    <span style={{ color: 'var(--muted)' }}>
                      Now: <span className="price-gold">${formatPrice(pos.currentPrice)}</span>
                    </span>
                  )}
                  {pnlNum !== null && (
                    <span className={pnlPositive ? 'price-up' : 'price-down'}>
                      PnL: {formatPnl(pos.pnl!)} USDC
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </PixelCard>
    </div>
  )
}
