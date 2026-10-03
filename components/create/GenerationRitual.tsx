"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { GENERATION_STAGES } from "@/lib/constants";

export function GenerationRitual({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    GENERATION_STAGES.forEach((_, i) => {
      timers.push(setTimeout(() => setStage(i), 600 + i * 520));
    });
    timers.push(
      setTimeout(() => {
        setFinished(true);
        setTimeout(onComplete, 1600);
      }, 600 + GENERATION_STAGES.length * 520 + 500)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-void/98 px-6 backdrop-blur-md"
    >
      {/* rotating sacred geometry */}
      <div className="relative mb-14 h-[220px] w-[220px]">
        <motion.svg
          viewBox="0 0 300 300"
          className="absolute inset-0 h-full w-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="150" cy="150" r="132" fill="none" stroke="#cfa64f" strokeWidth="0.8" opacity="0.45" />
          <circle cx="150" cy="150" r="96" fill="none" stroke="#cfa64f" strokeWidth="0.6" opacity="0.3" />
          <path d="M150 20 L265 240 L35 240 Z" fill="none" stroke="#cfa64f" strokeWidth="0.6" opacity="0.4" />
          <path d="M150 280 L35 60 L265 60 Z" fill="none" stroke="#cfa64f" strokeWidth="0.6" opacity="0.3" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={150 + Math.cos(a) * 114}
                cy={150 + Math.sin(a) * 114}
                r="2.5"
                fill="#cfa64f"
                opacity="0.6"
              />
            );
          })}
        </motion.svg>
        <motion.svg
          viewBox="0 0 300 300"
          className="absolute inset-0 h-full w-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="150" cy="150" r="70" fill="none" stroke="#e8d6a6" strokeWidth="0.7" opacity="0.35" />
          <path d="M150 80 L150 220 M80 150 L220 150" stroke="#e8d6a6" strokeWidth="0.5" opacity="0.3" />
        </motion.svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.94, 1.06, 0.94] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-16 w-16 rounded-full bg-gold-300/80 blur-[18px]"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display-caps text-xl tracking-[0.24em] text-ivory md:text-2xl"
          >
            A NEW GOD <span className="gold-text">HAS BEEN BORN.</span>
          </motion.p>
        ) : (
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="font-display-caps text-[13px] tracking-[0.24em] text-gold-200 md:text-base"
          >
            {GENERATION_STAGES[stage]}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-10 w-full max-w-md space-y-2">
        {GENERATION_STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              {i < stage || finished ? (
                <Check size={11} className="text-gold-300" />
              ) : i === stage ? (
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-300" />
              ) : (
                <span className="h-1 w-1 rounded-full bg-line" />
              )}
            </span>
            <span
              className={`font-sans text-[10px] uppercase tracking-[0.16em] transition-colors ${
                i < stage || finished ? "text-ivory-faint/60" : i === stage ? "text-gold-200" : "text-ivory-faint/35"
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
