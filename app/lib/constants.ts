export const COMMODITIES = [
  {
    symbol:    "RICE",
    name:      "Rice",
    fullName:  "Rough Rice (CBOT)",
    unit:      "per cwt",
    sprite:    "/sprites/rice.png",
    emoji:     "\u{1F33E}",
    color:     "#f0c060",
  },
  {
    symbol:    "COFFEE",
    name:      "Coffee",
    fullName:  "Arabica Coffee (ICE)",
    unit:      "per lb",
    sprite:    "/sprites/coffee.png",
    emoji:     "\u2615",
    color:     "#c08040",
  },
  {
    symbol:    "CORN",
    name:      "Corn",
    fullName:  "Corn (CBOT)",
    unit:      "per bushel",
    sprite:    "/sprites/corn.png",
    emoji:     "\u{1F33D}",
    color:     "#f0e060",
  },
  {
    symbol:    "CPO",
    name:      "Palm Oil",
    fullName:  "Crude Palm Oil (Bursa Malaysia)",
    unit:      "per MT",
    sprite:    "/sprites/cpo.png",
    emoji:     "\u{1F334}",
    color:     "#80c060",
  },
] as const

export type CommoditySymbol = typeof COMMODITIES[number]['symbol']

export const LEVERAGE_OPTIONS = [1, 2, 3, 5] as const

export const HASHKEY_TESTNET = {
  chainId:     133,
  chainIdHex:  '0x85',
  name:        "HashKey Chain Testnet",
  rpcUrl:      "https://hashkeychain-testnet.alt.technology",
  explorerUrl: "https://testnet-explorer.hsk.xyz",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 }
}

export const CONTRACT_ADDRESSES = {
  mockUSDC:        process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '',
  priceOracle:     process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS || '',
  spotMarket:      process.env.NEXT_PUBLIC_SPOT_MARKET_ADDRESS || '',
  liquidityPool:   process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS || '',
  positionManager: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS || '',
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet-explorer.hsk.xyz'
