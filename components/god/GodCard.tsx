"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GodPortrait } from "@/components/god/GodPortrait";
import { AttributeBar } from "@/components/ui/AttributeBar";
import { FollowButton } from "@/components/god/FollowButton";
import { formatCompact } from "@/lib/format";
import type { God } from "@/types";

interface Props {
  god: God;
  rank?: number;
  index?: number;
}

export function GodCard({ god, rank, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 5) * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
      className="group panel card-lift relative rounded-md overflow-hidden"
    >
      <Link href={`/god/${god.slug}`} className="block">
        <div className="relative aspect-[4/5]">
          <GodPortrait god={god} className="absolute inset-0" sizes="(max-width:768px) 90vw, 30vw" />
          {rank !== undefined && (
            <div className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 bg-void/70 font-serif text-sm text-gold-200 backdrop-blur-sm">
              {rank}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
            <h3 className="font-display-caps text-lg text-ivory drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {god.name}
            </h3>
            <p className="mt-0.5 font-display text-[11px] uppercase tracking-[0.18em] text-gold-300/90">
              {god.title}
            </p>
          </div>
        </div>
      </Link>

      <div className="space-y-3 border-t border-line/60 p-5">
        <div className="space-y-2">
          <AttributeBar attribute="order" value={god.attributes.order} size="sm" />
          <AttributeBar attribute="chaos" value={god.attributes.chaos} size="sm" />
          <AttributeBar attribute="greed" value={god.attributes.greed} size="sm" />
          <AttributeBar attribute="love" value={god.attributes.love} size="sm" />
          <AttributeBar attribute="knowledge" value={god.attributes.knowledge} size="sm" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg text-gold-200">{formatCompact(god.followersCount)}</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
              Followers
            </span>
          </div>
          <FollowButton slug={god.slug} />
        </div>
      </div>
    </motion.article>
  );
}
