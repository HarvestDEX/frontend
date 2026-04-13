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
 */
export function getContracts(signer: ethers.Signer) {
  return {
    usdc: new ethers.Contract(CONTRACT_ADDRESSES.mockUSDC, MockUSDCABI, signer),
    oracle: new ethers.Contract(CONTRACT_ADDRESSES.priceOracle, PriceOracleABI, signer),
    spot: new ethers.Contract(CONTRACT_ADDRESSES.spotMarket, SpotMarketABI, signer),
    lp: new ethers.Contract(CONTRACT_ADDRESSES.liquidityPool, LiquidityPoolABI, signer),
    pm: new ethers.Contract(CONTRACT_ADDRESSES.positionManager, PositionManagerABI, signer),
  }
}
