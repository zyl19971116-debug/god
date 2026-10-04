"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ActivityEvent, God, Prayer, Prophecy } from "@/types";
import { useWallet } from "@/hooks/useWallet";

/**
 * Client god store.
 *
 * Holds the hydrated list of gods plus the user's local social state (follows,
 * saved prophecies). Every mutation is optimistic and is reconciled against the
 * API response, so the same interface will work unchanged against a real
 * database once Supabase env vars are supplied.
 */

interface FollowRecord {
  [godSlug: string]: boolean;
}

interface GodStoreValue {
  gods: God[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getGod: (slug: string) => God | null;
  follows: FollowRecord;
  toggleFollow: (slug: string) => Promise<void>;
  sendPrayer: (
    slug: string,
    text: string,
    isPublic: boolean
  ) => Promise<{ ok: boolean; prayer?: Prayer; error?: string }>;
  reactToProphecy: (id: string, kind: "BELIEVE" | "DOUBT") => Promise<void>;
  savedProphecies: string[];
  toggleSaveProphecy: (id: string) => void;
  activity: ActivityEvent[];
  prophecyIndex: Record<string, Prophecy>;
  toast: string | null;
  setToast: (s: string | null) => void;
  registerGod: (g: God) => void;
}

const GodStoreContext = createContext<GodStoreValue | null>(null);

const FOLLOWS_KEY_PREFIX = "aigod.follows";
const SAVED_KEY = "aigod.saved";
const GENERATED_GODS_KEY = "aigod.generatedGods";

export function GodStoreProvider({ children, initialGods }: { children: ReactNode; initialGods: God[] }) {
  const { address } = useWallet();
  const [gods, setGods] = useState<God[]>(initialGods);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [follows, setFollows] = useState<FollowRecord>({});
  const [savedProphecies, setSavedProphecies] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(SAVED_KEY);
      if (s) setSavedProphecies(JSON.parse(s));
      const generated = window.localStorage.getItem(GENERATED_GODS_KEY);
      if (generated) {
        const localGods = JSON.parse(generated) as God[];
        setGods((current) => [
          ...localGods,
          ...current.filter((god) => !localGods.some((local) => local.slug === god.slug)),
        ]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!address) {
      setFollows({});
      return;
    }
    try {
      const saved = window.localStorage.getItem(`${FOLLOWS_KEY_PREFIX}:${address.toLowerCase()}`);
      setFollows(saved ? JSON.parse(saved) : {});
    } catch {
      setFollows({});
    }
  }, [address]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gods?limit=200", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to reach the temple archives.");
      const data = (await res.json()) as { gods: God[] };
      setGods((current) => {
        const local = current.filter((god) => !data.gods.some((remote) => remote.slug === god.slug));
        return [...data.gods, ...local];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { activity: ActivityEvent[] };
      setActivity(data.activity);
    } catch {
      /* keep seed activity */
    }
  }, []);

  useEffect(() => {
    void refreshActivity();
  }, [refreshActivity]);

  const getGod = useCallback((slug: string) => gods.find((g) => g.slug === slug) ?? null, [gods]);

  const persistFollows = useCallback((next: FollowRecord) => {
    setFollows(next);
    if (!address) return;
    try {
      window.localStorage.setItem(`${FOLLOWS_KEY_PREFIX}:${address.toLowerCase()}`, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [address]);

  const toggleFollow = useCallback(
    async (slug: string) => {
      if (!address) {
        setToast("Connect your wallet to follow a God.");
        return;
      }
      if (follows[slug]) {
        setToast("This wallet already follows this God.");
        return;
      }
      const next = { ...follows, [slug]: true };
      persistFollows(next);

      setGods((prev) =>
        prev.map((g) =>
          g.slug === slug
            ? { ...g, followersCount: g.followersCount + 1 }
            : g
        )
      );

      try {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ godId: slug, wallet: address }),
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { followersCount?: number };
        if (typeof data.followersCount === "number") {
          setGods((prev) =>
            prev.map((g) => (g.slug === slug ? { ...g, followersCount: data.followersCount! } : g))
          );
        }
      } catch {
        persistFollows(follows);
        setToast("Could not reach the temple. Follow not recorded.");
      }
    },
    [address, follows, persistFollows]
  );

  const sendPrayer = useCallback(
    async (slug: string, text: string, isPublic: boolean) => {
      if (!address) return { ok: false, error: "Connect your wallet to pray." };
      const god = getGod(slug);
      if (!god) return { ok: false, error: "This God is not available." };
      try {
        const res = await fetch("/api/prayer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ godId: slug, wallet: address, text, isPublic, god }),
        });
        const data = (await res.json()) as { prayer?: Prayer; error?: string };
        if (!res.ok || !data.prayer) return { ok: false, error: data.error ?? "The God did not answer." };
        setGods((prev) =>
          prev.map((g) => (g.slug === slug ? { ...g, prayersCount: g.prayersCount + 1 } : g))
        );
        try {
          const saved = JSON.parse(window.localStorage.getItem(GENERATED_GODS_KEY) ?? "[]") as God[];
          window.localStorage.setItem(
            GENERATED_GODS_KEY,
            JSON.stringify(saved.map((g) => (g.slug === slug ? { ...g, prayersCount: g.prayersCount + 1 } : g)))
          );
        } catch {
          /* keep the in-memory count when storage is unavailable */
        }
        return { ok: true, prayer: data.prayer };
      } catch {
        return { ok: false, error: "The temple is unreachable. Try again shortly." };
      }
    },
    [address, getGod]
  );

  const reactToProphecy = useCallback(async (id: string, kind: "BELIEVE" | "DOUBT") => {
    setToast(kind === "BELIEVE" ? "Your belief has been recorded." : "Your doubt has been recorded.");
    try {
      await fetch("/api/prophecy/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prophecyId: id, kind }),
      });
    } catch {
      /* non-critical */
    }
  }, []);

  const toggleSaveProphecy = useCallback((id: string) => {
    setSavedProphecies((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const prophecyIndex = useMemo(() => {
    const idx: Record<string, Prophecy> = {};
    return idx;
  }, []);

  const registerGod = useCallback((g: God) => {
    setGods((prev) => (prev.some((x) => x.slug === g.slug) ? prev : [g, ...prev]));
    try {
      const saved = JSON.parse(window.localStorage.getItem(GENERATED_GODS_KEY) ?? "[]") as God[];
      const next = [g, ...saved.filter((item) => item.slug !== g.slug)].slice(0, 20);
      window.localStorage.setItem(GENERATED_GODS_KEY, JSON.stringify(next));
    } catch {
      /* keep the in-memory result when storage is unavailable */
    }
  }, []);

  const value = useMemo<GodStoreValue>(
    () => ({
      gods,
      loading,
      error,
      refresh,
      getGod,
      follows,
      toggleFollow,
      sendPrayer,
      reactToProphecy,
      savedProphecies,
      toggleSaveProphecy,
      activity,
      prophecyIndex,
      toast,
      setToast,
      registerGod,
    }),
    [
      gods, loading, error, refresh, getGod, follows, toggleFollow, sendPrayer,
      reactToProphecy, savedProphecies, activity, prophecyIndex, toast, registerGod,
    ]
  );

  return <GodStoreContext.Provider value={value}>{children}</GodStoreContext.Provider>;
}

export function useGodStore(): GodStoreValue {
  const ctx = useContext(GodStoreContext);
  if (!ctx) throw new Error("useGodStore must be used inside GodStoreProvider");
  return ctx;
}
