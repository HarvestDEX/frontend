'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { config } from '../../lib/wagmi'
import { COMMODITIES } from '../../lib/constants'
import { SPOT_CONTRACT } from '../../lib/contracts'
import PixelCard from './PixelCard'

// Minimal ERC-20 ABI for balanceOf
const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

interface Holding {
  symbol: string
  name: string
  sprite: string
  color: string
  unit: string
  balance: bigint
  tokenAddress: string
  price: number | null
}

export default function Portfolio() {
  const { address, isConnected } = useAccount()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(false)
  const [prices, setPrices] = useState<Record<string, number>>({})

  // Fetch prices
  useEffect(() => {
    fetch('/api/v1/prices')
      .then((r) => r.json())
      .then((data) => setPrices(data))
      .catch(() => {})
  }, [])

  // Fetch token balances
  useEffect(() => {
    if (!isConnected || !address) {
      setHoldings([])
      return
    }

    async function fetchHoldings() {
      setLoading(true)
      const results: Holding[] = []

      for (const commodity of COMMODITIES) {
        try {
          // Get token address from SpotMarket
          const tokenAddr = await readContract(config, {
            ...SPOT_CONTRACT,
            functionName: 'commodityTokens',
            args: [commodity.symbol],
          }) as `0x${string}`

          if (!tokenAddr || tokenAddr === '0x0000000000000000000000000000000000000000') continue

          // Get balance
          const balance = await readContract(config, {
            address: tokenAddr,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address!],
          }) as bigint

          results.push({
            symbol: commodity.symbol,
            name: commodity.name,
            sprite: commodity.sprite,
            color: commodity.color,
            unit: commodity.unit,
            balance,
            tokenAddress: tokenAddr,
            price: null,
          })
        } catch {
          // skip if can't read
        }
      }

      setHoldings(results)
      setLoading(false)
    }

    fetchHoldings()
  }, [isConnected, address])

  const hasHoldings = holdings.some((h) => h.balance > BigInt(0))

  if (!isConnected) return null

  return (
    <PixelCard>
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
        <img src="/sprites/crate.png" alt="" width={24} height={24} style={{ imageRendering: 'pixelated' }} />
        <span className="pixel-font text-[10px]" style={{ color: 'var(--gold)' }}>MY CROPS</span>
        <span style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '15px', marginLeft: '8px' }}>
          Spot token holdings
        </span>
      </div>

      {loading && (
        <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '17px' }}>
          Checking your barn inventory...
        </p>
      )}

      {!loading && !hasHoldings && (
        <div className="flex items-center gap-3 py-2">
          <img src="/sprites/signpost.png" alt="" width={24} height={32} style={{ imageRendering: 'pixelated' }} />
          <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            No crops in your inventory. Buy some from the Market Stall!
          </p>
        </div>
      )}

      {!loading && hasHoldings && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {holdings.filter((h) => h.balance > BigInt(0)).map((h) => {
            const balanceNum = Number(h.balance) / 1e18
            const price = prices[h.symbol as keyof typeof prices]
            const value = typeof price === 'number' ? balanceNum * price : null

            return (
              <div
                key={h.symbol}
                className="flex items-center gap-3 p-3"
                style={{
                  background: 'var(--surface)',
                  border: `2px solid ${h.color}`,
                  boxShadow: `inset -2px -2px 0 0 rgba(0,0,0,0.3), inset 2px 2px 0 0 ${h.color}33`,
                }}
              >
                <img
                  src={h.sprite}
                  alt={h.name}
                  width={36}
                  height={36}
                  style={{ imageRendering: 'pixelated', flexShrink: 0 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="pixel-font text-[8px]" style={{ color: h.color }}>{h.symbol}</span>
                    <span style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '14px' }}>
                      {h.unit}
                    </span>
                  </div>
                  <div style={{ color: 'var(--white)', fontFamily: 'VT323, monospace', fontSize: '22px' }}>
                    {balanceNum.toFixed(balanceNum < 1 ? 4 : 2)} units
                  </div>
                  {value !== null && (
                    <div className="flex items-center gap-1">
                      <img src="/sprites/usdc-coin.png" alt="usdc" width={13} height={13} style={{ imageRendering: 'pixelated' }} />
                      <span style={{ color: 'var(--gold)', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
                        ${value.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Total portfolio value */}
      {!loading && hasHoldings && (
        <div
          className="mt-3 p-2 flex items-center justify-between"
          style={{ background: '#1a1200', border: '2px solid #7a5a20' }}
        >
          <span className="pixel-font text-[7px]" style={{ color: '#b08030' }}>TOTAL VALUE</span>
          <span style={{ color: 'var(--gold)', fontFamily: 'VT323, monospace', fontSize: '22px' }}>
            <img src="/sprites/usdc-coin.png" alt="usdc" width={16} height={16}
              style={{ imageRendering: 'pixelated', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            ${holdings
              .filter((h) => h.balance > BigInt(0))
              .reduce((sum, h) => {
                const balanceNum = Number(h.balance) / 1e18
                const price = prices[h.symbol as keyof typeof prices]
                return sum + (typeof price === 'number' ? balanceNum * price : 0)
              }, 0)
              .toFixed(2)}
          </span>
        </div>
      )}
    </PixelCard>
  )
}
