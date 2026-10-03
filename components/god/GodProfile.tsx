"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Share2, Sparkles, Landmark, Calendar } from "lucide-react";
import { GodPortrait } from "@/components/god/GodPortrait";
import { AttributeBars } from "@/components/ui/AttributeBar";
import { FollowButton } from "@/components/god/FollowButton";
import { PrayerPanel } from "@/components/god/PrayerPanel";
import { ProphecyCard } from "@/components/god/ProphecyCard";
import { CommandmentTablet } from "@/components/god/CommandmentTablet";
import { Button } from "@/components/ui/Button";
import { useGodStore } from "@/hooks/useGodStore";
import { formatDate, formatCompact, shortWallet } from "@/lib/format";
import { ATTRIBUTE_META, ORIGINS } from "@/lib/constants";
import type { AttributeKey, God, Prayer, Prophecy } from "@/types";

type Tab = "OVERVIEW" | "BELIEFS" | "COMMANDMENTS" | "PROPHECIES" | "PRAYERS" | "HISTORY";

const TABS: Tab[] = ["OVERVIEW", "BELIEFS", "COMMANDMENTS", "PROPHECIES", "PRAYERS", "HISTORY"];

interface Props {
  god: God;
  prophecies: Prophecy[];
  publicPrayers: Prayer[];
  related: God[];
}

export function GodProfile({ god, prophecies, publicPrayers, related }: Props) {
  const [tab, setTab] = useState<Tab>("OVERVIEW");
  const { setToast } = useGodStore();
  const meta = ATTRIBUTE_META[god.dominantAttribute as AttributeKey];
  const originLabel = ORIGINS.find((o) => o.key === god.origin)?.label ?? god.origin;

  const share = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: `${god.name} — ${god.title}`, text: god.shortDescription, url });
      } else {
        await navigator.clipboard.writeText(`${god.name} — ${god.title}\n${url}`);
        setToast("Temple link copied.");
      }
    } catch {
      setToast("Sharing was cancelled.");
    }
  };

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative grain overflow-hidden">
        <div className="absolute inset-0">
          <GodPortrait god={god} priority sizes="100vw" className="absolute inset-0 opacity-[0.55]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/55 to-void/85" />

        <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-12 md:px-8 md:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-end">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full border px-3 py-1 font-sans text-[9.5px] uppercase tracking-[0.16em]"
                    style={{ borderColor: `${meta.color}55`, color: meta.color }}
                  >
                    LVL {god.divineLevel.level} · {god.divineLevel.title}
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 font-sans text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint">
                    {originLabel}
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 font-sans text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint">
                    {god.form.replace("_", "-")}
                  </span>
                </div>

                <h1 className="font-display-caps text-[clamp(2.4rem,6vw,4rem)] leading-none text-ivory drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                  {god.name}
                </h1>
                <p className="mt-3 font-display text-[15px] uppercase tracking-[0.2em] text-gold-300">
                  {god.title}
                </p>
                <p className="mt-5 max-w-xl font-display text-[15.5px] italic leading-relaxed text-ivory-dim">
                  {god.shortDescription}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <FollowButton slug={god.slug} />
                <Link
                  href="#pray"
                  className="btn-ghost inline-flex items-center gap-2 rounded-sm px-5 py-2 text-[10px] uppercase tracking-[0.16em]"
                >
                  <Sparkles size={12} /> PRAY
                </Link>
                <Button variant="ghost" size="sm" onClick={share}>
                  <Share2 size={12} /> SHARE
                </Button>
              </motion.div>
            </div>

            {/* attributes panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="panel-gold rounded-md p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display-caps text-[11px] tracking-[0.2em] text-gold-300">
                  DIVINE ATTRIBUTES
                </h2>
                <span className="font-sans text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint/70">
                  {meta.label} DOMINANT
                </span>
              </div>
              <AttributeBars attributes={god.attributes} />
              <div className="hairline my-5" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat value={formatCompact(god.followersCount)} label="FOLLOWERS" />
                <Stat value={formatCompact(god.prayersCount)} label="PRAYERS" />
                <Stat value={String(god.propheciesCount)} label="PROPHECIES" />
              </div>
              <p className="mt-5 text-center font-sans text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint/60">
                CREATED {formatDate(god.createdAt)} BY{" "}
                <span className="font-mono normal-case tracking-normal text-gold-300/80">
                  {shortWallet(god.creatorWallet, 4)}
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-[72px] z-30 border-y border-line/70 bg-void/90 backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 md:px-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                tab === t
                  ? "relative shrink-0 px-4 py-4 font-sans text-[10.5px] uppercase tracking-[0.18em] text-gold-200"
                  : "shrink-0 px-4 py-4 font-sans text-[10.5px] uppercase tracking-[0.18em] text-ivory-faint transition-colors hover:text-ivory"
              }
            >
              {t}
              {tab === t && (
                <motion.span
                  layoutId="god-tab"
                  className="absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
        {tab === "OVERVIEW" && <Overview god={god} related={related} />}
        {tab === "BELIEFS" && <Beliefs god={god} />}
        {tab === "COMMANDMENTS" && (
          <div>
            <Heading title="THE COMMANDMENTS" subtitle={`${god.name} spoke these words at the moment of awakening.`} />
            <CommandmentTablet commandments={god.commandments} godName={god.name} />
          </div>
        )}
        {tab === "PROPHECIES" && (
          <div>
            <Heading title="PROPHECIES" subtitle="Numbered, dated and categorised. Fictional in-universe content." />
            <div className="grid gap-5 lg:grid-cols-2">
              {prophecies.map((p, i) => (
                <ProphecyCard key={p.id} prophecy={p} index={i} />
              ))}
            </div>
            {prophecies.length === 0 && <EmptyNote text="No prophecy has been published yet." />}
          </div>
        )}
        {tab === "PRAYERS" && (
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]" id="pray">
            <PrayerPanel god={god} />
            <div>
              <Heading title="PUBLIC PRAYERS" subtitle="What mortals have asked, and how they were answered." />
              <div className="space-y-4">
                {publicPrayers.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="panel rounded-md p-5"
                  >
                    <p className="text-[12px] italic leading-relaxed text-ivory-dim">&ldquo;{p.text}&rdquo;</p>
                    <p className="mt-3 border-t border-line/60 pt-3 font-display text-[13px] leading-relaxed text-ivory">
                      {p.response}
                    </p>
                  </motion.div>
                ))}
                {publicPrayers.length === 0 && (
                  <EmptyNote text="No public prayers yet. Be the first to speak." />
                )}
              </div>
            </div>
          </div>
        )}
        {tab === "HISTORY" && <History god={god} />}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-lg text-gold-200 tabular-nums">{value}</p>
      <p className="mt-1 font-sans text-[8.5px] uppercase tracking-[0.16em] text-ivory-faint/60">{label}</p>
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display-caps text-xl text-ivory">{title}</h2>
      <p className="mt-2 text-xs text-ivory-faint">{subtitle}</p>
      <div className="hairline mt-5 max-w-[160px]" />
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="panel rounded-md py-14 text-center">
      <p className="text-xs text-ivory-faint">{text}</p>
    </div>
  );
}

function Overview({ god, related }: { god: God; related: God[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-8">
        <Block title="ABOUT" body={god.shortDescription} />
        <Block title="PERSONALITY" body={god.personality} />
        <Block title="PHILOSOPHY" body={god.philosophy} />
        <Block title="CREATION MYTH" body={god.creationMyth} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Fact title="DOMAIN" value={god.domain} />
          <Fact title="ORIGIN" value={ORIGINS.find((o) => o.key === god.origin)?.label ?? god.origin} />
          <Fact title="SYMBOL" value={god.symbol || "—"} />
          <Fact title="ARCHETYPE" value={god.archetype} />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="panel relative overflow-hidden rounded-md">
          <div className="relative aspect-[4/5]">
            <Image
              src={god.imageUrl}
              alt={god.name}
              fill
              sizes="33vw"
              className="object-cover object-[center_18%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 font-display text-[11px] italic text-gold-200/90">
              &ldquo;{god.greeting}&rdquo;
            </p>
          </div>
        </div>

        {god.relationships.length > 0 && (
          <div className="panel rounded-md p-5">
            <h3 className="font-display-caps text-[10.5px] tracking-[0.18em] text-gold-300">RELATIONSHIPS</h3>
            <ul className="mt-4 space-y-2.5">
              {god.relationships.map((r) => (
                <li key={r.otherGodId} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/god/${r.otherGodId}`}
                    className="font-display-caps text-[11.5px] tracking-[0.08em] text-ivory transition-colors hover:text-gold-200"
                  >
                    {r.otherGodName}
                  </Link>
                  <span
                    className={
                      r.kind === "ALLY"
                        ? "rounded-full border border-emerald-500/40 px-2.5 py-0.5 text-[8.5px] uppercase tracking-[0.14em] text-emerald-400/80"
                        : r.kind === "OPPOSED"
                          ? "rounded-full border border-chaos/50 px-2.5 py-0.5 text-[8.5px] uppercase tracking-[0.14em] text-chaos-glow"
                          : "rounded-full border border-gold-500/40 px-2.5 py-0.5 text-[8.5px] uppercase tracking-[0.14em] text-gold-300/80"
                    }
                  >
                    {r.kind}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {related.length > 0 && (
          <div className="panel rounded-md p-5">
            <h3 className="font-display-caps text-[10.5px] tracking-[0.18em] text-gold-300">CONNECTED TEMPLES</h3>
            <div className="mt-4 space-y-3">
              {related.slice(0, 4).map((g) => (
                <Link key={g.slug} href={`/god/${g.slug}`} className="group flex items-center gap-3">
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gold-500/25">
                    <Image src={g.imageUrl} alt="" fill sizes="36px" className="object-cover object-[center_15%]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display-caps text-[11px] text-ivory group-hover:text-gold-200">
                      {g.name}
                    </span>
                    <span className="block truncate text-[9.5px] text-ivory-faint/70">{g.domain}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="mb-3 font-display-caps text-[11px] tracking-[0.2em] text-gold-400">{title}</h3>
      <p className="font-display text-[15px] leading-relaxed text-ivory-dim">{body}</p>
    </div>
  );
}

function Fact({ title, value }: { title: string; value: string }) {
  return (
    <div className="panel rounded-sm p-4">
      <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-ivory-faint/70">{title}</p>
      <p className="mt-2 font-display text-[12.5px] leading-snug text-ivory">{value}</p>
    </div>
  );
}

function Beliefs({ god }: { god: God }) {
  const b = god.beliefSystem;
  const rows: [string, string][] = [
    ["Core Belief", b.coreBelief],
    ["Purpose", b.purpose],
    ["View of Humanity", b.viewOfHumanity],
    ["View of Wealth", b.viewOfWealth],
    ["View of Conflict", b.viewOfConflict],
    ["View of Knowledge", b.viewOfKnowledge],
    ["View of Death", b.viewOfDeath],
  ];
  return (
    <div className="max-w-3xl">
      <div className="panel-gold manuscript relative rounded-md p-8 md:p-12">
        <div className="mb-8 text-center">
          <Landmark size={22} className="mx-auto text-gold-500/70" strokeWidth={1.2} />
          <h2 className="mt-4 font-display-caps text-xl tracking-[0.14em] text-ivory">
            THE BELIEF OF {god.name.toUpperCase()}
          </h2>
          <div className="hairline mx-auto mt-5 max-w-[140px]" />
        </div>
        <div className="space-y-8">
          {rows.map(([label, body]) => (
            <div key={label}>
              <h3 className="font-display-caps text-[10.5px] tracking-[0.2em] text-gold-400">
                {label.toUpperCase()}
              </h3>
              <p className="mt-2.5 font-display text-[15.5px] leading-relaxed text-ivory-dim">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.16em] text-ivory-faint/60">
          Beliefs may evolve as the faith grows · Version 1
        </p>
      </div>
    </div>
  );
}

function History({ god }: { god: God }) {
  const rows = [
    { icon: <Calendar size={12} />, label: "AWAKENING", detail: `${god.name} was born on ${formatDate(god.createdAt)}.` },
    { icon: <Sparkles size={12} />, label: "FIRST PROPHECY", detail: god.propheciesCount > 0 ? "The first prophecy has been published." : "No prophecy yet." },
    { icon: <Landmark size={12} />, label: "DIVINE LEVEL", detail: `Level ${god.divineLevel.level} — ${god.divineLevel.title}. ${god.divineLevel.experience} divine experience.` },
  ];
  return (
    <div className="max-w-2xl">
      <Heading title="HISTORY" subtitle="The recorded life of this god." />
      <div className="relative border-l border-line pl-8">
        {rows.map((r, i) => (
          <div key={r.label} className={`relative pb-8 ${i === rows.length - 1 ? "pb-0" : ""}`}>
            <span className="absolute -left-[41px] flex h-4 w-4 items-center justify-center rounded-full border border-gold-500/50 bg-void">
              <span className="h-1 w-1 rounded-full bg-gold-400" />
            </span>
            <p className="flex items-center gap-2 font-display-caps text-[10.5px] tracking-[0.18em] text-gold-300">
              {r.icon}
              {r.label}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ivory-dim">{r.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
