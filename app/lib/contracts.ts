import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES } from './constants'
import MockUSDCABI from './abi/MockUSDC.json'
import SpotMarketABI from './abi/SpotMarket.json'
import LiquidityPoolABI from './abi/LiquidityPool.json'
import PositionManagerABI from './abi/PositionManager.json'
import PriceOracleABI from './abi/PriceOracle.json'

/**
 * Create contract instances from an ethers Signer.
 * The signer comes from wagmi via the useEthersSigner() hook.
 * Uses ethers.getAddress() to ensure checksummed addresses (avoids ENS resolution).
 */
export function getContracts(signer: ethers.Signer) {
  const addr = CONTRACT_ADDRESSES

  // Validate addresses exist before creating contracts
  if (!addr.mockUSDC || !addr.spotMarket || !addr.positionManager) {
    throw new Error('Contract addresses not configured')
  }

  return {
    usdc: new ethers.Contract(ethers.getAddress(addr.mockUSDC), MockUSDCABI, signer),
    oracle: new ethers.Contract(ethers.getAddress(addr.priceOracle), PriceOracleABI, signer),
    spot: new ethers.Contract(ethers.getAddress(addr.spotMarket), SpotMarketABI, signer),
    lp: new ethers.Contract(ethers.getAddress(addr.liquidityPool), LiquidityPoolABI, signer),
    pm: new ethers.Contract(ethers.getAddress(addr.positionManager), PositionManagerABI, signer),
  }
}
