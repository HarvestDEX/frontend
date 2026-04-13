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

function GoldCoin({ size = 16 }: { size?: number }) {
  return (
    <img
      src="/sprites/usdc-coin.png"
      alt="usdc"
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', display: 'inline', verticalAlign: 'middle' }}
    />
  )
}

const LEVERAGE_LABELS: Record<number, string> = {
  1: '1x EASY',
  2: '2x MEDIUM',
  3: '3x HARD',
  5: '5x EXTREME',
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

      setOpenSuccess(`Quest accepted! ${direction} ${symbol} x${leverage}`)
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

  const selectedCommodity = COMMODITIES.find((c) => c.symbol === symbol)

  if (!contracts) {
    return (
      <PixelCard icon="/sprites/barn.png" iconSize={48}>
        <p className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>
          CONNECT WALLET TO ENTER THE BARN
        </p>
      </PixelCard>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-3 px-1">
        <img src="/sprites/barn.png" alt="barn" width={56} height={56} style={{ imageRendering: 'pixelated' }} />
        <div>
          <h2 className="pixel-font text-[11px]" style={{ color: 'var(--gold)' }}>THE BARN</h2>
          <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
            Take on leveraged quests — long or short
          </p>
        </div>
        <img src="/sprites/signpost.png" alt="" width={32} height={40} style={{ imageRendering: 'pixelated', marginLeft: 'auto' }} />
      </div>

      {/* Open Position — styled as quest board */}
      <PixelCard>
        <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
          <span style={{ fontSize: '18px' }}>📜</span>
          <span className="pixel-font text-[10px]" style={{ color: 'var(--gold)' }}>CHOOSE A QUEST</span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Commodity */}
          <div>
            <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>COMMODITY TARGET</label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {COMMODITIES.map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => setSymbol(c.symbol as CommoditySymbol)}
                  className="pixel-btn"
                  style={{
                    padding: '4px 8px',
                    fontSize: '8px',
                    background: symbol === c.symbol ? 'var(--accent)' : 'var(--surface)',
                    borderColor: symbol === c.symbol ? 'var(--accent)' : 'var(--border)',
                    color: symbol === c.symbol ? 'var(--bg)' : 'var(--muted)',
                  }}
                >
                  <img
                    src={c.sprite}
                    alt={c.name}
                    width={16}
                    height={16}
                    style={{ imageRendering: 'pixelated', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}
                  />
                  {c.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Direction — RPG choice buttons */}
          <div>
            <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>QUEST TYPE</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setDirection('LONG')}
                className={`pixel-btn flex-1 ${direction === 'LONG' ? 'pixel-btn-blue' : ''}`}
                style={direction !== 'LONG' ? { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' } : {}}
              >
                GO LONG 📈
              </button>
              <button
                onClick={() => setDirection('SHORT')}
                className={`pixel-btn flex-1 ${direction === 'SHORT' ? 'pixel-btn-red' : ''}`}
                style={direction !== 'SHORT' ? { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' } : {}}
              >
                GO SHORT 📉
              </button>
            </div>
          </div>

          {/* Collateral */}
          <div>
            <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>USDC WAGER</label>
            <div className="flex items-center gap-2 mt-1">
              <GoldCoin size={24} />
              <input
                type="number"
                min="0"
                step="1"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                placeholder="100"
                className="pixel-input"
              />
            </div>
          </div>

          {/* Leverage — difficulty selector */}
          <div>
            <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>QUEST DIFFICULTY</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {LEVERAGE_OPTIONS.map((lv) => {
                const isActive = leverage === lv
                let activeStyle: React.CSSProperties = {}
                if (isActive) {
                  if (lv <= 1) activeStyle = { background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' }
                  else if (lv <= 2) activeStyle = { background: '#f0c060', color: '#0f1a0f', borderColor: '#c09040' }
                  else if (lv <= 3) activeStyle = { background: 'var(--red)', color: 'var(--white)', borderColor: '#a03030' }
                  else activeStyle = { background: '#9030d0', color: 'var(--white)', borderColor: '#6010a0' }
                }
                return (
                  <button
                    key={lv}
                    onClick={() => setLeverage(lv)}
                    className="pixel-btn"
                    style={isActive ? activeStyle : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)', fontSize: '8px' }}
                  >
                    {LEVERAGE_LABELS[lv]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quest rewards preview */}
          {(notional || entryPrice) && (
            <div
              className="p-3 flex flex-col gap-1"
              style={{
                background: '#0a1a0a',
                border: '2px solid var(--accent)',
                fontFamily: 'VT323, monospace',
                fontSize: '17px',
              }}
            >
              <div className="pixel-font text-[7px] mb-1" style={{ color: 'var(--accent)' }}>QUEST DETAILS</div>
              {selectedCommodity && (
                <div className="flex items-center gap-1">
                  <img src={selectedCommodity.sprite} alt="" width={20} height={20} style={{ imageRendering: 'pixelated' }} />
                  <span style={{ color: 'var(--muted)' }}>Target:</span>
                  <span style={{ color: 'var(--white)' }}>{selectedCommodity.name}</span>
                  <span style={{ color: direction === 'LONG' ? 'var(--blue)' : 'var(--red)', marginLeft: '4px' }}>
                    {direction === 'LONG' ? '▲ LONG' : '▼ SHORT'}
                  </span>
                </div>
              )}
              {notional && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Notional size</span>
                  <span style={{ color: 'var(--gold)' }}>
                    <GoldCoin size={14} /> {notional}
                  </span>
                </div>
              )}
              {entryPrice && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Entry price</span>
                  <span style={{ color: 'var(--gold)' }}>${formatPrice(entryPrice)}</span>
                </div>
              )}
              {notional && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>Guild fee (0.1%)</span>
                  <span style={{ color: 'var(--muted)' }}>
                    <GoldCoin size={14} /> {(Number(notional) * 0.001).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {openError && <p style={{ color: 'var(--red)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{openError}</p>}
          {openSuccess && <p style={{ color: 'var(--accent)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{openSuccess}</p>}

          <button
            onClick={handleOpen}
            disabled={openLoading || !collateral}
            className={`pixel-btn w-full ${direction === 'LONG' ? 'pixel-btn-blue' : 'pixel-btn-red'}`}
            style={{ opacity: openLoading || !collateral ? 0.6 : 1 }}
          >
            {openLoading
              ? 'ACCEPTING QUEST...'
              : `${direction === 'LONG' ? '📈' : '📉'} OPEN ${direction} ${symbol} x${leverage}`}
          </button>
        </div>
      </PixelCard>

      {/* My Positions — Active Quests */}
      <PixelCard>
        <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
          <span style={{ fontSize: '18px' }}>⚔️</span>
          <span className="pixel-font text-[10px]" style={{ color: 'var(--gold)' }}>ACTIVE QUESTS</span>
          {positions.length > 0 && (
            <span
              className="pixel-font text-[7px] ml-auto"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg)',
                padding: '2px 6px',
              }}
            >
              {positions.length} OPEN
            </span>
          )}
        </div>

        {posLoading && (
          <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '17px' }}>
            Checking quest board...
          </p>
        )}
        {!posLoading && positions.length === 0 && (
          <div className="flex items-center gap-3 py-2">
            <img src="/sprites/signpost.png" alt="" width={24} height={32} style={{ imageRendering: 'pixelated' }} />
            <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
              No active quests. Visit the quest board above!
            </p>
          </div>
        )}
        {closeError && (
          <p style={{ color: 'var(--red)', fontFamily: 'VT323, monospace', fontSize: '16px' }} className="mb-2">
            {closeError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {positions.map((pos) => {
            const dirLabel = pos.direction === 0 ? 'LONG' : 'SHORT'
            const dirColor = pos.direction === 0 ? 'var(--blue)' : 'var(--red)'
            const pnlNum = pos.pnl !== undefined ? Number(pos.pnl) / 1e6 : null
            const pnlPositive = pnlNum !== null && pnlNum >= 0
            const posCommodity = COMMODITIES.find((c) => c.symbol === pos.symbol)

            return (
              <div
                key={pos.id}
                className="p-3 flex flex-col gap-2"
                style={{
                  background: 'var(--surface)',
                  border: `2px solid ${pnlPositive ? 'var(--accent)' : pnlNum !== null ? 'var(--red)' : 'var(--border)'}`,
                }}
              >
                {/* Quest header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {posCommodity && (
                      <img src={posCommodity.sprite} alt="" width={24} height={24} style={{ imageRendering: 'pixelated' }} />
                    )}
                    <div>
                      <span className="pixel-font text-[8px]" style={{ color: 'var(--white)' }}>{pos.symbol}</span>
                      <span className="pixel-font text-[8px] ml-2" style={{ color: dirColor }}>
                        {dirLabel}
                      </span>
                      <span className="pixel-font text-[7px] ml-2" style={{ color: 'var(--muted)' }}>
                        x{pos.leverage}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClose(pos.id)}
                    disabled={closeLoading === pos.id}
                    className="pixel-btn pixel-btn-primary"
                    style={{ fontSize: '8px', padding: '4px 8px', opacity: closeLoading === pos.id ? 0.6 : 1 }}
                  >
                    {closeLoading === pos.id ? 'CLOSING...' : 'COMPLETE QUEST'}
                  </button>
                </div>

                {/* Quest stats */}
                <div
                  className="flex flex-wrap gap-3"
                  style={{ fontFamily: 'VT323, monospace', fontSize: '17px' }}
                >
                  <span style={{ color: 'var(--muted)' }}>
                    Wager: <span style={{ color: 'var(--gold)' }}>
                      <GoldCoin size={13} /> {formatUsdc(pos.collateral)}
                    </span>
                  </span>
                  <span style={{ color: 'var(--muted)' }}>
                    Entry: <span style={{ color: 'var(--gold)' }}>${formatPrice(pos.entryPrice)}</span>
                  </span>
                  {pos.currentPrice !== undefined && (
                    <span style={{ color: 'var(--muted)' }}>
                      Now: <span style={{ color: 'var(--gold)' }}>${formatPrice(pos.currentPrice)}</span>
                    </span>
                  )}
                  {pnlNum !== null && (
                    <span style={{ color: pnlPositive ? 'var(--accent)' : 'var(--red)', fontWeight: 'bold' }}>
                      {pnlPositive ? '▲' : '▼'} PnL:{' '}
                      <GoldCoin size={13} /> {formatPnl(pos.pnl!)}
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
