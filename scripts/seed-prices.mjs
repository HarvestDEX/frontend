import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_D1ePc7UVbiox@ep-wandering-sky-a1n4u22s.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

// Base prices (roughly real commodity prices)
const BASE_PRICES = {
  RICE: 17.24,
  COFFEE: 425.75,
  CORN: 7.40,
  CPO: 1159.31,
}

// Generate random walk price data
function generatePriceHistory(basePrice, hours, intervalMinutes = 10) {
  const points = Math.floor((hours * 60) / intervalMinutes)
  const prices = []
  let price = basePrice

  for (let i = 0; i < points; i++) {
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * basePrice * 0.003
    price = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, price + change))

    const time = new Date(Date.now() - (points - i) * intervalMinutes * 60 * 1000)
    prices.push({ price: parseFloat(price.toFixed(4)), time })
  }

  return prices
}

async function seed() {
  console.log('Creating table...')
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

  // Clear old data
  await sql`DELETE FROM price_history`
  console.log('Cleared old data')

  // Seed 7 days of data for each commodity
  for (const [symbol, basePrice] of Object.entries(BASE_PRICES)) {
    const history = generatePriceHistory(basePrice, 168, 10) // 7 days, every 10 min
    console.log(`Seeding ${symbol}: ${history.length} points...`)

    // Insert in batches of 50
    for (let i = 0; i < history.length; i += 50) {
      const batch = history.slice(i, i + 50)
      for (const point of batch) {
        await sql`
          INSERT INTO price_history (symbol, price, recorded_at)
          VALUES (${symbol}, ${point.price}, ${point.time.toISOString()})
        `
      }
    }
    console.log(`  Done: ${symbol}`)
  }

  console.log('Seed complete!')
}

seed().catch(console.error)
