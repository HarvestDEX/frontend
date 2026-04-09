'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES } from '../../lib/constants'
import PixelCard from './PixelCard'

interface Props {
  contracts: any
  signer: ethers.Signer | null
  onTxSuccess: () => void
}

function formatUsdc(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(2)
}

function formatLp(raw: bigint): string {
  return (Number(raw) / 1e18).toFixed(4)
}

// lpTokenPrice is returned as (poolBalance * 1e18) / totalSupply
// To get USDC price: result / 1e18 * (1e6/1e18)? No — contract returns usdc*1e18/lp
// so actual USDC per lp = result / 1e18  (since both pool and lp scaled)
// Actually: lpTokenPrice = (usdc.balanceOf * 1e18) / totalSupply
// usdc has 6 dec, lp has 18 dec. Price in USDC units: result / 1e18 * 1e6 / 1e6 = result / 1e18
// But result represents (usdcBalance_6dec * 1e18) / lpSupply_18dec
// = usdcBalance / lpSupply * 1e6  (in units of USDC-micro)
// Display: result / 1e6
function formatLpPrice(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(6)
}

export default function LPPool({ contracts, signer, onTxSuccess }: Props) {
  // Pool stats
  const [poolBalance, setPoolBalance] = useState<bigint>(BigInt(0))
  const [lpPrice, setLpPrice] = useState<bigint>(BigInt(0))
  const [totalFees, setTotalFees] = useState<bigint>(BigInt(0))
  const [userLpBalance, setUserLpBalance] = useState<bigint>(BigInt(0))
  const [userPreviewWithdraw, setUserPreviewWithdraw] = useState<bigint>(BigInt(0))
  const [statsLoading, setStatsLoading] = useState(false)

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState('')
  const [depositSuccess, setDepositSuccess] = useState('')

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState('')

  const fetchStats = useCallback(async () => {
    if (!contracts || !signer) return
    setStatsLoading(true)
    try {
      const address = await signer.getAddress()
      const lpAddr = CONTRACT_ADDRESSES.liquidityPool

      const [bal, price, fees, userLp, preview] = await Promise.all([
        contracts.usdc.balanceOf(lpAddr),
        contracts.lp.lpTokenPrice(),
        contracts.lp.totalFeesAccumulated(),
        contracts.lp.balanceOf(address),
        contracts.lp.previewWithdraw(address),
      ])

      setPoolBalance(bal)
      setLpPrice(price)
      setTotalFees(fees)
      setUserLpBalance(userLp)
      setUserPreviewWithdraw(preview)
    } catch {
      // silently fail
    } finally {
      setStatsLoading(false)
    }
  }, [contracts, signer])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  async function handleDeposit() {
    if (!contracts || !signer || !depositAmount) return
    setDepositLoading(true)
    setDepositError('')
    setDepositSuccess('')
    try {
      const usdcAmt = ethers.parseUnits(depositAmount, 6)

      // Approve USDC to LP
      const approveTx = await contracts.usdc.approve(CONTRACT_ADDRESSES.liquidityPool, usdcAmt)
      await approveTx.wait()

      // Deposit
      const depositTx = await contracts.lp.deposit(usdcAmt)
      await depositTx.wait()

      setDepositSuccess(`Deposited ${depositAmount} USDC into the pool!`)
      setDepositAmount('')
      onTxSuccess()
      fetchStats()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setDepositError('Transaction rejected.')
      } else {
        setDepositError(err?.reason || err?.message || 'Deposit failed.')
      }
    } finally {
      setDepositLoading(false)
    }
  }

  async function handleWithdraw() {
    if (!contracts || !signer || !withdrawAmount) return
    setWithdrawLoading(true)
    setWithdrawError('')
    setWithdrawSuccess('')
    try {
      const lpAmt = ethers.parseUnits(withdrawAmount, 18)

      const withdrawTx = await contracts.lp.withdraw(lpAmt)
      await withdrawTx.wait()

      setWithdrawSuccess(`Withdrawn ${withdrawAmount} lpUSDC!`)
      setWithdrawAmount('')
      onTxSuccess()
      fetchStats()
    } catch (err: any) {
      if (err?.code === 4001 || err?.info?.error?.code === 4001) {
        setWithdrawError('Transaction rejected.')
      } else {
        setWithdrawError(err?.reason || err?.message || 'Withdrawal failed.')
      }
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (!contracts) {
    return (
      <PixelCard>
        <p style={{ color: 'var(--muted)' }} className="pixel-font text-[8px]">CONNECT WALLET TO USE LP</p>
      </PixelCard>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pool Stats */}
      <PixelCard title="POOL STATS">
        {statsLoading ? (
          <p style={{ color: 'var(--muted)' }} className="text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <p className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>TOTAL POOL</p>
              <p className="price-gold">${formatUsdc(poolBalance)} USDC</p>
            </div>
            <div>
              <p className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>LP TOKEN PRICE</p>
              <p className="price-gold">${formatLpPrice(lpPrice)}</p>
            </div>
            <div>
              <p className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>FEES EARNED</p>
              <p style={{ color: 'var(--accent)' }} className="font-body">${formatUsdc(totalFees)} USDC</p>
            </div>
            <div>
              <p className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>YOUR lpUSDC</p>
              <p className="price-gold">{formatLp(userLpBalance)}</p>
            </div>
            <div>
              <p className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>YOUR VALUE</p>
              <p style={{ color: 'var(--accent)' }} className="font-body">${formatUsdc(userPreviewWithdraw)} USDC</p>
            </div>
          </div>
        )}
      </PixelCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposit */}
        <PixelCard title="DEPOSIT USDC">
          <div className="flex flex-col gap-3">
            <div>
              <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>AMOUNT (USDC)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="100"
                className="pixel-input mt-1"
              />
            </div>

            {depositAmount && !isNaN(Number(depositAmount)) && Number(depositAmount) > 0 && (
              <div className="p-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>You deposit</span>
                  <span className="price-gold">${Number(depositAmount).toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted)' }}>You receive ~</span>
                  <span className="price-gold">
                    {lpPrice > BigInt(0)
                      ? (Number(depositAmount) / (Number(lpPrice) / 1e6)).toFixed(4)
                      : Number(depositAmount).toFixed(4)
                    } lpUSDC
                  </span>
                </div>
              </div>
            )}

            {depositError && <p style={{ color: 'var(--red)' }} className="text-sm">{depositError}</p>}
            {depositSuccess && <p style={{ color: 'var(--accent)' }} className="text-sm">{depositSuccess}</p>}

            <button
              onClick={handleDeposit}
              disabled={depositLoading || !depositAmount}
              className="pixel-btn pixel-btn-primary w-full"
              style={{ opacity: depositLoading || !depositAmount ? 0.6 : 1 }}
            >
              {depositLoading ? 'DEPOSITING...' : 'DEPOSIT'}
            </button>
          </div>
        </PixelCard>

        {/* Withdraw */}
        <PixelCard title="WITHDRAW lpUSDC">
          <div className="flex flex-col gap-3">
            <div className="p-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Your lpUSDC</span>
                <span className="price-gold">{formatLp(userLpBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Redeemable for</span>
                <span style={{ color: 'var(--accent)' }}>${formatUsdc(userPreviewWithdraw)} USDC</span>
              </div>
            </div>

            <div>
              <label className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>AMOUNT (lpUSDC)</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.0000"
                className="pixel-input mt-1"
              />
            </div>

            <button
              onClick={() => {
                // Fill max
                setWithdrawAmount(formatLp(userLpBalance))
              }}
              className="pixel-btn"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)', fontSize: '8px', padding: '4px 8px' }}
            >
              MAX
            </button>

            {withdrawError && <p style={{ color: 'var(--red)' }} className="text-sm">{withdrawError}</p>}
            {withdrawSuccess && <p style={{ color: 'var(--accent)' }} className="text-sm">{withdrawSuccess}</p>}

            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading || !withdrawAmount || userLpBalance === BigInt(0)}
              className="pixel-btn pixel-btn-red w-full"
              style={{ opacity: withdrawLoading || !withdrawAmount || userLpBalance === BigInt(0) ? 0.6 : 1 }}
            >
              {withdrawLoading ? 'WITHDRAWING...' : 'WITHDRAW'}
            </button>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}
