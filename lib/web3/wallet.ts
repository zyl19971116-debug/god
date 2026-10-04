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

interface Eip6963ProviderInfo {
  name: string;
  rdns: string;
}

interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
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

function walletIdentity(provider: Eip1193Provider, info?: Eip6963ProviderInfo): Pick<DetectedWallet, "id" | "name"> {
  const identity = `${info?.rdns ?? ""} ${info?.name ?? ""}`.toLowerCase();
  if (provider.isRabby || identity.includes("rabby")) return { id: "rabby", name: "Rabby Wallet" };
  if (provider.isCoinbaseWallet || identity.includes("coinbase")) return { id: "coinbase", name: "Coinbase Wallet" };
  if (provider.isTrust || provider.isTrustWallet || identity.includes("trust")) return { id: "trust", name: "Trust Wallet" };
  if (provider.isOkxWallet || identity.includes("okx")) return { id: "okx", name: "OKX Wallet" };
  if (provider.isPhantom || identity.includes("phantom")) return { id: "phantom", name: "Phantom" };
  if (provider.isBraveWallet || identity.includes("brave")) return { id: "brave", name: "Brave Wallet" };
  if (provider.isMetaMask || identity.includes("metamask")) return { id: "metamask", name: "MetaMask" };
  return { id: info?.rdns || "injected", name: info?.name || "Browser Wallet" };
}

function mapProviders(providers: Array<{ provider: Eip1193Provider; info?: Eip6963ProviderInfo }>): DetectedWallet[] {
  const out: DetectedWallet[] = [];
  for (const entry of providers) {
    const identity = walletIdentity(entry.provider, entry.info);
    out.push({ ...identity, provider: entry.provider });
  }
  return out.filter((wallet, index) => out.findIndex((item) => item.id === wallet.id) === index);
}

export function detectWallets(): DetectedWallet[] {
  return mapProviders(getInjectedProviders().map((provider) => ({ provider })));
}

/** Discover modern EIP-6963 wallets as well as legacy window.ethereum providers. */
export async function discoverWallets(timeoutMs = 250): Promise<DetectedWallet[]> {
  if (typeof window === "undefined") return [];
  const announced: Eip6963ProviderDetail[] = [];
  const onAnnounce = (event: Event) => {
    const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
    if (detail?.provider && detail?.info) announced.push(detail);
  };

  window.addEventListener("eip6963:announceProvider", onAnnounce as EventListener);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((resolve) => window.setTimeout(resolve, timeoutMs));
  window.removeEventListener("eip6963:announceProvider", onAnnounce as EventListener);

  const legacy = getInjectedProviders().map((provider) => ({ provider }));
  const combined = [
    ...announced.map(({ provider, info }) => ({ provider, info })),
    ...legacy.filter(({ provider }) => !announced.some((item) => item.provider === provider)),
  ];
  return mapProviders(combined);
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
