import { cn } from "@/lib/utils";
import type { AttributeKey } from "@/types";

/**
 * Sacred line icons for the five attributes. Deliberately thin-stroked and
 * geometric so they read as temple engravings rather than app icons.
 */

const PATHS: Record<AttributeKey, string> = {
  // ORDER — a square inscribed in a circle
  order: "M340 340 h0 M170 170h160v160h-160z M100 250a150 150 0 1 0 300 0a150 150 0 1 0 -300 0",
  // CHAOS — a fractured ring
  chaos: "M250 100a150 150 0 1 1 -106 44 M250 100l-40 60l60 20l-30 70l70 -20 M250 400l-30 -60l60 -10",
  // GREED — stacked ingots under an arc
  greed: "M110 300h280 M140 260h220 M170 220h160 M250 90a80 80 0 0 1 0 100",
  // LOVE — two overlapping circles with a point
  love: "M190 300a70 70 0 1 1 60 -110a70 70 0 1 1 60 110l-60 50z",
  // KNOWLEDGE — an eye in a triangle
  knowledge: "M250 110l140 240H110z M250 190a60 60 0 1 0 0 120a60 60 0 1 0 0 -120",
};

interface Props {
  attribute: AttributeKey;
  size?: number;
  color?: string;
  className?: string;
}

export function SacredIcon({ attribute, size = 40, color = "#cfa64f", className }: Props) {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      fill="none"
      stroke={color}
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[attribute]} />
    </svg>
  );
}
