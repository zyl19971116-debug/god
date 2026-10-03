"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGodStore } from "@/hooks/useGodStore";

export function ToastHost() {
  const { toast } = useGodStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-sm border border-gold-500/40 bg-panel/95 px-6 py-3 backdrop-blur-xl"
        >
          <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-gold-200">{toast}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
