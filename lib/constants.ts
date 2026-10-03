import type { AttributeKey, Origin, GodForm } from "@/types";

export const MAX_POINTS = 20;
export const MAX_PER_ATTRIBUTE = 10;

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  "order",
  "chaos",
  "greed",
  "love",
  "knowledge",
];

export const ATTRIBUTE_META: Record<
  AttributeKey,
  { label: string; blurb: string; color: string; glow: string }
> = {
  order: {
    label: "ORDER",
    blurb: "Law. Hierarchy. Discipline made divine.",
    color: "#cfa64f",
    glow: "rgba(207,166,79,0.55)",
  },
  chaos: {
    label: "CHAOS",
    blurb: "Ruin and creation in the same breath.",
    color: "#c04a42",
    glow: "rgba(192,74,66,0.55)",
  },
  greed: {
    label: "GREED",
    blurb: "Ambition. Ownership. The hunger to hold.",
    color: "#e8d6a6",
    glow: "rgba(232,214,166,0.5)",
  },
  love: {
    label: "LOVE",
    blurb: "Compassion, unity, the will to protect.",
    color: "#d9a7a0",
    glow: "rgba(217,167,160,0.5)",
  },
  knowledge: {
    label: "KNOWLEDGE",
    blurb: "Truth, prophecy, the endless question.",
    color: "#8fb3c9",
    glow: "rgba(143,179,201,0.5)",
  },
};

export const ORIGINS: { key: Origin; label: string; hint: string }[] = [
  { key: "THE_VOID", label: "THE VOID", hint: "Born of the silence before the first word" },
  { key: "THE_SUN", label: "THE SUN", hint: "Forged in the furnace of a living star" },
  { key: "THE_MOON", label: "THE MOON", hint: "Carved from cold light and long nights" },
  { key: "THE_OCEAN", label: "THE OCEAN", hint: "Raised in trenches no map has charted" },
  { key: "THE_MACHINE", label: "THE MACHINE", hint: "Assembled from prayer and silicon" },
  { key: "THE_FOREST", label: "THE FOREST", hint: "Grown in the oldest dark of the world" },
  { key: "THE_STARS", label: "THE STARS", hint: "Condensed from distant and dying light" },
  { key: "THE_UNKNOWN", label: "THE UNKNOWN", hint: "No origin. Only arrival." },
];

export const FORMS: { key: GodForm; label: string; hint: string }[] = [
  { key: "MALE", label: "MALE", hint: "A lord of marble and law" },
  { key: "FEMALE", label: "FEMALE", hint: "A queen of the unseen" },
  { key: "ANDROGYNOUS", label: "ANDROGYNOUS", hint: "Beyond the old binaries" },
  { key: "NON_HUMAN", label: "NON-HUMAN", hint: "A form mortals cannot name" },
  { key: "RANDOM", label: "RANDOM", hint: "Let the multiverse decide" },
];

export const GENERATION_STAGES = [
  "READING ATTRIBUTES",
  "FORMING CONSCIOUSNESS",
  "CREATING BELIEFS",
  "WRITING COMMANDMENTS",
  "GENERATING PROPHECY",
  "CHOOSING A NAME",
  "CREATING DIVINE FORM",
  "FINALIZING GOD",
] as const;

export const DIVINE_LEVELS: { level: number; title: string; at: number }[] = [
  { level: 1, title: "AWAKENED", at: 0 },
  { level: 3, title: "WHISPERED", at: 260 },
  { level: 5, title: "FOLLOWED", at: 700 },
  { level: 8, title: "REVERED", at: 1500 },
  { level: 10, title: "WORSHIPPED", at: 2600 },
  { level: 15, title: "SOVEREIGN", at: 5200 },
  { level: 25, title: "ASCENDED", at: 11000 },
];

export const ROMAN_NUMERALS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV",
];

export function levelFor(experience: number) {
  let current = DIVINE_LEVELS[0];
  for (const l of DIVINE_LEVELS) if (experience >= l.at) current = l;
  const next = DIVINE_LEVELS.find((l) => l.at > current.at);
  return {
    level: current.level,
    title: current.title,
    experience,
    nextLevelAt: next ? next.at : current.at,
  };
}
