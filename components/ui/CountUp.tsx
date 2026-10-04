"use client";

import { useEffect, useRef, useState } from "react";
import { formatCompact } from "@/lib/format";

interface Props {
  value: number;
  compact?: boolean;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CountUp({ value, compact = true, suffix = "", duration = 1600, className }: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const displayRef = useRef(0);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let animationFrame = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          const from = displayRef.current;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(from + (value - from) * eased));
            if (p < 1) animationFrame = requestAnimationFrame(tick);
          };
          animationFrame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {compact ? formatCompact(display) : display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
