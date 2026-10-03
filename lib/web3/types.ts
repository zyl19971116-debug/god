export interface ChainCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface Chain {
  id: number;
  name: string;
  shortName: string;
  currency: ChainCurrency;
  rpcUrls: { default: string[] };
  explorers: { name: string; url: string }[];
}

export interface WalletSnapshot {
  address: string | null;
  chainId: number | null;
  providerId: string | null;
}
