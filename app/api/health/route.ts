import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'harvest-frontend',
    chain: 'HashKey Chain Testnet (133)',
    symbols: ['RICE', 'COFFEE', 'CORN', 'CPO'],
  })
}
