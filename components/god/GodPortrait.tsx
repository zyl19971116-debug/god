"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { ATTRIBUTE_META } from "@/lib/constants";
import type { AttributeKey, God } from "@/types";

interface Props {
  god: God;
  priority?: boolean;
  sizes?: string;
  className?: string;
  showHalo?: boolean;
}

/**
 * Deity portrait.
 *
 * Every container carries a bottom black fade so the artwork always blends
 * into the UI and never shows a hard edge — part of the design language.
 */
export function GodPortrait({ god, priority, sizes = "33vw", className, showHalo = true }: Props) {
  const accent = ATTRIBUTE_META[god.dominantAttribute as AttributeKey]?.glow;
  return (
    <div className={cn("relative overflow-hidden bg-void", className)}>
      <Image
        src={god.imageUrl}
        alt={`${god.name} — ${god.title}`}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover object-[center_18%] transition-transform duration-[1400ms] ease-out will-change-transform group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-transparent to-transparent" />
      {showHalo && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: `inset 0 0 120px -40px ${accent ?? "rgba(207,166,79,0.4)"}` }}
        />
      )}
    </div>
  );
}
