import { cn } from "@/lib/utils";
import type { AttributeKey } from "@/types";
import { ATTRIBUTE_META, MAX_PER_ATTRIBUTE } from "@/lib/constants";

interface Props {
  attribute: AttributeKey;
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
  max?: number;
}

export function AttributeBar({ attribute, value, size = "md", showValue = true, max = MAX_PER_ATTRIBUTE }: Props) {
  const meta = ATTRIBUTE_META[attribute];
  const filled = Math.round((value / max) * 10);
  const empty = 10 - filled;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-display-caps text-[10px] text-ivory-dim shrink-0">{meta.label}</span>
      </div>
      <div className="flex items-center gap-[3px] shrink-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={cn("block transition-all duration-500", size === "sm" ? "h-[3px] w-2" : "h-[5px] w-3.5")}
            style={{
              background: i < filled ? meta.color : "rgba(42,37,29,0.9)",
              boxShadow: i < filled ? `0 0 8px -2px ${meta.glow}` : undefined,
            }}
          />
        ))}
      </div>
      {showValue && (
        <span
          className="font-serif text-sm tabular-nums shrink-0 w-5 text-right"
          style={{ color: meta.color }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

interface BarListProps {
  attributes: Record<AttributeKey, number>;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function AttributeBars({ attributes, size = "md", showValue = true }: BarListProps) {
  const keys: AttributeKey[] = ["order", "chaos", "greed", "love", "knowledge"];
  return (
    <div className="w-full space-y-2.5">
      {keys.map((k) => (
        <AttributeBar key={k} attribute={k} value={attributes[k]} size={size} showValue={showValue} />
      ))}
    </div>
  );
}
