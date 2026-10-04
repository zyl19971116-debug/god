"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Link2, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { shortWallet } from "@/lib/format";
import { WalletLogo } from "@/components/layout/WalletLogo";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function WalletModal({ open, onClose }: Props) {
  const { wallets, connect, connecting, error, hasProvider, address } = useWallet();
  const [phase, setPhase] = useState<"pick" | "connecting" | "error">("pick");

  useEffect(() => {
    if (open) setPhase(address ? "connecting" : "pick");
  }, [open, address]);

  useEffect(() => {
    if (error && open) setPhase("error");
  }, [error, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const handleConnect = async (id?: string) => {
    setPhase("connecting");
    const ok = await connect(id);
    if (ok) {
      onClose();
      setPhase("pick");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-void/85 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="panel-gold w-full max-w-md rounded-md p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display-caps text-lg text-ivory">
                {phase === "error" ? "CONNECTION FAILED" : "ENTER THE TEMPLE"}
              </h2>
              <button onClick={onClose} className="text-ivory-faint transition-colors hover:text-ivory" aria-label="Close">
                ✕
              </button>
            </div>

            {phase === "connecting" ? (
              <div className="flex flex-col items-center py-10">
                <Loader2 size={30} className="animate-spin text-gold-400" />
                <p className="mt-5 text-sm text-ivory-dim">Awaiting your signature-free approval…</p>
                {address && (
                  <p className="mt-2 font-mono text-xs text-gold-300">{shortWallet(address, 6)}</p>
                )}
              </div>
            ) : phase === "error" ? (
              <div className="py-4">
                <div className="mb-5 flex items-start gap-3 rounded-sm border border-chaos/40 bg-chaos/[0.07] p-4">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-chaos-glow" />
                  <p className="text-xs leading-relaxed text-ivory-dim">
                    {error ?? "Wallet connection failed."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setPhase("pick")}>
                    TRY AGAIN
                  </Button>
                  <Button variant="text" size="sm" onClick={onClose}>
                    CANCEL
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => void handleConnect(w.id)}
                    className="flex w-full items-center gap-3 rounded-sm border border-line px-4 py-3.5 text-left transition-all hover:border-gold-500/50 hover:bg-gold-500/[0.05]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white/[0.06]">
                      <WalletLogo id={w.id} name={w.name} />
                    </span>
                    <span className="flex-1 text-sm text-ivory">{w.name}</span>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-ivory-faint">
                      {w.installed ? <><Check size={11} /> READY</> : <><Link2 size={11} /> CONNECT</>}
                    </span>
                  </button>
                ))}
                <p className="pt-3 text-[10px] leading-relaxed text-ivory-faint/70">
                  AI GOD never requests your private keys. We only read your public address.
                </p>
              </div>
            )}
            {!hasProvider && phase === "pick" && (
              <p className="mt-4 text-[10px] text-ivory-faint/60">Open your wallet app or browser extension before connecting.</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
