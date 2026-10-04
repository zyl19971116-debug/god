"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGodStore } from "@/hooks/useGodStore";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

export function FollowButton({ slug, className }: { slug: string; className?: string }) {
  const { follows, toggleFollow } = useGodStore();
  const { address } = useWallet();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const clickLock = useRef(false);
  const isFollowing = !!follows[slug];

  const onClick = async () => {
    if (clickLock.current || isFollowing) return;
    if (!address) {
      router.push("/temple");
      return;
    }
    clickLock.current = true;
    setBusy(true);
    try {
      await toggleFollow(slug);
    } finally {
      setBusy(false);
      clickLock.current = false;
    }
  };

  return (
    <Button
      variant={isFollowing ? "ghost" : "gold"}
      size="sm"
      className={cn("min-w-[118px]", className)}
      onClick={onClick}
      disabled={busy || isFollowing}
      aria-pressed={isFollowing}
    >
      {isFollowing ? (
        <motion.span
          key="following"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5"
        >
          <Check size={12} /> FOLLOWING
        </motion.span>
      ) : (
        <motion.span
          key="follow"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5"
        >
          <HeartHandshake size={12} /> FOLLOW
        </motion.span>
      )}
    </Button>
  );
}
