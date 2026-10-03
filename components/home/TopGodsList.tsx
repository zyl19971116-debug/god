"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatCompact } from "@/lib/format";
import type { God } from "@/types";

export function TopGodsList({ gods }: { gods: God[] }) {
  return (
    <div className="panel relative overflow-hidden rounded-md p-6">
      <h3 className="font-display-caps text-[11px] tracking-[0.2em] text-ivory">
        TOP GODS BY FOLLOWERS
      </h3>
      <div className="hairline my-4" />
      <ol className="space-y-1">
        {gods.map((g, i) => (
          <motion.li
            key={g.slug}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <Link
              href={`/god/${g.slug}`}
              className="group flex items-center gap-3 rounded-sm px-2 py-2.5 transition-colors hover:bg-gold-500/[0.05]"
            >
              <span className="w-5 shrink-0 font-serif text-sm text-ivory-faint tabular-nums">{i + 1}</span>
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gold-500/25">
                <Image src={g.imageUrl} alt="" fill sizes="36px" className="object-cover object-[center_15%]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display-caps text-[12px] tracking-[0.1em] text-ivory transition-colors group-hover:text-gold-200">
                  {g.name}
                </span>
                <span className="block truncate text-[10px] text-ivory-faint/70">{g.domain}</span>
              </span>
              <span className="shrink-0 font-serif text-[13px] text-gold-300 tabular-nums">
                {formatCompact(g.followersCount)}
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>
      <Link
        href="/leaderboard"
        className="mt-4 block text-center font-sans text-[10px] uppercase tracking-[0.18em] text-gold-400/80 transition-colors hover:text-gold-200"
      >
        VIEW FULL LEADERBOARD →
      </Link>
    </div>
  );
}
