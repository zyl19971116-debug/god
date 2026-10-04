"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { GodCard } from "@/components/god/GodCard";
import { SectionHeading } from "@/components/ui/Panel";
import { ORIGINS } from "@/lib/constants";
import type { AttributeKey, ExploreSort, God, Origin } from "@/types";
import { useGodStore } from "@/hooks/useGodStore";

const SORTS: { key: ExploreSort; label: string }[] = [
  { key: "trending", label: "TRENDING" },
  { key: "new", label: "NEW" },
  { key: "most_followed", label: "MOST FOLLOWED" },
  { key: "most_prayed", label: "MOST PRAYED" },
  { key: "order", label: "ORDER" },
  { key: "chaos", label: "CHAOS" },
  { key: "greed", label: "GREED" },
  { key: "love", label: "LOVE" },
  { key: "knowledge", label: "KNOWLEDGE" },
];

const PAGE = 12;

export default function ExplorePage() {
  const params = useSearchParams();
  const { gods: walletGods } = useGodStore();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<ExploreSort>("trending");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [gods, setGods] = useState<God[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(
    async (reset: boolean, nextOffset: number, q: string, s: ExploreSort, o: Origin | null) => {
      setLoading(true);
      setError(null);
      try {
        const p = new URLSearchParams();
        if (q) p.set("q", q);
        p.set("sort", s);
        p.set("limit", String(PAGE));
        p.set("offset", String(nextOffset));
        if (o) p.set("origin", o);
        const res = await fetch(`/api/gods?${p.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("The archives are unreachable.");
        const data = (await res.json()) as { gods: God[] };
        const visible = [
          ...data.gods,
          ...walletGods.filter((god) => !data.gods.some((remote) => remote.slug === god.slug)),
        ].filter((god) => {
          const search = q.toLowerCase().trim();
          const matchesSearch = !search || [god.name, god.title, god.domain, god.shortDescription]
            .some((value) => value.toLowerCase().includes(search));
          return matchesSearch && (!o || god.origin === o);
        });
        visible.sort((a, b) => {
          if (s === "new") return a.createdAt < b.createdAt ? 1 : -1;
          if (s === "most_followed") return b.followersCount - a.followersCount;
          if (s === "most_prayed") return b.prayersCount - a.prayersCount;
          if (["order", "chaos", "greed", "love", "knowledge"].includes(s)) {
            const key = s as AttributeKey;
            return b.attributes[key] - a.attributes[key];
          }
          return b.growth - a.growth;
        });
        setGods((prev) => (reset ? visible : [...prev, ...visible.filter((god) => !prev.some((item) => item.slug === god.slug))]));
        setExhausted(data.gods.length < PAGE);
        setOffset(nextOffset);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [walletGods]
  );

  useEffect(() => {
    const t = setTimeout(() => void load(true, 0, query, sort, origin), 260);
    return () => clearTimeout(t);
  }, [query, sort, origin, load]);

  const attributeFilter = SORTS.find((s) => s.key === sort)?.key;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-temple-grid" />
      <section className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-16 md:px-8">
        <SectionHeading title="EXPLORE GODS" subtitle="Search the pantheon. Filter by belief, origin or dominant attribute." />

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gods by name, title or domain..."
              className="input-dark w-full rounded-sm py-3.5 pl-11 pr-4 text-sm"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="btn-ghost inline-flex items-center gap-2 self-start rounded-sm px-4 py-3 text-[10px] uppercase tracking-[0.16em] md:self-auto"
          >
            <SlidersHorizontal size={13} /> ORIGIN FILTER
          </button>
        </div>

        {filtersOpen && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setOrigin(null)}
              className={
                origin === null
                  ? "rounded-sm border border-gold-500/60 bg-gold-500/[0.1] px-3.5 py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-gold-200"
                  : "rounded-sm border border-line px-3.5 py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-ivory-faint transition-colors hover:text-ivory"
              }
            >
              ALL ORIGINS
            </button>
            {ORIGINS.map((o) => (
              <button
                key={o.key}
                onClick={() => setOrigin(o.key === origin ? null : o.key)}
                className={
                  origin === o.key
                    ? "rounded-sm border border-gold-500/60 bg-gold-500/[0.1] px-3.5 py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-gold-200"
                    : "rounded-sm border border-line px-3.5 py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-ivory-faint transition-colors hover:text-ivory"
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto pb-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={
                sort === s.key
                  ? "shrink-0 rounded-full border border-gold-500/60 bg-gold-500/[0.1] px-4 py-2 font-sans text-[10px] uppercase tracking-[0.16em] text-gold-200"
                  : "shrink-0 rounded-full border border-line px-4 py-2 font-sans text-[10px] uppercase tracking-[0.16em] text-ivory-faint transition-all hover:border-gold-500/40 hover:text-ivory"
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-sm border border-chaos/40 bg-chaos/[0.07] p-6 text-center">
            <p className="text-xs text-chaos-glow">{error}</p>
            <button
              onClick={() => void load(true, 0, query, sort, origin)}
              className="btn-ghost mt-4 rounded-sm px-5 py-2.5 text-[10px] uppercase tracking-[0.16em]"
            >
              RETRY
            </button>
          </div>
        )}

        {!error && gods.length === 0 && !loading && (
          <div className="panel rounded-md py-20 text-center">
            <p className="font-display-caps text-lg text-ivory">NO GODS FOUND</p>
            <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-ivory-faint">
              This search returned an empty pantheon. Try a different name, or clear your filters.
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gods.map((g, i) => (
            <GodCard key={g.slug} god={g} index={i} />
          ))}
        </div>

        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="panel h-[420px] animate-pulse rounded-md" />
            ))}
          </div>
        )}

        {!loading && !exhausted && gods.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => void load(false, offset + PAGE, query, sort, origin)}
              className="btn-ghost rounded-sm px-8 py-3.5 text-[11px] uppercase tracking-[0.18em]"
            >
              LOAD MORE GODS
            </button>
          </div>
        )}

        {attributeFilter && gods.length > 0 && (
          <p className="mt-10 text-center text-[10px] uppercase tracking-[0.2em] text-ivory-faint/50">
            SORTED BY {attributeFilter.replace(/_/g, " ").toUpperCase()}
          </p>
        )}
      </section>
    </div>
  );
}
