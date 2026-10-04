"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WalletState } from "@/types";
import { detectWallets, POPULAR_WALLETS, walletErrorMessage, type Eip1193Provider } from "@/lib/web3/wallet";
import { chainById } from "@/lib/web3/chains";

interface WalletContextValue extends WalletState {
  wallets: { id: string; name: string; installUrl: string; installed: boolean }[];
  connect: (id?: string) => Promise<boolean>;
  disconnect: () => void;
  chainName: string | null;
  hasProvider: boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);
const STORAGE_KEY = "aigod.wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    connecting: false,
    error: null,
  });
  const [provider, setProvider] = useState<Eip1193Provider | null>(null);
  const [available, setAvailable] = useState<WalletContextValue["wallets"]>(
    POPULAR_WALLETS.map((wallet) => ({ ...wallet, installed: false }))
  );
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    const detected = detectWallets();
    setAvailable(
      POPULAR_WALLETS.map((wallet) => ({
        ...wallet,
        installed: detected.some((detectedWallet) => detectedWallet.id === wallet.id),
      })).concat(
        detected
          .filter((wallet) => !POPULAR_WALLETS.some((popular) => popular.id === wallet.id))
          .map((wallet) => ({ ...wallet, installUrl: "", installed: true }))
      )
    );
    setHasProvider(detected.length > 0);
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!saved || detected.length === 0) return;
    const found = detected.find((d) => d.id === saved) ?? detected[0];
    void trySilentReconnect(found.provider, found.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trySilentReconnect = async (p: Eip1193Provider, id: string) => {
    try {
      const accounts = (await p.request({ method: "eth_accounts" })) as string[];
      if (!accounts?.length) return;
      const chainId = (await p.request({ method: "eth_chainId" })) as string;
      setProvider(p);
      setState({ address: accounts[0], chainId: parseInt(chainId, 16), connecting: false, error: null });
      attach(p);
      void id;
    } catch {
      /* silent */
    }
  };

  const attach = useCallback((p: Eip1193Provider) => {
    p.on?.("accountsChanged", (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts?.length) {
        setState({ address: null, chainId: null, connecting: false, error: null });
      } else {
        setState((s) => ({ ...s, address: accounts[0] }));
      }
    });
    p.on?.("chainChanged", (...args: unknown[]) => {
      setState((s) => ({ ...s, chainId: parseInt(args[0] as string, 16) }));
    });
  }, []);

  const connect = useCallback(
    async (id?: string): Promise<boolean> => {
      setState((s) => ({ ...s, connecting: true, error: null }));
      const detected = detectWallets();
      if (detected.length === 0) {
        setState({
          address: null,
          chainId: null,
          connecting: false,
          error: "This wallet is not available in your browser. Install its extension, then refresh this page.",
        });
        return false;
      }
      const target = id ? detected.find((d) => d.id === id) : detected[0];
      if (!target) {
        setState({
          address: null,
          chainId: null,
          connecting: false,
          error: "The selected wallet was not detected. Open its app or browser extension, then try again.",
        });
        return false;
      }
      try {
        const accounts = (await target.provider.request({ method: "eth_requestAccounts" })) as string[];
        if (!accounts?.length) throw new Error("no accounts");
        const chainIdHex = (await target.provider.request({ method: "eth_chainId" })) as string;
        setProvider(target.provider);
        attach(target.provider);
        window.localStorage.setItem(STORAGE_KEY, target.id);
        setState({
          address: accounts[0],
          chainId: parseInt(chainIdHex, 16),
          connecting: false,
          error: null,
        });
        return true;
      } catch (e) {
        const code = (e as { code?: string | number })?.code;
        setState({
          address: null,
          chainId: null,
          connecting: false,
          error: walletErrorMessage(code, "Wallet connection failed. Please try again."),
        });
        return false;
      }
    },
    [attach]
  );

  const disconnect = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    setProvider(null);
    setState({ address: null, chainId: null, connecting: false, error: null });
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      wallets: available,
      connect,
      disconnect,
      hasProvider,
      chainName: chainById(state.chainId)?.shortName ?? null,
    }),
    [state, available, connect, disconnect, hasProvider]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
