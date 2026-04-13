import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const hashkeyTestnet = defineChain({
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: {
    name: 'HSK',
    symbol: 'HSK',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hsk.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashKey Explorer',
      url: 'https://testnet-explorer.hsk.xyz',
    },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [hashkeyTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [hashkeyTestnet.id]: http(),
  },
  ssr: true,
})
