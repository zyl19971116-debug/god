"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CircleDot } from "lucide-react";
import type { ActivityEvent } from "@/types";
import { useGodStore } from "@/hooks/useGodStore";
import { timeAgo } from "@/lib/format";

export function LiveActivity({ seed }: { seed: ActivityEvent[] }) {
  const { activity } = useGodStore();
  const source = activity.length ? activity : seed;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 4200);
    return () => clearInterval(t);
  }, []);

  const visible = source.slice(tick % Math.max(1, source.length - 4), (tick % Math.max(1, source.length - 4)) + 4);

  return (
    <div className="panel relative overflow-hidden rounded-md p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Activity size={14} className="text-gold-400" />
          <h3 className="font-display-caps text-[11px] tracking-[0.2em] text-ivory">LIVE ACTIVITY</h3>
        </div>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-ivory-faint">LIVE</span>
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45 }}
              className="flex items-start gap-3 border-b border-line/50 pb-3 last:border-0 last:pb-0"
            >
              <CircleDot size={11} className="mt-1 shrink-0 text-gold-500/70" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[12px] leading-snug text-ivory-dim">{e.text}</p>
                <p className="mt-0.5 font-sans text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint/60">
                  {timeAgo(e.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
