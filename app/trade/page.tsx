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
      setFaucetSuccess('Claimed 1000 USDC!')
      refreshBalance()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setFaucetError('Transaction rejected.')
      } else if (err?.reason?.includes('cooldown')) {
        setFaucetError('Faucet cooldown active. Try again tomorrow.')
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'spot', label: 'SPOT TRADING' },
    { key: 'perp', label: 'LONG / SHORT' },
    { key: 'lp', label: 'LP POOL' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 gap-4 flex-wrap"
        style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="pixel-font text-[12px]" style={{ color: 'var(--accent)' }}>
            HarvestDEX
          </span>
        </div>

        {/* Price Ticker */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <PriceTicker />
        </div>

        {/* Wallet + Back */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {walletAddress ? (
            <div
              className="pixel-btn"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--accent)', cursor: 'default' }}
            >
              {truncateAddress(walletAddress)}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connectLoading}
              className="pixel-btn pixel-btn-primary"
              style={{ opacity: connectLoading ? 0.6 : 1 }}
            >
              {connectLoading ? 'CONNECTING...' : 'CONNECT WALLET'}
            </button>
          )}
          <Link
            href="/"
            className="pixel-btn"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)', textDecoration: 'none' }}
          >
            BACK
          </Link>
        </div>
      </header>

      {connectError && (
        <div className="px-4 py-2" style={{ background: 'var(--red)', color: 'var(--white)' }}>
          <span className="text-sm">{connectError}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* USDC Faucet */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 p-4"
          style={{ background: 'var(--card)', border: '2px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <span className="pixel-font text-[9px]" style={{ color: 'var(--gold)' }}>USDC FAUCET</span>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              Balance:{' '}
              <span className="price-gold">
                {(Number(usdcBalance) / 1e6).toFixed(2)} USDC
              </span>
            </span>
          </div>
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
              {!walletAddress && (
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Connect wallet first</span>
              )}
            </div>
            {faucetError && <p style={{ color: 'var(--red)' }} className="text-sm">{faucetError}</p>}
            {faucetSuccess && <p style={{ color: 'var(--accent)' }} className="text-sm">{faucetSuccess}</p>}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pixel-btn ${activeTab === tab.key ? 'pixel-btn-primary' : ''}`}
              style={
                activeTab !== tab.key
                  ? { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
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
