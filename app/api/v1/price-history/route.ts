import { NextRequest, NextResponse } from 'next/server'
import { getPriceHistory, initDb } from '../../../lib/db'

let dbInitialized = false

/**
 * GET /api/v1/price-history?symbol=RICE&hours=24
 * Returns price history for charting.
 */
export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    if (!dbInitialized) {
      await initDb()
      dbInitialized = true
    }

    const { searchParams } = new URL(request.url)
    const symbol = (searchParams.get('symbol') || 'RICE').toUpperCase()
    const hours = parseInt(searchParams.get('hours') || '24')

    const validSymbols = ['RICE', 'COFFEE', 'CORN', 'CPO']
    if (!validSymbols.includes(symbol)) {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 })
    }

    const history = await getPriceHistory(symbol, Math.min(hours, 168)) // max 7 days

    return NextResponse.json({
      symbol,
      hours,
      data: history,
    })
  } catch (err: any) {
    console.error('Price history error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
