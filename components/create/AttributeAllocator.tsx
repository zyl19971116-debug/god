"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Sparkles } from "lucide-react";
import { ATTRIBUTE_KEYS, ATTRIBUTE_META, MAX_PER_ATTRIBUTE, MAX_POINTS } from "@/lib/constants";
import { SacredIcon } from "@/components/ui/SacredIcon";
import type { AttributeKey, Attributes } from "@/types";

interface Props {
  value: Attributes;
  onChange: (next: Attributes) => void;
}

export function AttributeAllocator({ value, onChange }: Props) {
  const remaining = useMemo(
    () => MAX_POINTS - ATTRIBUTE_KEYS.reduce((s, k) => s + value[k], 0),
    [value]
  );

  const set = (k: AttributeKey, next: number) => {
    const clamped = Math.max(0, Math.min(MAX_PER_ATTRIBUTE, next));
    const others = ATTRIBUTE_KEYS.reduce((s, key) => (key === k ? s : s + value[key]), 0);
    if (others + clamped > MAX_POINTS) return;
    onChange({ ...value, [k]: clamped });
  };

  return (
    <div className="panel-gold relative rounded-md p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-display-caps text-[13px] tracking-[0.18em] text-ivory">
          DISTRIBUTE 20 ATTRIBUTE POINTS
        </h3>
        <div className="flex items-center gap-2.5">
          <span className="font-sans text-[9.5px] uppercase tracking-[0.2em] text-ivory-faint">
            POINTS REMAINING
          </span>
          <motion.span
            key={remaining}
            initial={{ scale: 1.25, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/50 font-serif text-base text-gold-200"
          >
            {remaining}
          </motion.span>
        </div>
      </div>

      <div className="space-y-6">
        {ATTRIBUTE_KEYS.map((k) => {
          const meta = ATTRIBUTE_META[k];
          const v = value[k];
          const filled = Math.round((v / 10) * 10);
          return (
            <div key={k}>
              <div className="mb-2 flex items-center gap-3">
                <SacredIcon attribute={k} size={26} color={meta.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display-caps text-[11.5px] tracking-[0.18em] text-ivory">
                      {meta.label}
                    </span>
                    <span className="font-serif text-base tabular-nums" style={{ color: meta.color }}>
                      {v}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10.5px] leading-snug text-ivory-faint/80">{meta.blurb}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Stepper
                    onClick={() => set(k, v - 1)}
                    disabled={v === 0}
                    icon={<Minus size={11} />}
                    label={`Decrease ${meta.label}`}
                  />
                  <Stepper
                    onClick={() => set(k, v + 1)}
                    disabled={remaining === 0 || v >= MAX_PER_ATTRIBUTE}
                    icon={<Plus size={11} />}
                    label={`Increase ${meta.label}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-[4px]">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => set(k, i + 1)}
                    disabled={i + 1 > v + remaining}
                    className="group h-3 flex-1 rounded-[1px] transition-all duration-300 disabled:cursor-not-allowed"
                    style={{
                      background: i < filled ? meta.color : "rgba(42,37,29,0.9)",
                      boxShadow: i < filled ? `0 0 12px -4px ${meta.glow}` : undefined,
                    }}
                    aria-label={`${meta.label} level ${i + 1}`}
                  />
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={MAX_PER_ATTRIBUTE}
                value={v}
                onChange={(e) => set(k, Number(e.target.value))}
                className="mt-3 w-full"
                aria-label={`${meta.label} slider`}
              />
            </div>
          );
        })}
      </div>

      {remaining > 0 && (
        <p className="mt-6 flex items-center gap-2 text-[10.5px] text-gold-300/80">
          <Sparkles size={12} />
          {remaining} point{remaining === 1 ? "" : "s"} still unassigned.
        </p>
      )}
    </div>
  );
}

function Stepper({
  onClick,
  disabled,
  icon,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ivory-dim transition-all hover:border-gold-500/60 hover:text-gold-200 disabled:opacity-25"
    >
      {icon}
    </button>
  );
}
