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

function formatLpPrice(raw: bigint): string {
  return (Number(raw) / 1e6).toFixed(6)
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

function StatBox({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-1 p-2"
      style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}
    >
      <p className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>{label}</p>
      <div className="flex items-center gap-1">
        {icon}
        <span style={{ color: 'var(--gold)', fontFamily: 'VT323, monospace', fontSize: '20px' }}>{value}</span>
      </div>
    </div>
  )
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

      setDepositSuccess(`Deposited ${depositAmount} USDC into the treasury!`)
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

      setWithdrawSuccess(`Withdrawn ${withdrawAmount} shares from treasury!`)
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
      <PixelCard icon="/sprites/treasure-chest.png" iconSize={48}>
        <p className="pixel-font text-[8px]" style={{ color: 'var(--muted)' }}>
          CONNECT WALLET TO ACCESS THE TREASURY
        </p>
      </PixelCard>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-3 px-1">
        <img src="/sprites/treasure-chest.png" alt="treasure chest" width={48} height={48} style={{ imageRendering: 'pixelated' }} />
        <div>
          <h2 className="pixel-font text-[11px]" style={{ color: 'var(--gold)' }}>THE TREASURY</h2>
          <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
            Deposit USDC, earn fees from all trades
          </p>
        </div>
        <img src="/sprites/well.png" alt="" width={32} height={36} style={{ imageRendering: 'pixelated', marginLeft: 'auto' }} />
      </div>

      {/* Pool Stats */}
      <PixelCard>
        <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          <span className="pixel-font text-[10px]" style={{ color: 'var(--gold)' }}>TREASURY LEDGER</span>
        </div>

        {statsLoading ? (
          <p style={{ color: 'var(--muted)', fontFamily: 'VT323, monospace', fontSize: '17px' }}>
            Counting coins...
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <StatBox
              label="TREASURY USDC"
              value={`${formatUsdc(poolBalance)} USDC`}
              icon={<GoldCoin size={18} />}
            />
            <StatBox
              label="SHARE PRICE"
              value={`$${formatLpPrice(lpPrice)}`}
              icon={<img src="/sprites/usdc-coin.png" alt="" width={16} height={16} style={{ imageRendering: 'pixelated' }} />}
            />
            <StatBox
              label="TOTAL FEES EARNED"
              value={`${formatUsdc(totalFees)} USDC`}
              icon={<img src="/sprites/treasure-chest.png" alt="" width={18} height={18} style={{ imageRendering: 'pixelated' }} />}
            />
            <StatBox
              label="YOUR SHARES"
              value={`${formatLp(userLpBalance)} lpUSDC`}
              icon={<span style={{ fontSize: '16px' }}>🏦</span>}
            />
            <StatBox
              label="YOUR VALUE"
              value={`${formatUsdc(userPreviewWithdraw)} USDC`}
              icon={<GoldCoin size={18} />}
            />
          </div>
        )}
      </PixelCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposit */}
        <PixelCard>
          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
            <GoldCoin size={20} />
            <span className="pixel-font text-[10px]" style={{ color: 'var(--accent)' }}>DEPOSIT USDC</span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>AMOUNT (USDC)</label>
              <div className="flex items-center gap-2 mt-1">
                <GoldCoin size={24} />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="100"
                  className="pixel-input"
                />
              </div>
            </div>

            {depositAmount && !isNaN(Number(depositAmount)) && Number(depositAmount) > 0 && (
              <div
                className="p-2 flex flex-col gap-1"
                style={{
                  background: '#1a1200',
                  border: '2px solid #7a5a20',
                  fontFamily: 'VT323, monospace',
                  fontSize: '17px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: '#b08030' }}>You deposit</span>
                  <span style={{ color: 'var(--gold)' }}>
                    <GoldCoin size={14} /> {Number(depositAmount).toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#b08030' }}>You receive ~</span>
                  <span style={{ color: 'var(--accent)' }}>
                    {lpPrice > BigInt(0)
                      ? (Number(depositAmount) / (Number(lpPrice) / 1e6)).toFixed(4)
                      : Number(depositAmount).toFixed(4)
                    } lpUSDC
                  </span>
                </div>
              </div>
            )}

            {depositError && (
              <p style={{ color: 'var(--red)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{depositError}</p>
            )}
            {depositSuccess && (
              <p style={{ color: 'var(--accent)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{depositSuccess}</p>
            )}

            <button
              onClick={handleDeposit}
              disabled={depositLoading || !depositAmount}
              className="pixel-btn pixel-btn-primary w-full"
              style={{ opacity: depositLoading || !depositAmount ? 0.6 : 1 }}
            >
              {depositLoading ? 'DEPOSITING...' : 'DEPOSIT USDC'}
            </button>
          </div>
        </PixelCard>

        {/* Withdraw */}
        <PixelCard>
          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
            <img src="/sprites/treasure-chest.png" alt="" width={20} height={20} style={{ imageRendering: 'pixelated' }} />
            <span className="pixel-font text-[10px]" style={{ color: 'var(--red)' }}>WITHDRAW USDC</span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Current balance info */}
            <div
              className="p-2 flex flex-col gap-1"
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                fontFamily: 'VT323, monospace',
                fontSize: '17px',
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--muted)' }}>Your shares</span>
                <span style={{ color: 'var(--gold)' }}>{formatLp(userLpBalance)} lpUSDC</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--muted)' }}>Redeemable for</span>
                <span style={{ color: 'var(--accent)' }}>
                  <GoldCoin size={14} /> {formatUsdc(userPreviewWithdraw)} USDC
                </span>
              </div>
            </div>

            <div>
              <label className="pixel-font text-[7px]" style={{ color: 'var(--muted)' }}>AMOUNT (lpUSDC)</label>
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
              onClick={() => setWithdrawAmount(formatLp(userLpBalance))}
              className="pixel-btn"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--muted)',
                fontSize: '8px',
                padding: '4px 8px',
              }}
            >
              MAX
            </button>

            {withdrawError && (
              <p style={{ color: 'var(--red)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{withdrawError}</p>
            )}
            {withdrawSuccess && (
              <p style={{ color: 'var(--accent)', fontFamily: 'VT323, monospace', fontSize: '16px' }}>{withdrawSuccess}</p>
            )}

            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading || !withdrawAmount || userLpBalance === BigInt(0)}
              className="pixel-btn pixel-btn-red w-full"
              style={{ opacity: withdrawLoading || !withdrawAmount || userLpBalance === BigInt(0) ? 0.6 : 1 }}
            >
              {withdrawLoading ? 'WITHDRAWING...' : 'WITHDRAW USDC'}
            </button>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}
