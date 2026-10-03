"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GodProfile } from "@/components/god/GodProfile";
import { useGodStore } from "@/hooks/useGodStore";

export function GeneratedGodFallback({ slug }: { slug: string }) {
  const { getGod } = useGodStore();
  const [storageLoaded, setStorageLoaded] = useState(false);
  const god = getGod(slug);

  useEffect(() => {
    const timer = window.setTimeout(() => setStorageLoaded(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  if (god) {
    return <GodProfile god={god} prophecies={[]} publicPrayers={[]} related={[]} />;
  }

  if (!storageLoaded) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ivory-faint">
          OPENING THE TEMPLE
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display-caps text-[10px] tracking-divine text-gold-400">UNRECORDED</p>
      <h1 className="mt-4 font-display-caps text-4xl text-ivory">404</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory-faint">
        This temple is not available in this browser or the public archive.
      </p>
      <Link href="/create" className="btn-gold mt-8 rounded-sm px-7 py-3 text-[11px] uppercase tracking-[0.18em]">
        CREATE A GOD
      </Link>
    </div>
  );
}
