"use client";

import { motion } from "framer-motion";
import { FORMS, ORIGINS } from "@/lib/constants";
import type { GodForm, Origin } from "@/types";

export function OriginPicker({
  value,
  onChange,
}: {
  value: Origin | null;
  onChange: (o: Origin | null) => void;
}) {
  return (
    <div className="panel rounded-md p-6 md:p-8">
      <h3 className="font-display-caps text-[13px] tracking-[0.18em] text-ivory">CHOOSE AN ORIGIN</h3>
      <p className="mt-1.5 text-[11px] text-ivory-faint">Optional — the origin shapes the creation myth and the portrait.</p>
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {ORIGINS.map((o, i) => {
          const active = value === o.key;
          return (
            <motion.button
              key={o.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onChange(active ? null : o.key)}
              className={
                active
                  ? "rounded-sm border border-gold-500/70 bg-gold-500/[0.1] px-3 py-3.5 text-center shadow-gold"
                  : "rounded-sm border border-line px-3 py-3.5 text-center transition-all hover:border-gold-500/40 hover:bg-gold-500/[0.04]"
              }
            >
              <span className={`block font-display-caps text-[10.5px] tracking-[0.14em] ${active ? "text-gold-200" : "text-ivory-dim"}`}>
                {o.label}
              </span>
              <span className="mt-1.5 block text-[9px] leading-tight text-ivory-faint/70">{o.hint}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function FormPicker({
  value,
  onChange,
}: {
  value: GodForm | null;
  onChange: (f: GodForm | null) => void;
}) {
  return (
    <div className="panel rounded-md p-6 md:p-8">
      <h3 className="font-display-caps text-[13px] tracking-[0.18em] text-ivory">CHOOSE A FORM</h3>
      <p className="mt-1.5 text-[11px] text-ivory-faint">This controls how the divine portrait is imagined.</p>
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {FORMS.map((f) => {
          const active = value === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onChange(active ? null : f.key)}
              className={
                active
                  ? "rounded-sm border border-gold-500/70 bg-gold-500/[0.1] px-3 py-3.5 text-center shadow-gold"
                  : "rounded-sm border border-line px-3 py-3.5 text-center transition-all hover:border-gold-500/40 hover:bg-gold-500/[0.04]"
              }
            >
              <span className={`block font-display-caps text-[10.5px] tracking-[0.14em] ${active ? "text-gold-200" : "text-ivory-dim"}`}>
                {f.label}
              </span>
              <span className="mt-1.5 block text-[9px] leading-tight text-ivory-faint/70">{f.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
