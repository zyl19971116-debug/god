"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import type { GlobalStats } from "@/types";

const ITEMS: { key: keyof GlobalStats; label: string; compact: boolean }[] = [
  { key: "godsCreated", label: "GODS CREATED", compact: false },
  { key: "totalFollowers", label: "TOTAL FOLLOWERS", compact: true },
  { key: "dailyPrayers", label: "DAILY PRAYERS", compact: false },
  { key: "countries", label: "COUNTRIES", compact: false },
];

export function StatsStrip({ stats }: { stats: GlobalStats }) {
  return (
    <section className="relative border-y border-line/70 bg-abyss/60">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-5 md:grid-cols-4 md:px-8">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="relative px-2 py-9 text-center md:py-11"
          >
            {i > 0 && (
              <span className="absolute left-0 top-1/2 hidden h-14 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-line to-transparent md:block" />
            )}
            <p className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] leading-none text-ivory">
              <CountUp value={stats[item.key]} compact={item.compact} />
            </p>
            <p className="mt-3 font-sans text-[9.5px] uppercase tracking-[0.24em] text-gold-400/80">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
