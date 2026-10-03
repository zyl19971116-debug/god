import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { LiveActivity } from "@/components/home/LiveActivity";
import { TopGodsList } from "@/components/home/TopGodsList";
import { GodCard } from "@/components/god/GodCard";
import { SectionHeading } from "@/components/ui/Panel";
import { store } from "@/lib/database/store";
import { DivineHistory } from "@/components/home/DivineHistory";

export default function HomePage() {
  const stats = store.stats();
  const featured = store.featured(5);
  const top = store.topByFollowers(10);
  const activity = store.activity(10);
  const history = store.worldHistory(6);

  return (
    <div className="relative">
      <Hero godsCreated={stats.godsCreated} />
      <StatsStrip stats={stats} />

      {/* Featured gods + sidebar */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8">
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
      </section>

      <DivineHistory events={history} />
    </div>
  );
}
