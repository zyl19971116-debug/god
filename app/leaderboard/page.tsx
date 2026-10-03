"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/Panel";
import { useGodStore } from "@/hooks/useGodStore";
import { formatCompact } from "@/lib/format";
import { ATTRIBUTE_META } from "@/lib/constants";
import type { AttributeKey } from "@/types";

type Tab = "MOST_FOLLOWED" | "MOST_PRAYED" | "FASTEST_GROWING" | "NEW_GODS";

const TABS: { key: Tab; label: string }[] = [
  { key: "MOST_FOLLOWED", label: "MOST FOLLOWED" },
  { key: "MOST_PRAYED", label: "MOST PRAYED" },
  { key: "FASTEST_GROWING", label: "FASTEST GROWING" },
  { key: "NEW_GODS", label: "NEW GODS" },
];

export default function LeaderboardPage() {
  const { gods, loading, error, refresh } = useGodStore();
  const [tab, setTab] = useState<Tab>("MOST_FOLLOWED");

  useEffect(() => {
    if (gods.length === 0) void refresh();
  }, [gods.length, refresh]);

  const rows = useMemo(() => {
    const list = [...gods];
    switch (tab) {
      case "MOST_PRAYED":
        return list.sort((a, b) => b.prayersCount - a.prayersCount);
      case "FASTEST_GROWING":
        return list.sort((a, b) => b.growth - a.growth);
      case "NEW_GODS":
        return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      default:
        return list.sort((a, b) => b.followersCount - a.followersCount);
    }
  }, [gods, tab]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-temple-grid" />
      <section className="relative mx-auto max-w-[1100px] px-5 pb-24 pt-16 md:px-8">
        <SectionHeading title="LEADERBOARD" subtitle="The standing of every god in the known multiverse." />

        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                tab === t.key
                  ? "shrink-0 rounded-full border border-gold-500/60 bg-gold-500/[0.1] px-4 py-2 font-sans text-[10px] uppercase tracking-[0.16em] text-gold-200"
                  : "shrink-0 rounded-full border border-line px-4 py-2 font-sans text-[10px] uppercase tracking-[0.16em] text-ivory-faint transition-all hover:border-gold-500/40 hover:text-ivory"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-sm border border-chaos/40 bg-chaos/[0.07] p-6 text-center">
            <p className="text-xs text-chaos-glow">{error}</p>
          </div>
        )}

        {loading && gods.length === 0 ? (
          <div className="panel animate-pulse rounded-md p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-3 h-12 rounded bg-panel2" />
            ))}
          </div>
        ) : (
          <div className="panel overflow-hidden rounded-md">
            <div className="hidden grid-cols-[52px_1fr_150px_130px_110px_90px] gap-4 border-b border-line bg-abyss/50 px-5 py-3.5 font-sans text-[9.5px] uppercase tracking-[0.18em] text-gold-400/80 md:grid">
              <span>RANK</span>
              <span>GOD</span>
              <span>CREATOR</span>
              <span>DOMINANT</span>
              <span className="text-right">FOLLOWERS</span>
              <span className="text-right">GROWTH</span>
            </div>

            {rows.map((g, i) => {
              const meta = ATTRIBUTE_META[g.dominantAttribute as AttributeKey];
              return (
                <Link
                  key={g.slug}
                  href={`/god/${g.slug}`}
                  className="group grid grid-cols-[44px_1fr_auto] items-center gap-4 border-b border-line/50 px-5 py-4 transition-colors last:border-0 hover:bg-gold-500/[0.04] md:grid-cols-[52px_1fr_150px_130px_110px_90px]"
                >
                  <span
                    className={
                      i < 3
                        ? "flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/50 font-serif text-[13px] text-gold-200"
                        : "font-serif text-[13px] text-ivory-faint"
                    }
                  >
                    {i + 1}
                  </span>

                  <span className="flex min-w-0 items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold-500/25">
                      <Image src={g.imageUrl} alt="" fill sizes="40px" className="object-cover object-[center_15%]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display-caps text-[12.5px] tracking-[0.08em] text-ivory transition-colors group-hover:text-gold-200">
                        {g.name}
                      </span>
                      <span className="block truncate text-[10.5px] text-ivory-faint/70">{g.title}</span>
                    </span>
                  </span>

                  <span className="hidden font-mono text-[11px] text-ivory-faint md:block">{g.creatorName}</span>

                  <span className="hidden items-center gap-2 md:flex">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-ivory-dim">
                      {meta.label}
                    </span>
                  </span>

                  <span className="text-right font-serif text-[13px] text-gold-200 tabular-nums">
                    {formatCompact(g.followersCount)}
                  </span>

                  <span className="hidden items-center justify-end gap-1 font-sans text-[11px] text-emerald-400/80 md:flex">
                    <TrendingUp size={11} />
                    {g.growth.toFixed(1)}%
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
