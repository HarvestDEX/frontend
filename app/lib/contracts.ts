import { ethers } from 'ethers'
import { HASHKEY_TESTNET, CONTRACT_ADDRESSES } from './constants'
import MockUSDCABI from './abi/MockUSDC.json'
import SpotMarketABI from './abi/SpotMarket.json'
import LiquidityPoolABI from './abi/LiquidityPool.json'
import PositionManagerABI from './abi/PositionManager.json'
import PriceOracleABI from './abi/PriceOracle.json'

declare global {
  interface Window {
    ethereum?: any
  }
}

export async function connectWallet(): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  // Request accounts
  await window.ethereum.request({ method: 'eth_requestAccounts' })

  // Switch to HashKey Chain Testnet
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HASHKEY_TESTNET.chainIdHex }],
    })
  } catch (switchError: any) {
    // Chain not added — add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: HASHKEY_TESTNET.chainIdHex,
          chainName: HASHKEY_TESTNET.name,
          nativeCurrency: HASHKEY_TESTNET.nativeCurrency,
          rpcUrls: [HASHKEY_TESTNET.rpcUrl],
          blockExplorerUrls: [HASHKEY_TESTNET.explorerUrl],
        }],
      })
    } else {
      throw switchError
    }
  }

  return new ethers.BrowserProvider(window.ethereum)
}

export function getContracts(signer: ethers.Signer) {
  return {
    usdc: new ethers.Contract(CONTRACT_ADDRESSES.mockUSDC, MockUSDCABI, signer),
    oracle: new ethers.Contract(CONTRACT_ADDRESSES.priceOracle, PriceOracleABI, signer),
    spot: new ethers.Contract(CONTRACT_ADDRESSES.spotMarket, SpotMarketABI, signer),
    lp: new ethers.Contract(CONTRACT_ADDRESSES.liquidityPool, LiquidityPoolABI, signer),
    pm: new ethers.Contract(CONTRACT_ADDRESSES.positionManager, PositionManagerABI, signer),
  }
}
