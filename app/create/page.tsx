"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Sparkles, Wallet, Loader2 } from "lucide-react";
import { AttributeAllocator } from "@/components/create/AttributeAllocator";
import { OriginPicker, FormPicker } from "@/components/create/OriginPicker";
import { GenerationRitual } from "@/components/create/GenerationRitual";
import { Button } from "@/components/ui/Button";
import { useGodStore } from "@/hooks/useGodStore";
import { useWallet } from "@/hooks/useWallet";
import { ATTRIBUTE_KEYS, MAX_POINTS } from "@/lib/constants";
import type { Attributes, God, GodForm, Origin } from "@/types";

const EMPTY: Attributes = { order: 0, chaos: 0, greed: 0, love: 0, knowledge: 0 };

export default function CreateGodPage() {
  const router = useRouter();
  const { address } = useWallet();
  const { registerGod, setToast } = useGodStore();
  const [attributes, setAttributes] = useState<Attributes>(EMPTY);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [form, setForm] = useState<GodForm | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allocated = ATTRIBUTE_KEYS.reduce((s, k) => s + attributes[k], 0);
  const valid = allocated > 0 && allocated <= MAX_POINTS;

  const birth = async () => {
    if (!valid) return;
    if (!address) {
      setError("Connect your wallet to birth a God.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/generate-god", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributes,
          origin: origin ?? "THE_UNKNOWN",
          form: form ?? "RANDOM",
          wallet: address,
        }),
      });
      const data = (await res.json()) as { god?: God; error?: string };
      if (!res.ok || !data.god) {
        throw new Error(data.error ?? "The generation ritual failed.");
      }
      registerGod(data.god);
      setGenerating(true);
      // Navigate once the ceremony finishes.
      window.sessionStorage.setItem("aigod.pendingGod", data.god.slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The ritual failed. Try again.");
      setSubmitting(false);
    }
  };

  const finishRitual = () => {
    const slug = window.sessionStorage.getItem("aigod.pendingGod");
    window.sessionStorage.removeItem("aigod.pendingGod");
    setToast("A new god enters the multiverse.");
    router.push(slug ? `/god/${slug}` : "/explore");
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-temple-grid" />

      <section className="relative mx-auto max-w-[1000px] px-5 pb-24 pt-16 md:px-8">
        <div className="text-center">
          <p className="font-display-caps text-[10px] tracking-divine text-gold-400">THE GENERATION RITE</p>
          <h1 className="mt-4 font-display-caps text-[clamp(2rem,5vw,3.2rem)] leading-tight text-ivory">
            CREATE <span className="gold-text">YOUR GOD</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ivory-faint">
            Every God begins with five choices. What you choose determines its name, its beliefs,
            its commandments and its face.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          <AttributeAllocator value={attributes} onChange={setAttributes} />
          <OriginPicker value={origin} onChange={setOrigin} />
          <FormPicker value={form} onChange={setForm} />
        </div>

        {error && (
          <div className="mt-6 rounded-sm border border-chaos/40 bg-chaos/[0.07] p-4">
            <p className="text-xs text-chaos-glow">{error}</p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-5">
          <Button size="lg" onClick={birth} disabled={!valid || submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> PERFORMING THE RITE
              </>
            ) : (
              <>
                <Sparkles size={15} /> BIRTH MY GOD
              </>
            )}
          </Button>

          {!address && (
            <Link
              href="/temple"
              className="inline-flex items-center gap-2 font-sans text-[10.5px] uppercase tracking-[0.16em] text-gold-400/80 transition-colors hover:text-gold-200"
            >
              <Wallet size={12} /> CONNECT YOUR WALLET IN THE TEMPLE FIRST
            </Link>
          )}

          <p className="max-w-sm text-center text-[10.5px] leading-relaxed text-ivory-faint/70">
            Your God is generated from your attribute profile. The same 20 points spent differently
            produce a completely different deity.
          </p>
        </div>
      </section>

      <AnimatePresence>
        {generating && <GenerationRitual onComplete={finishRitual} />}
      </AnimatePresence>
    </div>
  );
}
