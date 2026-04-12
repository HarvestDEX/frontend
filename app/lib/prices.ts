// Simulated commodity prices with random variance
// Base prices from real-world markets (April 2026)

export interface CommodityPrices {
  RICE: number
  COFFEE: number
  CORN: number
  CPO: number
  updatedAt: string
}

const BASE_PRICES = {
  RICE: 17.55,      // per cwt (CBOT)
  COFFEE: 427.80,   // per lb (ICE)
  CORN: 7.31,       // per bushel (CBOT)
  CPO: 1180.64,     // per metric ton (Bursa Malaysia)
}

const VARIANCE = 0.03 // +-3%

let cache: { data: CommodityPrices; timestamp: number } | null = null
const CACHE_TTL = 600_000 // 10 min

function applyVariance(basePrice: number): number {
  const change = 1 + (Math.random() * 2 - 1) * VARIANCE
  return parseFloat((basePrice * change).toFixed(4))
}

export function getCommodityPrices(): CommodityPrices {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data
  }

  const prices: CommodityPrices = {
    RICE: applyVariance(BASE_PRICES.RICE),
    COFFEE: applyVariance(BASE_PRICES.COFFEE),
    CORN: applyVariance(BASE_PRICES.CORN),
    CPO: applyVariance(BASE_PRICES.CPO),
    updatedAt: new Date().toISOString(),
  }

  cache = { data: prices, timestamp: Date.now() }
  return prices
}

export function toOnChainPrice(usdPrice: number): bigint {
  return BigInt(Math.round(usdPrice * 1e8))
}
