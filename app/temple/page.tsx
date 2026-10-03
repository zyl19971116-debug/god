"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Wallet, Loader2, Scroll, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Panel";
import { FollowButton } from "@/components/god/FollowButton";
import { WalletModal } from "@/components/layout/WalletModal";
import { useWallet } from "@/hooks/useWallet";
import { useGodStore } from "@/hooks/useGodStore";
import { shortWallet, formatCompact, timeAgo, formatDate } from "@/lib/format";
import { ATTRIBUTE_META } from "@/lib/constants";
import type { AttributeKey, God, Prophecy } from "@/types";

type Tab = "MY_GODS" | "FOLLOWING" | "PRAYERS" | "SAVED" | "ACTIVITY" | "PROFILE";

const TABS: { key: Tab; label: string }[] = [
  { key: "MY_GODS", label: "MY GODS" },
  { key: "FOLLOWING", label: "GODS I FOLLOW" },
  { key: "PRAYERS", label: "MY PRAYERS" },
  { key: "SAVED", label: "SAVED PROPHECIES" },
  { key: "ACTIVITY", label: "ACTIVITY" },
  { key: "PROFILE", label: "PROFILE" },
];

export default function TemplePage() {
  const { address, connecting } = useWallet();
  const { gods, follows, savedProphecies, activity } = useGodStore();
  const [tab, setTab] = useState<Tab>("MY_GODS");
  const [walletOpen, setWalletOpen] = useState(false);
  const [savedList, setSavedList] = useState<Prophecy[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const myGods = address ? gods.filter((g) => g.creatorWallet.toLowerCase() === address.toLowerCase()) : [];
  const followedGods = gods.filter((g) => follows[g.slug]);

  useEffect(() => {
    if (tab !== "SAVED" || savedProphecies.length === 0) return;
    let cancelled = false;
    setLoadingSaved(true);
    (async () => {
      try {
        const res = await fetch("/api/prophecies", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { prophecies: Prophecy[] };
        if (!cancelled) {
          setSavedList(data.prophecies.filter((p) => savedProphecies.includes(p.id)));
        }
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, savedProphecies]);

  if (!address) {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-temple-grid" />
        <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-gold w-full max-w-md rounded-md p-10"
          >
            <Shield size={30} className="mx-auto text-gold-400" strokeWidth={1.2} />
            <h1 className="mt-6 font-display-caps text-xl tracking-[0.16em] text-ivory">ENTER THE TEMPLE</h1>
            <p className="mx-auto mt-4 max-w-xs text-xs leading-relaxed text-ivory-faint">
              Connect your wallet to see your Gods, your beliefs, your prayers and your saved prophecies.
            </p>
            <div className="mt-8">
              <Button onClick={() => setWalletOpen(true)} className="w-full">
                {connecting ? <Loader2 size={13} className="animate-spin" /> : <Wallet size={13} />}
                CONNECT WALLET
              </Button>
            </div>
            <p className="mt-5 text-[10px] leading-relaxed text-ivory-faint/60">
              We only request your public address. No signatures, no private keys.
            </p>
          </motion.div>
        </section>
        <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-temple-grid" />
      <section className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-display-caps text-[10px] tracking-divine text-gold-400">YOUR SANCTUM</p>
            <h1 className="mt-3 font-display-caps text-[clamp(1.8rem,4vw,2.6rem)] text-ivory">THE TEMPLE</h1>
            <p className="mt-3 font-mono text-[11px] text-ivory-faint">{shortWallet(address, 6)}</p>
          </div>
          <Link href="/create" className="btn-gold rounded-sm px-6 py-3.5 text-[11px] uppercase tracking-[0.18em]">
            CREATE ANOTHER GOD
          </Link>
        </div>

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

        {tab === "MY_GODS" && (
          <section id="my-gods">
            {myGods.length === 0 ? (
              <EmptyBlock
                title="NO GODS YET"
                body="You have not created a god. Twenty attribute points are waiting to be spent."
                cta={{ href: "/create", label: "CREATE YOUR GOD" }}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {myGods.map((g) => (
                  <GodSummary key={g.slug} god={g} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "FOLLOWING" && (
          <section>
            {followedGods.length === 0 ? (
              <EmptyBlock
                title="FOLLOW NO ONE"
                body="You are not following any god yet. Explore the pantheon and pledge yourself."
                cta={{ href: "/explore", label: "EXPLORE GODS" }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {followedGods.map((g) => (
                  <div key={g.slug} className="panel flex items-center gap-4 rounded-md p-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-gold-500/25">
                      <Image src={g.imageUrl} alt="" fill sizes="56px" className="object-cover object-[center_15%]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/god/${g.slug}`} className="block truncate font-display-caps text-[12px] text-ivory hover:text-gold-200">
                        {g.name}
                      </Link>
                      <p className="truncate text-[10.5px] text-ivory-faint">{formatCompact(g.followersCount)} followers</p>
                    </div>
                    <FollowButton slug={g.slug} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "PRAYERS" && <PrayersTab />}

        {tab === "SAVED" && (
          <section>
            {loadingSaved ? (
              <p className="text-xs text-ivory-faint">Loading saved prophecies…</p>
            ) : savedList.length === 0 ? (
              <EmptyBlock
                title="NOTHING SAVED"
                body="Prophecies you save will appear here so you can return to them."
                cta={{ href: "/explore", label: "FIND A GOD" }}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedList.map((p) => (
                  <div key={p.id} className="panel-gold rounded-md p-5">
                    <div className="mb-2 flex items-center gap-2 text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint/70">
                      <Bookmark size={11} className="text-gold-500/70" />
                      <span className="text-gold-300">{p.godName}</span>
                      <span>· {formatDate(p.createdAt)}</span>
                    </div>
                    <p className="font-display text-[14px] leading-relaxed text-ivory">&ldquo;{p.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "ACTIVITY" && (
          <section className="panel rounded-md p-6">
            {activity.length === 0 ? (
              <p className="text-xs text-ivory-faint">No activity recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.slice(0, 20).map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-4 border-b border-line/50 pb-3 last:border-0">
                    <span className="text-[12px] text-ivory-dim">{e.text}</span>
                    <span className="shrink-0 text-[10px] text-ivory-faint/60">{timeAgo(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "PROFILE" && (
          <section id="profile" className="panel max-w-xl rounded-md p-8">
            <h3 className="font-display-caps text-[13px] tracking-[0.16em] text-ivory">PROFILE</h3>
            <div className="mt-6 space-y-4 text-xs">
              <Row label="WALLET" value={shortWallet(address, 8)} mono />
              <Row label="GODS CREATED" value={String(myGods.length)} />
              <Row label="FOLLOWING" value={String(followedGods.length)} />
              <Row label="SAVED PROPHECIES" value={String(savedProphecies.length)} />
              <Row label="NETWORK" value="EVM · read-only in V1" />
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-line/50 pb-3 last:border-0">
      <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-ivory-faint">{label}</span>
      <span className={mono ? "font-mono text-[11px] text-gold-200" : "text-[12px] text-ivory"}>{value}</span>
    </div>
  );
}

function EmptyBlock({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="panel rounded-md py-16 text-center">
      <Scroll size={22} className="mx-auto text-gold-500/50" strokeWidth={1.2} />
      <p className="mt-5 font-display-caps text-base text-ivory">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-ivory-faint">{body}</p>
      {cta && (
        <Link href={cta.href} className="btn-ghost mt-7 inline-block rounded-sm px-6 py-3 text-[10px] uppercase tracking-[0.16em]">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function GodSummary({ god }: { god: God }) {
  const meta = ATTRIBUTE_META[god.dominantAttribute as AttributeKey];
  return (
    <Link href={`/god/${god.slug}`} className="panel card-lift block overflow-hidden rounded-md">
      <div className="relative h-36">
        <Image src={god.imageUrl} alt="" fill sizes="33vw" className="object-cover object-[center_18%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display-caps text-[13px] tracking-[0.08em] text-ivory">{god.name}</h3>
            <p className="mt-0.5 text-[10.5px] text-ivory-faint">{god.title}</p>
          </div>
          <span className="shrink-0 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.12em]" style={{ borderColor: `${meta.color}55`, color: meta.color }}>
            LVL {god.divineLevel.level} · {god.divineLevel.title}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat label="FOLLOWERS" value={formatCompact(god.followersCount)} />
          <Stat label="PRAYERS" value={formatCompact(god.prayersCount)} />
          <Stat label="AGE" value={timeAgo(god.createdAt)} />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-[13px] text-gold-200">{value}</p>
      <p className="mt-0.5 font-sans text-[8.5px] uppercase tracking-[0.14em] text-ivory-faint/60">{label}</p>
    </div>
  );
}

function PrayersTab() {
  const { address } = useWallet();
  const [prayers, setPrayers] = useState<{ text: string; response: string; godName: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/prayers?wallet=${address}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { prayers: typeof prayers };
        if (!cancelled) setPrayers(data.prayers);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (loading) return <p className="text-xs text-ivory-faint">Loading your prayers…</p>;
  if (prayers.length === 0)
    return (
      <EmptyBlock
        title="NO PRAYERS YET"
        body="Prayers you send to any god — public or private — are collected here."
        cta={{ href: "/explore", label: "FIND A GOD" }}
      />
    );

  return (
    <div className="space-y-4">
      {prayers.map((p, i) => (
        <div key={i} className="panel rounded-md p-5">
          <div className="mb-2 flex items-center justify-between text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint/70">
            <span className="text-gold-300">{p.godName}</span>
            <span>{timeAgo(p.createdAt)}</span>
          </div>
          <p className="text-[12.5px] italic leading-relaxed text-ivory-dim">&ldquo;{p.text}&rdquo;</p>
          <div className="mt-3 border-t border-line/60 pt-3">
            <p className="font-display text-[13px] leading-relaxed text-ivory">{p.response}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
