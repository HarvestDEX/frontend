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
  mockUSDC:        '0xf3c59dccc2371171bb6223d5bba30865544365f0',
  priceOracle:     '0xd37b676a7a1be99862ed23d322855c87b3855905',
  spotMarket:      '0x8e365f606f1b9c34c9da6433aab7a7580cf3e9b0',
  liquidityPool:   '0x4b4cb1a442fb4fa70ac5e84c44c1f5166bc6c6a9',
  positionManager: '0xc7a0f9a92dc749ab54154d6fc52b9fc83f96aecc',
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.endpx.cloud'
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet-explorer.hsk.xyz'
