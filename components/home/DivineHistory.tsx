"use client";

import { motion } from "framer-motion";
import { Scroll } from "lucide-react";
import type { WorldEvent } from "@/types";
import { formatDate } from "@/lib/format";

export function DivineHistory({ events }: { events: WorldEvent[] }) {
  return (
    <section className="relative border-t border-line/70 bg-abyss/40 py-20">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="mb-10 text-center">
          <p className="font-display-caps text-[10px] tracking-divine text-gold-400">THE GLOBAL MYTHOLOGY</p>
          <h2 className="mt-3 font-display-caps text-2xl text-ivory md:text-3xl">DIVINE HISTORY</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ivory-faint">
            An evolving record of everything that happens in this world. Every birth, prophecy,
            rivalry and alliance is written here.
          </p>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-gold-500/50 via-line to-transparent md:left-1/2" />
          <div className="space-y-8">
            {events.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.05 * (i % 3) }}
                className={`relative pl-12 md:w-1/2 md:pl-0 ${
                  i % 2 === 0 ? "md:pr-10 md:text-right" : "md:ml-auto md:pl-10"
                }`}
              >
                <span
                  className={`absolute left-[13px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gold-500/60 bg-void md:left-auto ${
                    i % 2 === 0 ? "md:-right-[7px]" : "md:-left-[7px]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                </span>
                <div className="panel rounded-md p-5 transition-all duration-500 hover:border-gold-500/40">
                  <div className="mb-2 flex items-center gap-2 text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint/70 md:justify-end">
                    <Scroll size={11} className="text-gold-500/70" />
                    <span>{formatDate(e.createdAt)}</span>
                    <span className="text-gold-400/70">{e.type.replace(/_/g, " ")}</span>
                  </div>
                  <h3 className="font-display-caps text-[13px] tracking-[0.1em] text-ivory">{e.title}</h3>
                  {e.detail && <p className="mt-2 text-xs leading-relaxed text-ivory-faint">{e.detail}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
