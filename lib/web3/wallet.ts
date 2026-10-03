import type { AttributeKey } from "@/types";

/**
 * Minimal EIP-1193 provider surface.
 *
 * V1 uses a clean custom wallet modal that talks directly to injected
 * providers (MetaMask, Rabby, Coinbase Wallet, Brave…). The shapes here match
 * wagmi's expectations, so layering wagmi + RainbowKit on top later is an
 * additive change rather than a rewrite.
 */

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isRabby?: boolean;
  isCoinbaseWallet?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isOkxWallet?: boolean;
  isPhantom?: boolean;
  isBraveWallet?: boolean;
  providers?: Eip1193Provider[];
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getInjectedProviders(): Eip1193Provider[] {
  if (typeof window === "undefined") return [];
  const eth = window.ethereum;
  if (!eth) return [];
  if (eth.providers?.length) return eth.providers;
  return [eth];
}

export interface DetectedWallet {
  id: string;
  name: string;
  provider: Eip1193Provider;
}

export interface WalletOption {
  id: string;
  name: string;
  installUrl: string;
}

export const POPULAR_WALLETS: WalletOption[] = [
  { id: "metamask", name: "MetaMask", installUrl: "https://metamask.io/download/" },
  { id: "rabby", name: "Rabby Wallet", installUrl: "https://rabby.io/" },
  { id: "coinbase", name: "Coinbase Wallet", installUrl: "https://www.coinbase.com/wallet/downloads" },
  { id: "trust", name: "Trust Wallet", installUrl: "https://trustwallet.com/browser-extension" },
  { id: "okx", name: "OKX Wallet", installUrl: "https://www.okx.com/web3" },
  { id: "phantom", name: "Phantom", installUrl: "https://phantom.com/download" },
  { id: "brave", name: "Brave Wallet", installUrl: "https://brave.com/wallet/" },
];

export function detectWallets(): DetectedWallet[] {
  const providers = getInjectedProviders();
  const out: DetectedWallet[] = [];
  for (const p of providers) {
    if (p.isRabby) out.push({ id: "rabby", name: "Rabby Wallet", provider: p });
    else if (p.isCoinbaseWallet) out.push({ id: "coinbase", name: "Coinbase Wallet", provider: p });
    else if (p.isTrust || p.isTrustWallet) out.push({ id: "trust", name: "Trust Wallet", provider: p });
    else if (p.isOkxWallet) out.push({ id: "okx", name: "OKX Wallet", provider: p });
    else if (p.isPhantom) out.push({ id: "phantom", name: "Phantom", provider: p });
    else if (p.isBraveWallet) out.push({ id: "brave", name: "Brave Wallet", provider: p });
    else if (p.isMetaMask) out.push({ id: "metamask", name: "MetaMask", provider: p });
    else out.push({ id: "injected", name: "Browser Wallet", provider: p });
  }
  return out.filter((wallet, index) => out.findIndex((item) => item.id === wallet.id) === index);
}

export const WALLET_ERRORS: Record<string, string> = {
  "4001": "Request rejected in your wallet.",
  "-32002": "A wallet request is already pending. Open your wallet to continue.",
  UNSUPPORTED: "This wallet is not supported.",
};

export function walletErrorMessage(code: unknown, fallback: string): string {
  if (typeof code === "number" || typeof code === "string") {
    return WALLET_ERRORS[String(code)] ?? fallback;
  }
  return fallback;
}
