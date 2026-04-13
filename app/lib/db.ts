import { neon } from '@neondatabase/serverless'

/**
 * Get a Neon SQL client.
 * Requires DATABASE_URL env var (Neon connection string).
 */
export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

/**
 * Initialize the price_history table if it doesn't exist.
 * Called once on first API hit or cron job.
 */
export async function initDb() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS price_history (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL,
      price NUMERIC(18, 8) NOT NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_price_history_symbol_time
    ON price_history (symbol, recorded_at DESC)
  `
}

/**
 * Insert a price record for a commodity.
 */
export async function insertPrice(symbol: string, price: number) {
  const sql = getDb()
  await sql`
    INSERT INTO price_history (symbol, price, recorded_at)
    VALUES (${symbol}, ${price}, NOW())
  `
}

/**
 * Insert multiple prices at once (called by cron).
 */
export async function insertPrices(prices: Record<string, number>) {
  const sql = getDb()
  for (const [symbol, price] of Object.entries(prices)) {
    if (typeof price === 'number' && price > 0) {
      await sql`
        INSERT INTO price_history (symbol, price, recorded_at)
        VALUES (${symbol}, ${price}, NOW())
      `
    }
  }
}

/**
 * Get price history for a symbol.
 * @param symbol - e.g. "RICE"
 * @param hours - how many hours of history (default 24)
 */
export async function getPriceHistory(symbol: string, hours: number = 24) {
  const sql = getDb()
  const rows = await sql`
    SELECT price, recorded_at
    FROM price_history
    WHERE symbol = ${symbol}
      AND recorded_at > NOW() - INTERVAL '1 hour' * ${hours}
    ORDER BY recorded_at ASC
  `
  return rows.map((row: any) => ({
    price: parseFloat(row.price),
    time: row.recorded_at,
  }))
}

/**
 * Get latest prices for all symbols from DB.
 */
export async function getLatestPrices() {
  const sql = getDb()
  const rows = await sql`
    SELECT DISTINCT ON (symbol) symbol, price, recorded_at
    FROM price_history
    ORDER BY symbol, recorded_at DESC
  `
  const result: Record<string, { price: number; time: string }> = {}
  for (const row of rows) {
    result[row.symbol] = {
      price: parseFloat(row.price),
      time: row.recorded_at,
    }
  }
  return result
}
