'use client'

import { useMemo } from 'react'
import { useWalletClient } from 'wagmi'
import { ethers } from 'ethers'

/**
 * Bridge wagmi's WalletClient to an ethers.js Signer.
 * This lets us use wagmi for connection management
 * while keeping existing ethers contract interaction code.
 */
export function useEthersSigner() {
  const { data: walletClient } = useWalletClient()

  const signer = useMemo(() => {
    if (!walletClient) return null
    const { account, chain, transport } = walletClient
    if (!chain || !account) return null

    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: undefined,
    }

    const provider = new ethers.BrowserProvider(transport, network)
    return new ethers.JsonRpcSigner(provider, account.address)
  }, [walletClient])

  return signer
}
