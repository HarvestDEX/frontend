import { type Abi } from 'viem'
import { CONTRACT_ADDRESSES } from './constants'
import MockUSDCABI from './abi/MockUSDC.json'
import SpotMarketABI from './abi/SpotMarket.json'
import LiquidityPoolABI from './abi/LiquidityPool.json'
import PositionManagerABI from './abi/PositionManager.json'
import PriceOracleABI from './abi/PriceOracle.json'

export const USDC_CONTRACT = {
  address: CONTRACT_ADDRESSES.mockUSDC as `0x${string}`,
  abi: MockUSDCABI as Abi,
} as const

export const ORACLE_CONTRACT = {
  address: CONTRACT_ADDRESSES.priceOracle as `0x${string}`,
  abi: PriceOracleABI as Abi,
} as const

export const SPOT_CONTRACT = {
  address: CONTRACT_ADDRESSES.spotMarket as `0x${string}`,
  abi: SpotMarketABI as Abi,
} as const

export const LP_CONTRACT = {
  address: CONTRACT_ADDRESSES.liquidityPool as `0x${string}`,
  abi: LiquidityPoolABI as Abi,
} as const

export const PM_CONTRACT = {
  address: CONTRACT_ADDRESSES.positionManager as `0x${string}`,
  abi: PositionManagerABI as Abi,
} as const
