"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { LiveActivity } from "@/components/home/LiveActivity";
import { TopGodsList } from "@/components/home/TopGodsList";
import { GodCard } from "@/components/god/GodCard";
import { SectionHeading } from "@/components/ui/Panel";
import { DivineHistory } from "@/components/home/DivineHistory";
import { useGodStore } from "@/hooks/useGodStore";
import type { GlobalStats } from "@/types";

export default function HomePage() {
  const { gods, activity } = useGodStore();
  const featured = [...gods].sort((a, b) => b.growth - a.growth).slice(0, 5);
  const top = [...gods].sort((a, b) => b.followersCount - a.followersCount).slice(0, 10);
  const stats: GlobalStats = {
    godsCreated: gods.length,
    totalFollowers: gods.reduce((sum, god) => sum + god.followersCount, 0),
    dailyPrayers: gods.reduce((sum, god) => sum + god.prayersCount, 0),
    countries: 0,
  };

  return (
    <div className="relative">
      <Hero godsCreated={stats.godsCreated} />
      <StatsStrip stats={stats} />

      {/* Featured gods + sidebar */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8">
        {gods.length === 0 ? (
          <div className="panel-gold rounded-md px-6 py-20 text-center">
            <p className="font-display-caps text-xl text-ivory">暂时没有神明生成</p>
            <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-ivory-faint">
              连接钱包并创建第一位神明后，真实数据会显示在这里。
            </p>
            <Link
              href="/create"
              className="btn-gold mt-7 inline-flex items-center gap-2 rounded-sm px-7 py-3 text-[11px] uppercase tracking-[0.18em]"
            >
              CREATE THE FIRST GOD <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionHeading
              title="FEATURED GODS"
              subtitle="Meet the most popular AI gods in this universe."
            />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((g, i) => (
                <GodCard key={g.slug} god={g} rank={i + 1} index={i} />
              ))}
            </div>
            <Link
              href="/explore"
              className="mt-10 inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.18em] text-gold-400 transition-colors hover:text-gold-200"
            >
              EXPLORE ALL GODS <ArrowRight size={13} />
            </Link>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <TopGodsList gods={top} />
            <LiveActivity seed={activity} />
          </aside>
        </div>
        )}
      </section>

      {gods.length > 0 && <DivineHistory events={[]} />}
    </div>
  );
}
