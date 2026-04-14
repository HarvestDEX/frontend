'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseUnits } from 'viem'
import { config } from '../../lib/wagmi'
import { COMMODITIES, CONTRACT_ADDRESSES } from '../../lib/constants'
import { USDC_CONTRACT, SPOT_CONTRACT } from '../../lib/contracts'

interface Props {
  onTxSuccess: () => void
}

type CommoditySymbol = 'RICE' | 'COFFEE' | 'CORN' | 'CPO'
type Mode = 'buy' | 'sell'

function formatUsdc(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(2)
}

export default function SpotTrading({ onTxSuccess }: Props) {
  const { address, isConnected } = useAccount()
  const [mode, setMode] = useState<Mode>('buy')
  const [symbol, setSymbol] = useState<CommoditySymbol>('RICE')
  const [amount, setAmount] = useState('')
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { writeContractAsync } = useWriteContract()

  // Fetch preview
  useEffect(() => {
    setPreview(null)
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return
    const timeout = setTimeout(async () => {
      try {
        const tokenAmt = parseUnits(amount, 18)
        if (mode === 'buy') {
          const result = await readContract(config, {
            ...SPOT_CONTRACT, functionName: 'previewBuy', args: [symbol, tokenAmt],
          }) as [bigint, bigint, bigint]
          setPreview({ usdcCost: result[0], fee: result[1], total: result[2] })
        } else {
          const result = await readContract(config, {
            ...SPOT_CONTRACT, functionName: 'previewSell', args: [symbol, tokenAmt],
          }) as [bigint, bigint]
          setPreview({ usdcReceived: result[0], fee: result[1] })
        }
      } catch { setPreview(null) }
    }, 400)
    return () => clearTimeout(timeout)
  }, [symbol, amount, mode])

  async function handleTrade() {
    if (!isConnected || !amount) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const tokenAmt = parseUnits(amount, 18)
      if (mode === 'buy') {
        const result = await readContract(config, {
          ...SPOT_CONTRACT, functionName: 'previewBuy', args: [symbol, tokenAmt],
        }) as [bigint, bigint, bigint]
        await writeContractAsync({
          ...USDC_CONTRACT, functionName: 'approve',
          args: [CONTRACT_ADDRESSES.spotMarket as `0x${string}`, result[2]],
        })
        await writeContractAsync({
          ...SPOT_CONTRACT, functionName: 'buy', args: [symbol, tokenAmt],
        })
        setSuccess(`Bought ${amount} ${symbol}!`)
      } else {
        await writeContractAsync({
          ...SPOT_CONTRACT, functionName: 'sell', args: [symbol, tokenAmt],
        })
        setSuccess(`Sold ${amount} ${symbol}!`)
      }
      setAmount('')
      setPreview(null)
      onTxSuccess()
    } catch (err: any) {
      if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
        setError('Transaction rejected.')
      } else {
        setError(err?.shortMessage || err?.message || 'Transaction failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const commodity = COMMODITIES.find((c) => c.symbol === symbol)

  return (
    <div className="pixel-card" style={{ padding: '10px' }}>
      {/* Buy/Sell toggle */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <button onClick={() => { setMode('buy'); setAmount(''); setPreview(null); setError(''); setSuccess('') }}
          style={{
            flex: 1, padding: '4px', cursor: 'pointer',
            fontFamily: 'Press Start 2P, monospace', fontSize: '9px',
            background: mode === 'buy' ? 'var(--accent)' : 'var(--surface)',
            border: `2px solid ${mode === 'buy' ? 'var(--accent)' : 'var(--border)'}`,
            color: mode === 'buy' ? 'var(--bg)' : 'var(--muted)',
          }}>
          BUY
        </button>
        <button onClick={() => { setMode('sell'); setAmount(''); setPreview(null); setError(''); setSuccess('') }}
          style={{
            flex: 1, padding: '4px', cursor: 'pointer',
            fontFamily: 'Press Start 2P, monospace', fontSize: '9px',
            background: mode === 'sell' ? 'var(--red)' : 'var(--surface)',
            border: `2px solid ${mode === 'sell' ? '#a03030' : 'var(--border)'}`,
            color: mode === 'sell' ? 'var(--white)' : 'var(--muted)',
          }}>
          SELL
        </button>
      </div>

      {/* Commodity selector */}
      <div style={{ marginBottom: '8px' }}>
        <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>CROP</label>
        <div className="flex gap-1 mt-1 flex-wrap">
          {COMMODITIES.map((c) => (
            <button key={c.symbol} onClick={() => setSymbol(c.symbol as CommoditySymbol)}
              style={{
                padding: '3px 6px', fontSize: '7px', cursor: 'pointer',
                fontFamily: 'Press Start 2P, monospace',
                background: symbol === c.symbol ? (mode === 'buy' ? 'var(--accent)' : 'var(--red)') : 'var(--surface)',
                border: `1px solid ${symbol === c.symbol ? (mode === 'buy' ? 'var(--accent)' : '#a03030') : 'var(--border)'}`,
                color: symbol === c.symbol ? (mode === 'buy' ? 'var(--bg)' : 'var(--white)') : 'var(--muted)',
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
              <img src={c.sprite} alt={c.name} width={14} height={14}
                style={{ imageRendering: 'pixelated' }} />
              {c.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: '8px' }}>
        <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>AMOUNT</label>
        <input type="number" min="0" step="0.01" value={amount}
          onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
          className="pixel-input" style={{ marginTop: '4px', padding: '6px 8px', fontSize: '16px' }} />
      </div>

      {/* Preview */}
      {preview && (
        <div style={{
          padding: '6px 8px', marginBottom: '8px',
          background: '#1a1200', border: '1px solid #7a5a20',
          fontFamily: 'VT323, monospace', fontSize: '15px',
        }}>
          {mode === 'buy' ? (
            <>
              <div className="flex justify-between">
                <span style={{ color: '#b08030' }}>Cost</span>
                <span style={{ color: 'var(--gold)' }}>{formatUsdc(preview.usdcCost)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#b08030' }}>Fee (0.3%)</span>
                <span style={{ color: 'var(--muted)' }}>{formatUsdc(preview.fee)} USDC</span>
              </div>
              <div className="flex justify-between" style={{ borderTop: '1px dashed #7a5a20', paddingTop: '4px', marginTop: '4px' }}>
                <span className="pixel-font text-[7px]" style={{ color: '#b08030' }}>TOTAL</span>
                <span style={{ color: 'var(--gold)', fontSize: '18px' }}>{formatUsdc(preview.total)} USDC</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span style={{ color: '#b08030' }}>Fee (0.3%)</span>
                <span style={{ color: 'var(--muted)' }}>{formatUsdc(preview.fee)} USDC</span>
              </div>
              <div className="flex justify-between" style={{ borderTop: '1px dashed #7a5a20', paddingTop: '4px', marginTop: '4px' }}>
                <span className="pixel-font text-[7px]" style={{ color: '#b08030' }}>YOU GET</span>
                <span style={{ color: 'var(--gold)', fontSize: '18px' }}>{formatUsdc(preview.usdcReceived)} USDC</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      {error && <p style={{ color: 'var(--red)', fontFamily: 'VT323', fontSize: '14px', margin: '0 0 6px' }}>{error}</p>}
      {success && <p style={{ color: 'var(--accent)', fontFamily: 'VT323', fontSize: '14px', margin: '0 0 6px' }}>{success}</p>}

      {/* Action button */}
      <button onClick={handleTrade} disabled={loading || !amount || !isConnected}
        className={`pixel-btn w-full ${mode === 'buy' ? 'pixel-btn-primary' : 'pixel-btn-red'}`}
        style={{ opacity: loading || !amount || !isConnected ? 0.6 : 1, padding: '8px' }}>
        {loading ? (mode === 'buy' ? 'BUYING...' : 'SELLING...') : `${mode === 'buy' ? 'BUY' : 'SELL'} ${symbol}`}
        {commodity && !loading && (
          <img src={commodity.sprite} alt="" width={14} height={14}
            style={{ imageRendering: 'pixelated', display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }} />
        )}
      </button>

      {!isConnected && (
        <p style={{ color: 'var(--muted)', fontFamily: 'VT323', fontSize: '14px', textAlign: 'center', marginTop: '6px' }}>
          Connect wallet to trade
        </p>
      )}
    </div>
  )
}
