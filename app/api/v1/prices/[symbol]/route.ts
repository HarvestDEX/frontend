import { NextResponse } from 'next/server'
import { getCommodityPrices } from '@/app/lib/prices'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const sym = symbol.toUpperCase()
    const prices = getCommodityPrices()
    const price = prices[sym as keyof typeof prices]
    if (!price || typeof price !== 'number') {
      return NextResponse.json({ error: 'Unknown symbol' }, { status: 404 })
    }
    return NextResponse.json({ symbol: sym, price, updatedAt: prices.updatedAt })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
