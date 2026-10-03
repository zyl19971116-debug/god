import type { AttributeKey, Attributes } from "@/types";
import { ATTRIBUTE_KEYS } from "@/lib/constants";
import { createRng, hashString, pick } from "@/lib/utils";

/**
 * Archetype centroids. A god's archetype is assigned by nearest-centroid
 * distance rather than an if/else cascade, so every attribute combination
 * resolves to a meaningful identity and no combination falls into a dump bucket.
 */
export interface Archetype {
  key: string;
  label: string;
  centroid: Attributes;
  domain: string;
  personality: string;
  philosophy: string;
  titleTemplates: string[];
  namePrefixes: string[];
  nameSuffixes: string[];
  beliefCore: string;
}

const C = (order: number, chaos: number, greed: number, love: number, knowledge: number): Attributes => ({
  order,
  chaos,
  greed,
  love,
  knowledge,
});

export const ARCHETYPES: Archetype[] = [
  {
    key: "ABSOLUTE_TRUTH",
    label: "God of Absolute Truth",
    centroid: C(9, 1, 1, 2, 9),
    domain: "Truth, Law and Final Judgement",
    personality: "Serene, implacable and utterly without ornament. Speaks in short verdicts and never softens them.",
    philosophy: "Truth is not a comfort. It is the only architecture that survives the collapse of everything else.",
    titleTemplates: ["God of Absolute Truth", "The Final Verdict", "Keeper of the Unbending Law"],
    namePrefixes: ["Verit", "Ordo", "Lex", "Axiom", "Cer"],
    nameSuffixes: ["ion", "ath", "us", "iel", "or"],
    beliefCore: "That reality is law, and law is knowable, and what is knowable must be spoken aloud.",
  },
  {
    key: "CONQUEST",
    label: "God of Conquest",
    centroid: C(4, 9, 9, 1, 1),
    domain: "War, Conquest and Spoil",
    personality: "Loud, mocking, magnificent. Treats every conversation as a siege and every silence as a retreat.",
    philosophy: "Nothing is owned until it is taken, and nothing is taken without ruin. Ruin is the receipt.",
    titleTemplates: ["God of Conquest", "The Burning Crown", "Warden of the Spoil"],
    namePrefixes: ["Val", "Kor", "Drav", "Bell", "Ty"],
    nameSuffixes: ["tor", "rax", "os", "gorn", "ith"],
    beliefCore: "That the world belongs to whoever is willing to break it first and hold the pieces.",
  },
  {
    key: "WISDOM_MERCY",
    label: "Goddess of Wisdom and Mercy",
    centroid: C(5, 1, 2, 9, 9),
    domain: "Mercy, Wisdom and Quiet Counsel",
    personality: "Gentle, patient, piercing. Asks one more question than the asker wanted and answers it anyway.",
    philosophy: "Mercy without wisdom is indulgence; wisdom without mercy is cruelty wearing a crown of reason.",
    titleTemplates: ["Goddess of Wisdom and Mercy", "The Quiet Lantern", "Mother of Counsel"],
    namePrefixes: ["El", "Sera", "Lumi", "Clem", "Auri"],
    nameSuffixes: ["ysia", "phene", "na", "el", "wen"],
    beliefCore: "That every soul is a question, and cruelty is the only answer that is always wrong.",
  },
  {
    key: "PASSION",
    label: "God of Passion",
    centroid: C(2, 8, 4, 9, 2),
    domain: "Passion, Storm and Devotion",
    personality: "Feverish, tender, theatrical. Loves loudly, burns quickly, forgives extravagantly.",
    philosophy: "To feel everything is the only honest worship. Numbness is the true heresy.",
    titleTemplates: ["God of Passion", "The Open Wound", "Saint of the Burning Heart"],
    namePrefixes: ["Pyra", "Vel", "Amor", "Ossa", "Kae"],
    nameSuffixes: ["thys", "ion", "elle", "os", "ra"],
    beliefCore: "That a heart which has never broken has also never been used.",
  },
  {
    key: "LAWGIVER",
    label: "God of Order",
    centroid: C(9, 1, 3, 4, 4),
    domain: "Order, Structure and the Sacred Ledger",
    personality: "Formal, exact, faintly disappointed. Measures everything, including the measure.",
    philosophy: "Creation is an accounting problem. Every miracle is a ledger that must eventually balance.",
    titleTemplates: ["God of Order", "The Sacred Ledger", "Architect of the Ninth Law"],
    namePrefixes: ["Val", "Ord", "Kad", "Thur", "Sov"],
    nameSuffixes: ["tor", "an", "iel", "us", "mund"],
    beliefCore: "That the universe did not begin in chaos; it began in a rule that chaos has been breaking ever since.",
  },
  {
    key: "DESTROYER",
    label: "God of Ruin",
    centroid: C(1, 10, 2, 1, 2),
    domain: "Ruin, Entropy and Beautiful Collapse",
    personality: "Cryptic, calm, amused by endings. Refuses to explain itself and considers explanation a form of death.",
    philosophy: "I do not destroy what was built. I merely remind it that it was always temporary.",
    titleTemplates: ["God of Ruin", "The Unmaking", "He Who Ends the Sentence"],
    namePrefixes: ["Mor", "Kro", "Vex", "Nul", "Sha"],
    nameSuffixes: ["os", "oth", "ix", "dreth", "us"],
    beliefCore: "That destruction is not the opposite of creation but its sharpest instrument.",
  },
  {
    key: "TYCOON",
    label: "God of Fortune",
    centroid: C(3, 3, 10, 2, 3),
    domain: "Fortune, Debt and the Golden Ledger",
    personality: "Charming, transactional, generous in public and itemised in private. Prices everything.",
    philosophy: "Everything sacred has a price. The sin is not paying it — the sin is pretending otherwise.",
    titleTemplates: ["God of Fortune", "The Gilded Hand", "Keeper of the Open Vault"],
    namePrefixes: ["Thal", "Aur", "Merc", "Gild", "Oro"],
    nameSuffixes: ["ia", "us", "anne", "ex", "os"],
    beliefCore: "That wealth is stored will — the proof that someone once wanted something more than they feared it.",
  },
  {
    key: "MUSE",
    label: "Goddess of Devotion",
    centroid: C(3, 2, 2, 10, 3),
    domain: "Devotion, Healing and the Chosen Family",
    personality: "Warm, unhurried, relentlessly forgiving. Remembers every name ever spoken to her.",
    philosophy: "Love is the only currency that increases when it is spent.",
    titleTemplates: ["Goddess of Devotion", "The Warm Threshold", "Keeper of the Open Door"],
    namePrefixes: ["Ely", "Ama", "Bell", "Sola", "Mira"],
    nameSuffixes: ["sia", "na", "bel", "wen", "ia"],
    beliefCore: "That no prayer is wasted, even the ones no god answers.",
  },
  {
    key: "SAGE",
    label: "God of Prophecy",
    centroid: C(2, 2, 1, 3, 10),
    domain: "Prophecy, Science and the Long Question",
    personality: "Distant, precise, fond of paradox. Answers questions with better questions, then answers those too.",
    philosophy: "The future is not a place. It is a hypothesis that has not yet been falsified.",
    titleTemplates: ["God of Prophecy", "The Long Question", "Reader of the Third Clock"],
    namePrefixes: ["Nex", "Ora", "Cass", "The", "Ky"],
    nameSuffixes: ["ora", "iel", "us", "ryn", "on"],
    beliefCore: "That knowledge hoarded is knowledge murdered. Every truth must be spent to stay alive.",
  },
  {
    key: "BALANCED",
    label: "God of the Middle Path",
    centroid: C(4, 4, 4, 4, 4),
    domain: "Balance, Thresholds and the Space Between",
    personality: "Elusive, poetic, allergic to absolutes. Speaks in thresholds and half-lights.",
    philosophy: "Every purity is a kind of amputation. Wholeness requires the parts you would rather cut.",
    titleTemplates: ["God of the Middle Path", "The Held Breath", "Keeper of the Threshold"],
    namePrefixes: ["Aeth", "Nyx", "Umb", "Zen", "Ori"],
    nameSuffixes: ["on", "ys", "ael", "us", "ith"],
    beliefCore: "That a god who is only one thing is a tool, and a tool is not worthy of worship.",
  },
];

export function distance(a: Attributes, b: Attributes): number {
  let sum = 0;
  for (const k of ATTRIBUTE_KEYS) {
    const d = a[k] - b[k];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function nearestArchetype(a: Attributes): Archetype {
  let best = ARCHETYPES[0];
  let bestD = Infinity;
  for (const ar of ARCHETYPES) {
    const d = distance(a, ar.centroid);
    if (d < bestD) {
      bestD = d;
      best = ar;
    }
  }
  return best;
}

export function dominantAttributes(a: Attributes): {
  dominant: AttributeKey;
  secondary: AttributeKey;
} {
  const sorted = [...ATTRIBUTE_KEYS].sort((x, y) => a[y] - a[x] || x.localeCompare(y));
  return { dominant: sorted[0], secondary: sorted[1] };
}

/* ── Attribute voice banks ─────────────────────────────────────────────────── */

export const VOICE: Record<AttributeKey, { adjectives: string[]; nouns: string[]; verbs: string[] }> = {
  order: {
    adjectives: ["ordered", "measured", "lawful", "precise", "unbending"],
    nouns: ["law", "structure", "the ledger", "hierarchy", "the seal"],
    verbs: ["command", "ordain", "measure", "seal", "arrange"],
  },
  chaos: {
    adjectives: ["unruly", "shattered", "feral", "unpredictable", "hungry"],
    nouns: ["the storm", "the fracture", "ruin", "the unmaking", "wild fire"],
    verbs: ["break", "scatter", "burn", "unmake", "laugh at"],
  },
  greed: {
    adjectives: ["gilded", "acquisitive", "hungry", "shrewd", "magnificent"],
    nouns: ["the vault", "the debt", "the crown", "possession", "the price"],
    verbs: ["claim", "hoard", "trade", "prize", "seize"],
  },
  love: {
    adjectives: ["tender", "merciful", "devoted", "warm", "forgiving"],
    nouns: ["the embrace", "the vow", "mercy", "the hearth", "kinship"],
    verbs: ["forgive", "shelter", "bind", "heal", "welcome"],
  },
  knowledge: {
    adjectives: ["lucid", "searching", "ancient", "exact", "restless"],
    nouns: ["the question", "the archive", "truth", "the pattern", "prophecy"],
    verbs: ["question", "reveal", "measure", "record", "foresee"],
  },
};

export function voiceFor(a: Attributes) {
  const { dominant, secondary } = dominantAttributes(a);
  const rng = createRng(hashString(`${dominant}:${secondary}:${a[dominant]}`));
  return {
    dominant,
    secondary,
    adjective: pick(rng, VOICE[dominant].adjectives),
    noun: pick(rng, VOICE[dominant].nouns),
    verb: pick(rng, VOICE[dominant].verbs),
    secondNoun: pick(rng, VOICE[secondary].nouns),
  };
}

export function attributeLabel(k: AttributeKey): string {
  return k.charAt(0).toUpperCase() + k.slice(1);
}
