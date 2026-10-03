"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Globe, Loader2 } from "lucide-react";
import type { God, Prayer } from "@/types";
import { Button } from "@/components/ui/Button";
import { useGodStore } from "@/hooks/useGodStore";
import { timeAgo } from "@/lib/format";

export function PrayerPanel({ god }: { god: God }) {
  const { sendPrayer, setToast } = useGodStore();
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Prayer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const clean = text.trim();
    if (!clean) return;
    setSending(true);
    setError(null);
    const res = await sendPrayer(god.slug, clean, isPublic);
    setSending(false);
    if (!res.ok) {
      setError(res.error ?? "The God did not answer.");
      return;
    }
    setResult(res.prayer ?? null);
    setText("");
    setToast("Your prayer has been heard.");
  };

  return (
    <div className="panel-gold manuscript rounded-md p-6 md:p-8">
      <h3 className="font-display-caps text-lg text-ivory">
        PRAY TO {god.name.toUpperCase()}
      </h3>
      <p className="mt-1 text-xs text-ivory-faint">{god.greeting}</p>
      <div className="hairline my-6" />

      <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-gold-400">
        YOUR PRAYER
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={600}
        rows={4}
        placeholder="Ask your God something..."
        className="input-dark w-full resize-none rounded-sm p-4 font-sans text-sm leading-relaxed"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Toggle
            active={isPublic}
            onClick={() => setIsPublic(true)}
            icon={<Globe size={12} />}
            label="PUBLIC PRAYER"
          />
          <Toggle
            active={!isPublic}
            onClick={() => setIsPublic(false)}
            icon={<Lock size={12} />}
            label="PRIVATE PRAYER"
          />
        </div>
        <Button onClick={submit} disabled={sending || !text.trim()} size="sm">
          {sending ? (
            <>
              <Loader2 size={13} className="animate-spin" /> CONSULTING
            </>
          ) : (
            <>
              <Sparkles size={13} /> SEND PRAYER
            </>
          )}
        </Button>
      </div>

      {isPublic && (
        <p className="mt-3 text-[10px] text-ivory-faint/70">
          Public prayers appear in this temple and in the global prayer feed.
        </p>
      )}
      {!isPublic && (
        <p className="mt-3 text-[10px] text-ivory-faint/70">
          Private prayers are visible only to you. They are never published.
        </p>
      )}

      {error && <p className="mt-4 text-xs text-chaos-glow">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-7 grid gap-4 border-t border-line/70 pt-6">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-ivory-faint">YOUR PRAYER</p>
                <p className="font-sans text-sm italic leading-relaxed text-ivory-dim">&ldquo;{result.text}&rdquo;</p>
              </div>
              <div className="relative rounded-sm border border-gold-500/25 bg-void/50 p-5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-gold-400">DIVINE RESPONSE</p>
                <p className="font-display text-[15px] leading-relaxed text-ivory">{result.response}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-ivory-faint/60">
                  {god.name} · {timeAgo(result.createdAt)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "btn-ghost rounded-sm px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
          : "rounded-sm border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ivory-faint transition-all hover:text-ivory-dim"
      }
    >
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
}
