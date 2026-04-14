'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseUnits } from 'viem'
import { config } from '../../lib/wagmi'
import { COMMODITIES, CONTRACT_ADDRESSES } from '../../lib/constants'
import { USDC_CONTRACT, SPOT_CONTRACT } from '../../lib/contracts'
import PixelCard from './PixelCard'

interface Props {
  onTxSuccess: () => void
}

type CommoditySymbol = 'RICE' | 'COFFEE' | 'CORN' | 'CPO'

function formatUsdc(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(2)
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

export default function SpotTrading({ onTxSuccess }: Props) {
  const { address, isConnected } = useAccount()

  // BUY state
  const [buySymbol, setBuySymbol] = useState<CommoditySymbol>('RICE')
  const [buyAmount, setBuyAmount] = useState('')
  const [buyPreview, setBuyPreview] = useState<{ usdcCost: bigint; fee: bigint; total: bigint } | null>(null)
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [buySuccess, setBuySuccess] = useState('')

  // SELL state
  const [sellSymbol, setSellSymbol] = useState<CommoditySymbol>('RICE')
  const [sellAmount, setSellAmount] = useState('')
  const [sellPreview, setSellPreview] = useState<{ usdcReceived: bigint; fee: bigint } | null>(null)
  const [sellLoading, setSellLoading] = useState(false)
  const [sellError, setSellError] = useState('')
  const [sellSuccess, setSellSuccess] = useState('')

  const { writeContractAsync } = useWriteContract()

  // Fetch buy preview
  useEffect(() => {
    setBuyPreview(null)
    if (!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) return
    const timeout = setTimeout(async () => {
      try {
        const tokenAmt = parseUnits(buyAmount, 18)
        const result = await readContract(config, {
          ...SPOT_CONTRACT,
          functionName: 'previewBuy',
          args: [buySymbol, tokenAmt],
        }) as [bigint, bigint, bigint]
        setBuyPreview({ usdcCost: result[0], fee: result[1], total: result[2] })
      } catch {
        setBuyPreview(null)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [buySymbol, buyAmount])

  // Fetch sell preview
  useEffect(() => {
    setSellPreview(null)
    if (!sellAmount || isNaN(Number(sellAmount)) || Number(sellAmount) <= 0) return
    const timeout = setTimeout(async () => {
      try {
        const tokenAmt = parseUnits(sellAmount, 18)
        const result = await readContract(config, {
          ...SPOT_CONTRACT,
          functionName: 'previewSell',
          args: [sellSymbol, tokenAmt],
        }) as [bigint, bigint]
        setSellPreview({ usdcReceived: result[0], fee: result[1] })
      } catch {
        setSellPreview(null)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [sellSymbol, sellAmount])

  async function handleBuy() {
    if (!isConnected || !buyAmount) return
    setBuyLoading(true)
    setBuyError('')
    setBuySuccess('')
    try {
      const tokenAmt = parseUnits(buyAmount, 18)
      const result = await readContract(config, {
        ...SPOT_CONTRACT,
        functionName: 'previewBuy',
        args: [buySymbol, tokenAmt],
      }) as [bigint, bigint, bigint]
      const total = result[2]

      // Approve USDC
      const approveTx = await writeContractAsync({
        ...USDC_CONTRACT,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.spotMarket as `0x${string}`, total],
      })

      // Buy
      const buyTx = await writeContractAsync({
        ...SPOT_CONTRACT,
        functionName: 'buy',
        args: [buySymbol, tokenAmt],
      })

      setBuySuccess(`You acquired ${buyAmount} ${buySymbol}!`)
      setBuyAmount('')
      setBuyPreview(null)
      onTxSuccess()
    } catch (err: any) {
      if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
        setBuyError('Transaction rejected.')
      } else {
        setBuyError(err?.shortMessage || err?.message || 'Transaction failed.')
      }
    } finally {
      setBuyLoading(false)
    }
  }

  async function handleSell() {
    if (!isConnected || !sellAmount) return
    setSellLoading(true)
    setSellError('')
    setSellSuccess('')
    try {
      const tokenAmt = parseUnits(sellAmount, 18)
      const sellTx = await writeContractAsync({
        ...SPOT_CONTRACT,
        functionName: 'sell',
        args: [sellSymbol, tokenAmt],
      })

      setSellSuccess(`Sold ${sellAmount} ${sellSymbol} for USDC!`)
      setSellAmount('')
      setSellPreview(null)
      onTxSuccess()
    } catch (err: any) {
      if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
        setSellError('Transaction rejected.')
      } else {
        setSellError(err?.shortMessage || err?.message || 'Transaction failed.')
      }
    } finally {
      setSellLoading(false)
    }
  }

  const buyCommodity = COMMODITIES.find((c) => c.symbol === buySymbol)
  const sellCommodity = COMMODITIES.find((c) => c.symbol === sellSymbol)

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-3 px-1">
        <img src="/sprites/market-stall.png" alt="market stall" width={48} height={48} style={{ imageRendering: 'pixelated' }} />
        <div>
          <h2 className="pixel-font text-[11px]" style={{ color: 'var(--gold)' }}>MARKET STALL</h2>
          <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
            Buy and sell crops at today's prices
          </p>
        </div>
        <img src="/sprites/crate.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', marginLeft: 'auto' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BUY */}
        <PixelCard>
          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
            <span style={{ fontSize: '20px' }}>🛒</span>
            <span className="pixel-font text-[10px]" style={{ color: 'var(--accent)' }}>BUY CROPS</span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>SELECT CROP</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {COMMODITIES.map((c) => (
                  <button
                    key={c.symbol}
                    onClick={() => setBuySymbol(c.symbol as CommoditySymbol)}
                    className="pixel-btn"
                    style={{
                      padding: '4px 8px',
                      fontSize: '8px',
                      background: buySymbol === c.symbol ? 'var(--accent)' : 'var(--surface)',
                      borderColor: buySymbol === c.symbol ? 'var(--accent)' : 'var(--border)',
                      color: buySymbol === c.symbol ? 'var(--bg)' : 'var(--muted)',
                    }}
                  >
                    <img src={c.sprite} alt={c.name} width={16} height={16}
                      style={{ imageRendering: 'pixelated', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>AMOUNT (UNITS)</label>
              <div className="flex items-center gap-2 mt-1">
                <img src="/sprites/crate.png" alt="" width={24} height={24} style={{ imageRendering: 'pixelated', flexShrink: 0 }} />
                <input
                  type="number" min="0" step="0.01"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.00"
                  className="pixel-input"
                />
              </div>
            </div>

            {buyPreview && (
              <div className="p-2 flex flex-col gap-1"
                style={{ background: '#1a1200', border: '2px solid #7a5a20', fontFamily: 'VT323, monospace', fontSize: '17px' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#b08030' }}>Crop cost</span>
                  <span style={{ color: 'var(--gold)' }}><GoldCoin size={14} /> {formatUsdc(buyPreview.usdcCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#b08030' }}>Merchant fee</span>
                  <span style={{ color: 'var(--muted)' }}><GoldCoin size={14} /> {formatUsdc(buyPreview.fee)}</span>
                </div>
                <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px dashed #7a5a20' }}>
                  <span className="pixel-font text-[7px]" style={{ color: '#b08030' }}>TOTAL USDC</span>
                  <span style={{ color: 'var(--gold)', fontSize: '20px' }}><GoldCoin size={16} /> {formatUsdc(buyPreview.total)}</span>
                </div>
              </div>
            )}

            {buyError && <p style={{ color: 'var(--red)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{buyError}</p>}
            {buySuccess && <p style={{ color: 'var(--accent)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{buySuccess}</p>}

            <button
              onClick={handleBuy}
              disabled={buyLoading || !buyAmount || !isConnected}
              className="pixel-btn pixel-btn-primary w-full"
              style={{ opacity: buyLoading || !buyAmount || !isConnected ? 0.6 : 1 }}
            >
              {buyLoading ? 'BUYING...' : `BUY ${buySymbol}`}
              {buyCommodity && !buyLoading && (
                <img src={buyCommodity.sprite} alt="" width={14} height={14}
                  style={{ imageRendering: 'pixelated', display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }} />
              )}
            </button>
          </div>
        </PixelCard>

        {/* SELL */}
        <PixelCard>
          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
            <span style={{ fontSize: '20px' }}>💰</span>
            <span className="pixel-font text-[10px]" style={{ color: 'var(--red)' }}>SELL CROPS</span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>SELECT CROP</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {COMMODITIES.map((c) => (
                  <button
                    key={c.symbol}
                    onClick={() => setSellSymbol(c.symbol as CommoditySymbol)}
                    className="pixel-btn"
                    style={{
                      padding: '4px 8px',
                      fontSize: '8px',
                      background: sellSymbol === c.symbol ? 'var(--red)' : 'var(--surface)',
                      borderColor: sellSymbol === c.symbol ? '#a03030' : 'var(--border)',
                      color: sellSymbol === c.symbol ? 'var(--white)' : 'var(--muted)',
                    }}
                  >
                    <img src={c.sprite} alt={c.name} width={16} height={16}
                      style={{ imageRendering: 'pixelated', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>AMOUNT (UNITS)</label>
              <div className="flex items-center gap-2 mt-1">
                <img src="/sprites/crate.png" alt="" width={24} height={24} style={{ imageRendering: 'pixelated', flexShrink: 0 }} />
                <input
                  type="number" min="0" step="0.01"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0.00"
                  className="pixel-input"
                />
              </div>
            </div>

            {sellPreview && (
              <div className="p-2 flex flex-col gap-1"
                style={{ background: '#1a1200', border: '2px solid #7a5a20', fontFamily: 'VT323, monospace', fontSize: '17px' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#b08030' }}>Merchant fee</span>
                  <span style={{ color: 'var(--muted)' }}><GoldCoin size={14} /> {formatUsdc(sellPreview.fee)}</span>
                </div>
                <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px dashed #7a5a20' }}>
                  <span className="pixel-font text-[7px]" style={{ color: '#b08030' }}>YOU RECEIVE</span>
                  <span style={{ color: 'var(--gold)', fontSize: '20px' }}><GoldCoin size={16} /> {formatUsdc(sellPreview.usdcReceived)}</span>
                </div>
              </div>
            )}

            {sellError && <p style={{ color: 'var(--red)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{sellError}</p>}
            {sellSuccess && <p style={{ color: 'var(--accent)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{sellSuccess}</p>}

            <button
              onClick={handleSell}
              disabled={sellLoading || !sellAmount || !isConnected}
              className="pixel-btn pixel-btn-red w-full"
              style={{ opacity: sellLoading || !sellAmount || !isConnected ? 0.6 : 1 }}
            >
              {sellLoading ? 'SELLING...' : `SELL ${sellSymbol}`}
              {sellCommodity && !sellLoading && (
                <img src={sellCommodity.sprite} alt="" width={14} height={14}
                  style={{ imageRendering: 'pixelated', display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }} />
              )}
            </button>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}
