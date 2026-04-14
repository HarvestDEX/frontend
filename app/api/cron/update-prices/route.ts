import { NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getCommodityPrices, toOnChainPrice } from '@/app/lib/prices'
import PriceOracleABI from '@/app/lib/abi/PriceOracle.json'
import { insertPrices, initDb } from '@/app/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SYMBOLS = ['RICE', 'COFFEE', 'CORN', 'CPO']

const hashkeyTestnet = {
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.hsk.xyz'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://testnet-explorer.hsk.xyz' } },
} as const

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    const rpcUrl = process.env.RPC_URL || 'https://testnet.hsk.xyz'
    const transport = http(rpcUrl)

    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const walletClient = createWalletClient({
      account,
      chain: hashkeyTestnet as any,
      transport,
    })
    const publicClient = createPublicClient({
      chain: hashkeyTestnet as any,
      transport,
    })

    const symbols: string[] = []
    const values: bigint[] = []

    for (const symbol of SYMBOLS) {
      const price = prices[symbol as keyof typeof prices]
      if (typeof price === 'number') {
        symbols.push(symbol)
        values.push(toOnChainPrice(price))
      }
    }

    const txHash = await walletClient.writeContract({
      address: oracleAddress as `0x${string}`,
      abi: PriceOracleABI,
      functionName: 'updatePrices',
      args: [symbols, values],
      chain: hashkeyTestnet as any,
    })

    await publicClient.waitForTransactionReceipt({ hash: txHash })

    // Store in Neon DB (non-blocking)
    if (process.env.DATABASE_URL) {
      try {
        await initDb()
        const dbPrices: Record<string, number> = {}
        for (const symbol of SYMBOLS) {
          const price = prices[symbol as keyof typeof prices]
          if (typeof price === 'number') dbPrices[symbol] = price
        }
        await insertPrices(dbPrices)
      } catch (dbErr) {
        console.error('DB insert failed (non-fatal):', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      tx: txHash,
      prices: Object.fromEntries(SYMBOLS.map((s, i) => [s, values[i].toString()])),
      updatedAt: prices.updatedAt,
    })
  } catch (err: any) {
    console.error('Price update failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
