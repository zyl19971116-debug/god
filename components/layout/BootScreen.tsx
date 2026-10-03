"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function BootScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("aigod.booted")) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => {
      window.sessionStorage.setItem("aigod.booted", "1");
      setDone(true);
    }, 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-void"
        >
          <motion.svg
            width="76"
            height="76"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="44" fill="none" stroke="#cfa64f" strokeWidth="1" opacity="0.4" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#cfa64f" strokeWidth="0.7" opacity="0.3" />
            <path d="M50 6 L58 50 L50 94 L42 50 Z" fill="#cfa64f" opacity="0.85" />
            <circle cx="50" cy="50" r="4" fill="#fbf6e6" />
          </motion.svg>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8 font-display-caps text-xl tracking-divine text-ivory"
          >
            AI <span className="text-gold-400">GOD</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-3 font-sans text-[10px] uppercase tracking-[0.3em] text-ivory-faint"
          >
            CREATING A NEW MYTHOLOGY
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
