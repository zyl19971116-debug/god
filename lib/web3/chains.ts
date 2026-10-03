import type { Chain } from "./types";

/**
 * Supported chains. V1 is read-mostly: no token contract, no minting.
 * Chain data is declared here so future on-chain god registry contracts can be
 * attached per chain without touching UI code.
 */

export const CHAINS: Record<number, Chain> = {
  1: {
    id: 1,
    name: "Ethereum",
    shortName: "Ethereum",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: ["https://eth.llamarpc.com"] },
    explorers: [{ name: "Etherscan", url: "https://etherscan.io" }],
  },
  8453: {
    id: 8453,
    name: "Base",
    shortName: "Base",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: ["https://mainnet.base.org"] },
    explorers: [{ name: "Basescan", url: "https://basescan.org" }],
  },
  137: {
    id: 137,
    name: "Polygon",
    shortName: "Polygon",
    currency: { name: "POL", symbol: "POL", decimals: 18 },
    rpcUrls: { default: ["https://polygon-rpc.com"] },
    explorers: [{ name: "Polygonscan", url: "https://polygonscan.com" }],
  },
};

export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? 1);

export function chainById(id: number | null): Chain | null {
  if (id == null) return null;
  return CHAINS[id] ?? null;
}
