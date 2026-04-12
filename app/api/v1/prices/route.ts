import { NextResponse } from 'next/server'
import { getCommodityPrices } from '@/app/lib/prices'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prices = getCommodityPrices()
    return NextResponse.json(prices)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
