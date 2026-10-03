"use client";

import { motion } from "framer-motion";
import { Eye, HelpCircle, Bookmark, Share2, Check } from "lucide-react";
import { useState } from "react";
import type { Prophecy } from "@/types";
import { useGodStore } from "@/hooks/useGodStore";
import { formatDate, formatCompact } from "@/lib/format";

interface Props {
  prophecy: Prophecy;
  index?: number;
  showGod?: boolean;
}

export function ProphecyCard({ prophecy, index = 0, showGod = false }: Props) {
  const { reactToProphecy, savedProphecies, toggleSaveProphecy, setToast } = useGodStore();
  const [reacted, setReacted] = useState<"BELIEVE" | "DOUBT" | null>(null);
  const [local, setLocal] = useState(prophecy.reactions);
  const saved = savedProphecies.includes(prophecy.id);

  const react = async (kind: "BELIEVE" | "DOUBT") => {
    if (reacted) return;
    setReacted(kind);
    setLocal((r) => ({
      believe: r.believe + (kind === "BELIEVE" ? 1 : 0),
      doubt: r.doubt + (kind === "DOUBT" ? 1 : 0),
    }));
    await reactToProphecy(prophecy.id, kind);
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/god/${prophecy.godSlug}` : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: `Prophecy of ${prophecy.godName}`, text: prophecy.text, url });
      } else {
        await navigator.clipboard.writeText(`${prophecy.text}\n\n— ${prophecy.godName} · ${url}`);
        setToast("Prophecy copied to clipboard.");
      }
    } catch {
      setToast("Sharing was cancelled.");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06 }}
      className="panel-gold manuscript relative rounded-md p-6 md:p-7"
    >
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-line/70 pb-3">
        <span className="font-display-caps text-[10px] tracking-divine text-gold-400">
          PROPHECY #{String(prophecy.number).padStart(4, "0")}
        </span>
        <div className="flex items-center gap-3 text-[10px] text-ivory-faint">
          {showGod && <span className="font-display-caps text-gold-300">{prophecy.godName}</span>}
          <span>{formatDate(prophecy.createdAt)}</span>
          <span className="border border-line px-2 py-0.5 tracking-[0.14em]">{prophecy.category}</span>
        </div>
      </div>

      <blockquote className="font-display text-[17px] leading-relaxed text-ivory md:text-lg">
        <span className="mr-2 text-gold-400/70">&ldquo;</span>
        {prophecy.text}
        <span className="ml-1 text-gold-400/70">&rdquo;</span>
      </blockquote>

      <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-ivory-faint/70">
        Fictional in-universe AI-generated content — not a factual forecast.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line/70 pt-4">
        <ReactionButton
          active={reacted === "BELIEVE"}
          onClick={() => react("BELIEVE")}
          icon={<Eye size={12} />}
          label="BELIEVE"
          count={local.believe}
        />
        <ReactionButton
          active={reacted === "DOUBT"}
          onClick={() => react("DOUBT")}
          icon={<HelpCircle size={12} />}
          label="DOUBT"
          count={local.doubt}
        />
        <ReactionButton
          active={saved}
          onClick={() => toggleSaveProphecy(prophecy.id)}
          icon={saved ? <Check size={12} /> : <Bookmark size={12} />}
          label="SAVE"
        />
        <ReactionButton onClick={share} icon={<Share2 size={12} />} label="SHARE" />
      </div>
    </motion.article>
  );
}

function ReactionButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "btn-ghost rounded-sm px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]"
          : "rounded-sm border border-line px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ivory-dim transition-all hover:border-gold-500/50 hover:text-gold-200"
      }
    >
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
        {count !== undefined && <span className="text-gold-300">{formatCompact(count)}</span>}
      </span>
    </button>
  );
}
