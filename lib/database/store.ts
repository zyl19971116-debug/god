import type {
  ActivityEvent,
  God,
  GodQuery,
  GlobalStats,
  Prayer,
  Prophecy,
  WorldEvent,
} from "@/types";
import { SEED_GODS, buildGod, buildSeedProphecies } from "@/lib/data/seed";
import { levelFor } from "@/lib/constants";
import { slugify, createRng, hashString, pick } from "@/lib/utils";

/**
 * In-process god store.
 *
 * This is the single source of truth for V1. It is seeded deterministically and
 * exposes a narrow repository-style surface so it can be swapped for the
 * Supabase implementation in lib/database/client.ts without touching callers.
 */

const EMPTY_ATTRS = { order: 0, chaos: 0, greed: 0, love: 0, knowledge: 0 };

interface NewGodInput {
  name: string;
  title: string;
  shortDescription: string;
  personality: string;
  philosophy: string;
  beliefSystem: God["beliefSystem"];
  creationMyth: string;
  symbol: string;
  domain: string;
  origin: God["origin"];
  form: God["form"];
  attributes: God["attributes"];
  commandments: string[];
  firstProphecy: string;
  greeting: string;
  visualPrompt: string;
  creatorWallet: string;
  imageUrl?: string | null;
}

class GodStore {
  private gods = new Map<string, God>();
  private follows = new Set<string>();
  private prayers: Prayer[] = [];
  private prophecies = new Map<string, Prophecy>();
  private activities: ActivityEvent[] = [];
  private worldEvents: WorldEvent[] = [];
  private followersByGod = new Map<string, number>();
  private seq = 0;

  constructor() {
    this.seed();
  }

  private seed() {
    SEED_GODS.forEach((s) => {
      const god = buildGod(s);
      this.gods.set(god.slug, god);
      this.followersByGod.set(god.slug, god.followersCount);
      toPropheciesList(god, s.prophecies).forEach((p) => this.prophecies.set(p.id, p));
    });
    this.worldEvents = SEED_WORLD_EVENTS.map((w, i) => ({
      ...w,
      id: `we-${i}`,
      createdAt: new Date(Date.now() - (SEED_WORLD_EVENTS.length - i) * 6 * 86400000).toISOString(),
    }));
    this.activities = SEED_ACTIVITY.map((a, i) => ({
      ...a,
      id: `act-${i}`,
      createdAt: new Date(Date.now() - (SEED_ACTIVITY.length - i) * 40 * 60000).toISOString(),
    }));
  }

  /* ── Queries ──────────────────────────────────────────────────────────── */

  list(query: GodQuery = {}): God[] {
    let out = [...this.gods.values()];
    const { search, sort, origin, attribute, creatorWallet } = query;

    if (search) {
      const q = search.toLowerCase().trim();
      out = out.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.domain.toLowerCase().includes(q) ||
          g.shortDescription.toLowerCase().includes(q)
      );
    }
    if (origin) out = out.filter((g) => g.origin === origin);
    if (attribute) out = out.filter((g) => g.attributes[attribute] >= 7);
    if (creatorWallet) {
      const w = creatorWallet.toLowerCase();
      out = out.filter((g) => g.creatorWallet.toLowerCase() === w);
    }

    switch (sort) {
      case "new":
        out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        break;
      case "most_followed":
        out.sort((a, b) => b.followersCount - a.followersCount);
        break;
      case "most_prayed":
        out.sort((a, b) => b.prayersCount - a.prayersCount);
        break;
      case "fastest":
        out.sort((a, b) => b.growth - a.growth);
        break;
      case "trending":
        out.sort((a, b) => b.growth * Math.log(b.followersCount + 10) - a.growth * Math.log(a.followersCount + 10));
        break;
      case "order":
      case "chaos":
      case "greed":
      case "love":
      case "knowledge":
        out.sort((a, b) => b.attributes[sort] - a.attributes[sort]);
        break;
      default:
        out.sort((a, b) => b.followersCount - a.followersCount);
    }

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 60;
    return out.slice(offset, offset + limit);
  }

  count(): number {
    return this.gods.size;
  }

  get(idOrSlug: string): God | null {
    return this.gods.get(idOrSlug) ?? this.gods.get(slugify(idOrSlug)) ?? null;
  }

  stats(): GlobalStats {
    const gods = [...this.gods.values()];
    return {
      godsCreated: 12842 + gods.filter((g) => !g.isSeed).length,
      totalFollowers: 1300000 + gods.reduce((s, g) => s + g.followersCount, 0),
      dailyPrayers: 84291,
      countries: 127,
    };
  }

  topByFollowers(n = 10): God[] {
    return [...this.gods.values()].sort((a, b) => b.followersCount - a.followersCount).slice(0, n);
  }

  featured(n = 5): God[] {
    const preferred = ["elysia", "kronos", "nexora", "terra", "valtor"];
    const out: God[] = [];
    for (const p of preferred) {
      const g = this.gods.get(p);
      if (g) out.push(g);
    }
    if (out.length < n) {
      for (const g of this.list({ sort: "trending" })) {
        if (out.length >= n) break;
        if (!out.includes(g)) out.push(g);
      }
    }
    return out.slice(0, n);
  }

  /* ── Creation ─────────────────────────────────────────────────────────── */

  create(input: NewGodInput): God {
    let slug = slugify(input.name) || `god-${Date.now()}`;
    while (this.gods.has(slug)) slug = `${slug}-${(this.seq++).toString(36)}`;

    const attrs = { ...EMPTY_ATTRS, ...input.attributes };
    const dominant = (Object.keys(attrs) as (keyof typeof attrs)[]).sort(
      (a, b) => attrs[b] - attrs[a]
    )[0] as God["dominantAttribute"];
    const secondary = (Object.keys(attrs) as (keyof typeof attrs)[])
      .filter((k) => k !== dominant)
      .sort((a, b) => attrs[b] - attrs[a])[0] as God["secondaryAttribute"];

    const god: God = {
      id: slug,
      slug,
      name: input.name,
      title: input.title,
      shortDescription: input.shortDescription,
      personality: input.personality,
      philosophy: input.philosophy,
      beliefSystem: input.beliefSystem,
      creationMyth: input.creationMyth,
      symbol: input.symbol,
      domain: input.domain,
      origin: input.origin,
      form: input.form,
      attributes: attrs,
      imageUrl: input.imageUrl || this.autoPortrait(slug, input.origin, input.form),
      dominantAttribute: dominant,
      secondaryAttribute: secondary,
      archetype: "",
      divineLevel: levelFor(0),
      followersCount: 0,
      prayersCount: 0,
      propheciesCount: 1,
      growth: 100,
      commandments: input.commandments.slice(0, 10).map((text, i) => ({
        index: i + 1,
        numeral: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][i] ?? String(i + 1),
        text,
      })),
      greeting: input.greeting,
      visualPrompt: input.visualPrompt,
      creatorWallet: input.creatorWallet,
      creatorName: "temple_founder",
      createdAt: new Date().toISOString(),
      isSeed: false,
      relationships: [],
    };

    this.gods.set(slug, god);
    this.followersByGod.set(slug, 0);

    const prophecy: Prophecy = {
      id: `${slug}-p1`,
      godId: slug,
      godName: god.name,
      godSlug: slug,
      number: 1,
      text: input.firstProphecy,
      category: "FIRST WORDS",
      createdAt: god.createdAt,
      reactions: { believe: 0, doubt: 0 },
    };
    this.prophecies.set(prophecy.id, prophecy);

    this.logActivity({
      kind: "GOD_CREATED",
      text: `${god.name} was born — ${god.title}`,
      godSlug: slug,
      wallet: god.creatorWallet,
    });
    this.logWorldEvent({
      type: "GOD_CREATED",
      title: `${god.name} awakens`,
      detail: `${god.title}. Origin: ${god.origin.replace(/_/g, " ")}.`,
      godSlug: slug,
    });
    return god;
  }

  private autoPortrait(slug: string, origin: God["origin"], form: God["form"]): string {
    const rng = createRng(hashString(`${slug}${origin}${form}`));
    const pool = [
      "elysia", "kronos", "nexora", "terra", "valtor", "zephyra",
      "moros", "solara", "nyx", "aether", "thalia", "orion",
    ];
    return `/gods/${pick(rng, pool)}.png`;
  }

  /* ── Social ───────────────────────────────────────────────────────────── */

  follow(godId: string, wallet: string): { ok: boolean; followers: number } {
    const god = this.get(godId);
    if (!god) return { ok: false, followers: 0 };
    const key = `${god.slug}:${wallet.toLowerCase()}`;
    if (this.follows.has(key)) return { ok: false, followers: god.followersCount };
    this.follows.add(key);
    god.followersCount += 1;
    this.gainExperience(god, 5);
    this.logActivity({
      kind: "FOLLOW",
      text: `${short(wallet)} followed ${god.name}`,
      godSlug: god.slug,
      wallet,
    });
    return { ok: true, followers: god.followersCount };
  }

  unfollow(godId: string, wallet: string): boolean {
    const god = this.get(godId);
    if (!god) return false;
    const key = `${god.slug}:${wallet.toLowerCase()}`;
    if (!this.follows.has(key)) return false;
    this.follows.delete(key);
    god.followersCount = Math.max(0, god.followersCount - 1);
    return true;
  }

  hasFollow(godId: string, wallet: string): boolean {
    return this.follows.has(`${slugify(godId)}:${wallet.toLowerCase()}`);
  }

  pray(godId: string, wallet: string, text: string, response: string, isPublic: boolean): Prayer | null {
    const god = this.get(godId);
    if (!god) return null;
    const prayer: Prayer = {
      id: `pr-${Date.now()}-${this.seq++}`,
      godId: god.slug,
      godName: god.name,
      godSlug: god.slug,
      wallet,
      text,
      response,
      isPublic,
      createdAt: new Date().toISOString(),
    };
    this.prayers.unshift(prayer);
    god.prayersCount += 1;
    this.gainExperience(god, 12);
    if (isPublic) {
      this.logActivity({
        kind: "PRAYER",
        text: `${short(wallet)} prayed to ${god.name}`,
        godSlug: god.slug,
        wallet,
      });
    }
    return prayer;
  }

  reactToProphecy(prophecyId: string, kind: "BELIEVE" | "DOUBT"): Prophecy | null {
    const p = this.prophecies.get(prophecyId);
    if (!p) return null;
    if (kind === "BELIEVE") p.reactions.believe += 1;
    else p.reactions.doubt += 1;
    const god = this.get(p.godSlug);
    if (god) this.gainExperience(god, 2);
    return p;
  }

  saveProphecy(prophecyId: string, wallet: string): boolean {
    const key = `saved:${prophecyId}:${wallet.toLowerCase()}`;
    if ((this.saved as Set<string> | undefined)?.has?.(key)) return false;
    (this.saved ??= new Set<string>()).add(key);
    return true;
  }
  private saved?: Set<string>;
  isProphecySaved(prophecyId: string, wallet: string): boolean {
    return (this.saved as Set<string> | undefined)?.has?.(`saved:${prophecyId}:${wallet.toLowerCase()}`) ?? false;
  }
  listSavedProphecies(wallet: string): Prophecy[] {
    const s = (this.saved as Set<string> | undefined) ?? new Set<string>();
    const out: Prophecy[] = [];
    for (const v of s.values()) {
      if (!v.endsWith(`:${wallet.toLowerCase()}`)) continue;
      const pid = v.split(":")[1];
      const p = this.prophecies.get(pid);
      if (p) out.push(p);
    }
    return out;
  }

  /* ── Feeds ────────────────────────────────────────────────────────────── */

  listProphecies(godId?: string, limit = 30): Prophecy[] {
    const all = [...this.prophecies.values()]
      .filter((p) => !godId || p.godSlug === slugify(godId))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return all.slice(0, limit);
  }

  listPublicPrayers(godId?: string, limit = 24): Prayer[] {
    return this.prayers
      .filter((p) => p.isPublic && (!godId || p.godSlug === slugify(godId)))
      .slice(0, limit);
  }

  listPrayersByWallet(wallet: string, limit = 50): Prayer[] {
    return this.prayers.filter((p) => p.wallet.toLowerCase() === wallet.toLowerCase()).slice(0, limit);
  }

  activity(limit = 12): ActivityEvent[] {
    return this.activities.slice(0, limit);
  }

  worldHistory(limit = 40): WorldEvent[] {
    return this.worldEvents.slice(0, limit);
  }

  private logActivity(e: Omit<ActivityEvent, "id" | "createdAt">) {
    this.activities.unshift({ ...e, id: `act-${this.seq++}`, createdAt: new Date().toISOString() });
    if (this.activities.length > 60) this.activities.length = 60;
  }

  logWorldEvent(e: Omit<WorldEvent, "id" | "createdAt">) {
    this.worldEvents.unshift({ ...e, id: `we-${this.seq++}`, createdAt: new Date().toISOString() });
    if (this.worldEvents.length > 80) this.worldEvents.length = 80;
  }

  private gainExperience(god: God, amount: number) {
    const exp = god.divineLevel.experience + amount;
    god.divineLevel = levelFor(exp);
    if (god.followersCount > 0 && god.followersCount % 10000 === 0) {
      this.logWorldEvent({
        type: "FOLLOWER_MILESTONE",
        title: `${god.name} reaches ${god.followersCount.toLocaleString("en-US")} followers`,
        detail: `${god.name}'s temple grows. Divine level ${god.divineLevel.level} — ${god.divineLevel.title}.`,
        godSlug: god.slug,
      });
    }
  }
}

function short(w: string): string {
  return w.length > 12 ? `${w.slice(0, 6)}...${w.slice(-4)}` : w;
}

function toPropheciesList(
  god: God,
  list: { text: string; category: string; daysAgo: number; believe: number; doubt: number }[]
): Prophecy[] {
  return list.map((p, i) => ({
    id: `${god.slug}-p${i + 1}`,
    godId: god.slug,
    godName: god.name,
    godSlug: god.slug,
    number: 1000 + i * 37 + (Math.abs(hashString(god.slug)) % 400),
    text: p.text,
    category: p.category,
    createdAt: new Date(Date.now() - p.daysAgo * 86400000).toISOString(),
    reactions: { believe: p.believe, doubt: p.doubt },
  }));
}

const SEED_ACTIVITY: Omit<ActivityEvent, "id" | "createdAt">[] = [
  { kind: "GOD_CREATED", text: "0xA3...7F created a new God", wallet: "0xA3f19c4E7b2D5a8F0c6e1B9d4a7F3e2C5b8D1a6E", godSlug: "orion" },
  { kind: "FOLLOW", text: "mooncat followed Elysia", godSlug: "elysia" },
  { kind: "PRAYER", text: "0x91...2D prayed to Kronos", wallet: "0x91b7E2a4C6f0D8b3A5e9C1d7F4a2B6c8E0d3A5f7", godSlug: "kronos" },
  { kind: "PROPHECY", text: "A prophecy was published by Nexora", godSlug: "nexora" },
  { kind: "FOLLOW", text: "voidpriest followed Nyx", godSlug: "nyx" },
  { kind: "PRAYER", text: "0x7D...A4 prayed to Aether", wallet: "0x7D2c9E1aB4f6C8d0A3e5B7c9F1d2A4b6C8e0F2a4", godSlug: "aether" },
  { kind: "MILESTONE", text: "Elysia passed 248,000 followers", godSlug: "elysia" },
  { kind: "GOD_CREATED", text: "0x5E...F9 created a new God", wallet: "0x5E9a2C8d4F1b6A3c7E0d9B2f5A8c1D4e7B0a3C6f9", godSlug: "thalia" },
  { kind: "PROPHECY", text: "A prophecy was published by Moros", godSlug: "moros" },
  { kind: "FOLLOW", text: "bellringer followed Solara", godSlug: "solara" },
  { kind: "PRAYER", text: "0x2C...E2 prayed to Zephyra", wallet: "0x2C7b4E9a1D6f3B8c0A5e2D7f4B9c1E6a3D8f0B5e2", godSlug: "zephyra" },
  { kind: "MILESTONE", text: "Aether reached Divine Level 10 — WORSHIPPED", godSlug: "aether" },
];

const SEED_WORLD_EVENTS: Omit<WorldEvent, "id" | "createdAt">[] = [
  { type: "GOD_CREATED", title: "Elysia awakens", detail: "Goddess of Love & Harmony. Origin: THE STARS.", godSlug: "elysia" },
  { type: "GOD_CREATED", title: "Kronos awakens", detail: "God of Chaos & Destruction. Origin: THE VOID.", godSlug: "kronos" },
  { type: "RIVALRY", title: "Kronos opposes Valtor", detail: "The first declared opposition in the divine record. Order answered with silence.", godSlug: "kronos" },
  { type: "ALLIANCE", title: "Elysia and Nexora form an alliance", detail: "Mercy and knowledge, formally bound.", godSlug: "elysia" },
  { type: "PROPHECY", title: "Nexora publishes the Machine Prophecy", detail: "\"Humanity will divide between those who command machines and those commanded by them.\"", godSlug: "nexora" },
  { type: "FOLLOWER_MILESTONE", title: "Elysia reaches 100,000 followers", detail: "The first temple to reach six figures.", godSlug: "elysia" },
  { type: "MAJOR_PRAYER", title: "A single prayer to Aether is read 40,000 times", detail: "\"Will the machine remember me?\" — the answer is now part of the archive.", godSlug: "aether" },
  { type: "BELIEF_EVOLUTION", title: "Terra revises her view of conflict", detail: "Winter is no longer described as a season of loss but as a season of rest.", godSlug: "terra" },
  { type: "WORLD_EVENT", title: "The Multiverse Concord is declared", detail: "Twelve gods agree to disagree, in writing, for the first time." },
];

/**
 * Next.js compiles route handlers and pages into separate module graphs in
 * development. A module-level `new GodStore()` therefore creates isolated
 * archives: `/api/generate-god` can create a god that `/god/[id]` cannot see.
 * Keep one store on the Node process global so every server entry point uses
 * the same archive (and so Fast Refresh does not erase newly-created gods).
 */
const globalStore = globalThis as typeof globalThis & {
  __aiGodStore?: GodStore;
};

export const store = globalStore.__aiGodStore ?? new GodStore();
globalStore.__aiGodStore = store;
