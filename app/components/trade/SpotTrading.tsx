'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { COMMODITIES, CONTRACT_ADDRESSES } from '../../lib/constants'
import PixelCard from './PixelCard'

interface Props {
  contracts: any
  signer: ethers.Signer | null
  onTxSuccess: () => void
}

type CommoditySymbol = 'RICE' | 'COFFEE' | 'CORN' | 'CPO'

function formatUsdc(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(2)
}

export default function SpotTrading({ contracts, signer, onTxSuccess }: Props) {
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

  // Fetch buy preview
  useEffect(() => {
    setBuyPreview(null)
    if (!contracts || !buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) return
    const timeout = setTimeout(async () => {
      try {
        const tokenAmt = ethers.parseUnits(buyAmount, 18)
        const result = await contracts.spot.previewBuy(buySymbol, tokenAmt)
        setBuyPreview({ usdcCost: result[0], fee: result[1], total: result[2] })
      } catch {
        setBuyPreview(null)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [contracts, buySymbol, buyAmount])

  // Fetch sell preview
  useEffect(() => {
    setSellPreview(null)
    if (!contracts || !sellAmount || isNaN(Number(sellAmount)) || Number(sellAmount) <= 0) return
    const timeout = setTimeout(async () => {
      try {
        const tokenAmt = ethers.parseUnits(sellAmount, 18)
        const result = await contracts.spot.previewSell(sellSymbol, tokenAmt)
        setSellPreview({ usdcReceived: result[0], fee: result[1] })
      } catch {
        setSellPreview(null)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [contracts, sellSymbol, sellAmount])

  async function handleBuy() {
    if (!contracts || !signer || !buyAmount) return
    setBuyLoading(true)
    setBuyError('')
    setBuySuccess('')
    try {
      const tokenAmt = ethers.parseUnits(buyAmount, 18)
      const result = await contracts.spot.previewBuy(buySymbol, tokenAmt)
      const total: bigint = result[2]

      // Approve USDC
      const approveTx = await contracts.usdc.approve(CONTRACT_ADDRESSES.spotMarket, total)
      await approveTx.wait()

      // Buy
      const buyTx = await contracts.spot.buy(buySymbol, tokenAmt)
      await buyTx.wait()

      setBuySuccess(`Bought ${buyAmount} ${buySymbol} tokens!`)
      setBuyAmount('')
      setBuyPreview(null)
      onTxSuccess()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setBuyError('Transaction rejected.')
      } else {
        setBuyError(err?.reason || err?.message || 'Transaction failed.')
      }
    } finally {
      setBuyLoading(false)
    }
  }

  async function handleSell() {
    if (!contracts || !signer || !sellAmount) return
    setSellLoading(true)
    setSellError('')
    setSellSuccess('')
    try {
      const tokenAmt = ethers.parseUnits(sellAmount, 18)
      const sellTx = await contracts.spot.sell(sellSymbol, tokenAmt)
      await sellTx.wait()

      setSellSuccess(`Sold ${sellAmount} ${sellSymbol} tokens!`)
      setSellAmount('')
      setSellPreview(null)
      onTxSuccess()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setSellError('Transaction rejected.')
      } else {
        setSellError(err?.reason || err?.message || 'Transaction failed.')
      }
    } finally {
      setSellLoading(false)
    }
  }

  if (!contracts) {
    return (
      <PixelCard>
        <p style={{ color: 'var(--muted)' }} className="pixel-font text-[8px]">CONNECT WALLET TO TRADE</p>
      </PixelCard>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* BUY */}
      <PixelCard title="BUY TOKENS">
        <div className="flex flex-col gap-3">
          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>COMMODITY</label>
            <select
              value={buySymbol}
              onChange={(e) => setBuySymbol(e.target.value as CommoditySymbol)}
              className="pixel-input mt-1"
              style={{ background: 'var(--surface)' }}
            >
              {COMMODITIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.emoji} {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>AMOUNT (TOKENS)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="0.00"
              className="pixel-input mt-1"
            />
          </div>

          {buyPreview && (
            <div className="p-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Cost</span>
                <span className="price-gold">${formatUsdc(buyPreview.usdcCost)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Fee (0.3%)</span>
                <span style={{ color: 'var(--muted)' }}>${formatUsdc(buyPreview.fee)} USDC</span>
              </div>
              <div className="flex justify-between border-t mt-1 pt-1" style={{ borderColor: 'var(--border)' }}>
                <span className="pixel-font text-[8px]">TOTAL</span>
                <span className="price-gold">${formatUsdc(buyPreview.total)} USDC</span>
              </div>
            </div>
          )}

          {buyError && <p style={{ color: 'var(--red)' }} className="text-sm">{buyError}</p>}
          {buySuccess && <p style={{ color: 'var(--accent)' }} className="text-sm">{buySuccess}</p>}

          <button
            onClick={handleBuy}
            disabled={buyLoading || !buyAmount}
            className="pixel-btn pixel-btn-primary w-full"
            style={{ opacity: buyLoading || !buyAmount ? 0.6 : 1 }}
          >
            {buyLoading ? 'BUYING...' : `BUY ${buySymbol}`}
          </button>
        </div>
      </PixelCard>

      {/* SELL */}
      <PixelCard title="SELL TOKENS">
        <div className="flex flex-col gap-3">
          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>COMMODITY</label>
            <select
              value={sellSymbol}
              onChange={(e) => setSellSymbol(e.target.value as CommoditySymbol)}
              className="pixel-input mt-1"
              style={{ background: 'var(--surface)' }}
            >
              {COMMODITIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.emoji} {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>AMOUNT (TOKENS)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              placeholder="0.00"
              className="pixel-input mt-1"
            />
          </div>

          {sellPreview && (
            <div className="p-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Fee (0.3%)</span>
                <span style={{ color: 'var(--muted)' }}>${formatUsdc(sellPreview.fee)} USDC</span>
              </div>
              <div className="flex justify-between border-t mt-1 pt-1" style={{ borderColor: 'var(--border)' }}>
                <span className="pixel-font text-[8px]">YOU RECEIVE</span>
                <span className="price-gold">${formatUsdc(sellPreview.usdcReceived)} USDC</span>
              </div>
            </div>
          )}

          {sellError && <p style={{ color: 'var(--red)' }} className="text-sm">{sellError}</p>}
          {sellSuccess && <p style={{ color: 'var(--accent)' }} className="text-sm">{sellSuccess}</p>}

          <button
            onClick={handleSell}
            disabled={sellLoading || !sellAmount}
            className="pixel-btn pixel-btn-red w-full"
            style={{ opacity: sellLoading || !sellAmount ? 0.6 : 1 }}
          >
            {sellLoading ? 'SELLING...' : `SELL ${sellSymbol}`}
          </button>
        </div>
      </PixelCard>
    </div>
  )
}
