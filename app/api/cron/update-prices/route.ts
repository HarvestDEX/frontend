import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { getCommodityPrices, toOnChainPrice } from '@/app/lib/prices'
import PriceOracleABI from '@/app/lib/abi/PriceOracle.json'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // seconds

const SYMBOLS = ['RICE', 'COFFEE', 'CORN', 'CPO']

export async function GET(request: Request) {
  // Optional: verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rpcUrl = process.env.RPC_URL || 'https://testnet.hsk.xyz'
  const privateKey = process.env.ORACLE_PRIVATE_KEY
  const oracleAddress = process.env.PRICE_ORACLE_ADDRESS

  if (!privateKey || !oracleAddress) {
    return NextResponse.json(
      { error: 'Missing ORACLE_PRIVATE_KEY or PRICE_ORACLE_ADDRESS env vars' },
      { status: 500 }
    )
  }

  try {
    const prices = getCommodityPrices()
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(privateKey, provider)
    const oracle = new ethers.Contract(oracleAddress, PriceOracleABI, signer)

    const symbols: string[] = []
    const values: bigint[] = []

    for (const symbol of SYMBOLS) {
      const price = prices[symbol as keyof typeof prices]
      if (typeof price === 'number') {
        symbols.push(symbol)
        values.push(toOnChainPrice(price))
      }
    }

    const tx = await oracle.updatePrices(symbols, values)
    await tx.wait()

    return NextResponse.json({
      success: true,
      tx: tx.hash,
      prices: Object.fromEntries(SYMBOLS.map((s, i) => [s, values[i].toString()])),
      updatedAt: prices.updatedAt,
    })
  } catch (err: any) {
    console.error('Price update failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
