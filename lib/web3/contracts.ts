import type { Address } from "viem";
import { getAddress } from "viem";

/**
 * Contract registry.
 *
 * Intentionally EMPTY in V1. No token contract is hardcoded and none is
 * deployed. God creation and all social state live in the application database.
 * When an on-chain god registry ships, register its ABI and address here and
 * the frontend can start reading from it without UI changes.
 */

export interface ContractEntry {
  address: Address | null;
  abi: unknown[];
  chainIds: number[];
  description: string;
}

export const CONTRACTS: Record<string, ContractEntry> = {
  godRegistry: {
    address: null,
    abi: [],
    chainIds: [1, 8453, 137],
    description:
      "Future on-chain registry mapping god ids to creator wallets. Not deployed in V1.",
  },
};

export function getContract(
  name: keyof typeof CONTRACTS,
  chainId: number
): { address: Address; abi: unknown[] } | null {
  const entry = CONTRACTS[name];
  if (!entry?.address || !entry.chainIds.includes(chainId)) return null;
  return { address: entry.address, abi: entry.abi };
}

export function checksumAddress(value: string): string | null {
  try {
    return getAddress(value);
  } catch {
    return null;
  }
}
