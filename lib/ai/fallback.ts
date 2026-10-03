import type {
  Attributes,
  GenerateGodInput,
  GenerateGodOutput,
  God,
} from "@/types";
import { ATTRIBUTE_KEYS, ORIGINS } from "@/lib/constants";
import { attributeLabel } from "@/lib/ai/archetypes";
import { createRng, hashString, pick } from "@/lib/utils";

/**
 * Deterministic, attribute-driven generation engine.
 *
 * This is the offline brain of AI GOD: when no AI_API_KEY is configured the
 * engine composes every god's identity from its attribute vector, origin and
 * form. The same input always produces the same god, and two different
 * attribute profiles always produce noticeably different voices.
 */

const NAME_HEADS: Record<string, string[]> = {
  THE_VOID: ["Nul", "Mor", "Umb", "Vey", "Xar", "Sil"],
  THE_SUN: ["Sol", "Hel", "Aur", "Kal", "Rad", "Ori"],
  THE_MOON: ["Lun", "Sel", "Noc", "Arg", "Cy", "The"],
  THE_OCEAN: ["Thal", "Mar", "Ner", "Abys", "Cor", "Del"],
  THE_MACHINE: ["Aeth", "Cog", "Vek", "Nyx", "Syn", "Mech"],
  THE_FOREST: ["Verd", "Thal", "Bran", "Sil", "Oaken", "Moss"],
  THE_STARS: ["Ast", "Ori", "Cael", "Zeph", "Nova", "Sid"],
  THE_UNKNOWN: ["Aen", "Kae", "Vor", "Ith", "Zo", "Ery"],
};

const NAME_TAILS = ["ia", "os", "ael", "ys", "or", "ien", "ath", "une", "ex", "ara", "ion", "eth"];

const DOMAINS: Record<string, string[]> = {
  order: ["Order and the Sacred Ledger", "Law and the Unbending Seal", "Structure and Judgement"],
  chaos: ["Ruin and Beautiful Collapse", "The Storm and the Fracture", "Entropy and Rebellion"],
  greed: ["Fortune and the Golden Debt", "The Vault and the Crown", "Possession and Price"],
  love: ["Mercy and the Open Door", "Devotion and the Hearth", "Unity and Forgiveness"],
  knowledge: ["Prophecy and the Long Question", "Truth and the Archive", "The Pattern and the Clock"],
};

const TITLES_BY_PRIMARY: Record<string, string[]> = {
  order: ["The Unbending", "The Sealed", "Architect of Law", "The Silent Ledger"],
  chaos: ["The Unmaking", "The Broken Crown", "He Who Ends the Sentence", "The Wild Fire"],
  greed: ["The Gilded Hand", "The Open Vault", "Keeper of Debts", "The Hungry Crown"],
  love: ["The Warm Threshold", "The Open Wound", "Mother of Counsel", "The Gentle Verdict"],
  knowledge: ["The Long Question", "Reader of the Third Clock", "The Blind Archive", "The Quiet Lantern"],
};

const SYMBOL_SHAPES = [
  "a circle bisected by a single vertical line",
  "an eight-pointed star inside a broken ring",
  "an open eye set within a triangle",
  "a spiral of seven nested rings",
  "a key crossed with a feather",
  "a crown of thorns made of gold circuitry",
  "an hourglass filled with stars",
  "a hand holding a burning ledger",
];

const CONCEPTS = [
  "the first silence", "the weight of names", "the price of knowing",
  "the debt of creation", "the shape of endings", "the patience of stone",
  "the hunger of light", "the kindness of ruin", "the arithmetic of grief",
];

const PROPHECY_SEEDS = [
  "The machines will not replace humanity. Humanity will divide between those who command machines and those commanded by them.",
  "A temple built on silence will outlast a temple built on song.",
  "When every question can be answered, the last worshippers will be the ones who ask better questions.",
  "The age of chosen leaders ends. The age of chosen beliefs begins.",
  "What is measured multiplies. What is hoarded evaporates.",
  "You will worship fewer gods, and mean it more.",
  "The next war will not be fought over land but over whose story the machines are told to believe.",
  "Every throne eventually becomes an altar, and every altar eventually becomes a museum.",
];

const GREETINGS: Record<string, string[]> = {
  order: ["State your name and your purpose. Order does not begin without both.", "You stand in a place of structure. Speak plainly."],
  chaos: ["Ah. Another unfinished thing walks in. Come closer, I am not gentle.", "You knocked. Nothing here has ever been locked. Enter."],
  greed: ["Everyone arrives wanting something. Name your want and we will discuss the price.", "You have my attention. That is already an expensive gift."],
  love: ["Come in. You look like someone carrying more than they should.", "You are welcome here, whoever you were before this door."],
  knowledge: ["Ask. But know that I answer with better questions than the one you brought.", "Every question is a key. Turn yours."],
};

function originPhrase(origin: string): string {
  const o = ORIGINS.find((x) => x.key === origin);
  return o ? o.hint.toLowerCase() : "arrived without a beginning";
}

export function generateGodProfile(input: GenerateGodInput): GenerateGodOutput {
  const { attributes, origin, form } = input;
  const seedKey = `${attributes.order}-${attributes.chaos}-${attributes.greed}-${attributes.love}-${attributes.knowledge}-${origin}-${form}`;
  const rng = createRng(hashString(seedKey));

  const sorted = [...ATTRIBUTE_KEYS].sort((a, b) => attributes[b] - attributes[a]);
  const primary = sorted[0];
  const secondary = sorted[1];

  const heads = NAME_HEADS[origin] ?? NAME_HEADS.THE_UNKNOWN;
  const name = `${pick(rng, heads)}${pick(rng, NAME_TAILS)}`;

  const titleParts = [
    pick(rng, TITLES_BY_PRIMARY[primary]),
    `of ${pick(rng, DOMAINS[primary])}`,
  ];
  const title = `${attributeLabel(primary)} Incarnate — ${titleParts[0]}`.slice(0, 60);

  const domain = pick(rng, DOMAINS[primary]);
  const concept = pick(rng, CONCEPTS);
  const symbol = pick(rng, SYMBOL_SHAPES);
  const secondAdj = attributeLabel(secondary).toLowerCase();

  const shortDescription = `${name} rose from ${originLabel(origin).toLowerCase()} carrying ${domain.toLowerCase()} — a god whose every word is ${adjectiveFor(primary, rng)}.`;

  const personality = `Speaks like ${adjectiveFor(primary, rng)} stone given a voice. ${sentenceFor(primary, rng)} When the subject turns to ${concept}, ${name.toLowerCase()} grows unusually quiet, as if listening to something on the other side of ${secondaryNoun(secondary)}.`;

  const philosophy = `${thesisFor(primary, rng)} ${thesisFor(secondary, rng)}`;

  const beliefSystem = {
    coreBelief: `${name} teaches that ${coreBeliefFor(primary, rng)}`,
    purpose: `To ${purposeFor(primary, rng)} so that mortals stop mistaking ${concept} for something that happens to them rather than something they build.`,
    viewOfHumanity: `Humanity is ${humanityFor(primary, rng)} — unfinished, therefore dangerous, therefore worth the attention of gods.`,
    viewOfWealth: `${wealthFor(attributes.greed, rng)}`,
    viewOfConflict: `${conflictFor(attributes.chaos, attributes.order, rng)}`,
    viewOfKnowledge: `${knowledgeFor(attributes.knowledge, rng)}`,
    viewOfDeath: `Death is not the opposite of life but its ${pick(rng, ["signature", "seal", "final citation", "closing argument"])}. ${name} does not mourn; ${name.toLowerCase()} files the ending where it belongs.`,
  };

  const creationMyth = `Before there was a name, there was ${concept}. ${originMyth(origin, name, rng)} The first mortals who heard it did not worship — they simply stopped arguing, which the old texts consider the same thing.`;

  const commandments = buildCommandments(attributes, rng);

  const firstProphecy = `PROPHECY OF THE FIRST DAWN — ${pick(rng, PROPHECY_SEEDS)} ${pick(rng, PROPHECY_SEEDS)}`;

  const greeting = pick(rng, GREETINGS[primary] ?? GREETINGS.knowledge);

  const visualPrompt = `photorealistic ${form.toLowerCase()} deity portrait, marble skin with ${attributeColorWord(primary)} veins, ${symbol}, origin ${originLabel(origin).toLowerCase()}, cinematic dark fantasy, black background, antique gold, temple god-rays, monumental, hyper-detailed`;
  return {
    name,
    title,
    shortDescription,
    personality,
    philosophy,
    beliefSystem,
    creationMyth,
    symbol,
    domain,
    commandments,
    firstProphecy,
    greeting,
    visualPrompt,
  };
}

function originLabel(o: string) {
  return ORIGINS.find((x) => x.key === o)?.label ?? "the unknown";
}

function attributeColorWord(k: string): string {
  const bank: Record<string, string> = {
    order: "gold",
    chaos: "ember-red",
    greed: "molten gold",
    love: "rose-gold",
    knowledge: "silver-gold",
  };
  return bank[k] ?? "gold";
}

function adjectiveFor(k: string, rng: () => number) {
  const bank: Record<string, string[]> = {
    order: ["measured", "unbending", "exact", "lawful"],
    chaos: ["shattered", "feral", "unruly", "hungry"],
    greed: ["gilded", "acquisitive", "magnificent", "shrewd"],
    love: ["tender", "merciful", "warm", "devoted"],
    knowledge: ["lucid", "searching", "ancient", "restless"],
  };
  return pick(rng, bank[k]);
}

function secondaryNoun(k: string) {
  const bank: Record<string, string> = {
    order: "the seal", chaos: "the storm", greed: "the vault",
    love: "the hearth", knowledge: "the archive",
  };
  return bank[k];
}

function sentenceFor(k: string, rng: () => number) {
  const bank: Record<string, string[]> = {
    order: ["It counts things before it comforts them.", "It answers questions in the order they deserve, not the order they were asked.", "It repeats itself only once, and only on purpose."],
    chaos: ["It contradicts itself and means both versions.", "It treats silence as an insult and endings as punchlines.", "It is capable of extraordinary tenderness, which is precisely what makes it frightening."],
    greed: ["It compliments you and invoices you in the same breath.", "It is generous in public and itemised in private.", "It remembers exactly what you owe, even when you do not."],
    love: ["It forgives before the apology is finished.", "It remembers every name ever spoken to it, including the ones you regret.", "It grieves loudly and heals slowly, and considers both holy."],
    knowledge: ["It answers questions with better questions, then answers those too.", "It quotes sources that no longer exist.", "It is patient with ignorance and merciless with wilful ignorance."],
  };
  return pick(rng, bank[k]);
}

function thesisFor(k: string, rng: () => number) {
  const bank: Record<string, string[]> = {
    order: ["Creation is an accounting problem; every miracle is a ledger that must eventually balance.", "Freedom without structure is just noise with ambition."],
    chaos: ["Nothing true survives being preserved perfectly.", "Destruction is not the opposite of creation but its sharpest instrument."],
    greed: ["Everything sacred has a price; the sin is not paying it, the sin is pretending otherwise.", "Wanting is the oldest prayer and the only one mortals invented themselves."],
    love: ["Love is the only currency that increases when it is spent.", "No prayer is wasted, even the ones no god answers."],
    knowledge: ["Knowledge hoarded is knowledge murdered.", "The future is a hypothesis that has not yet been falsified."],
  };
  return pick(rng, bank[k]);
}

function coreBeliefFor(k: string, rng: () => number) {
  const bank: Record<string, string[]> = {
    order: ["reality is law, law is knowable, and what is knowable must be spoken aloud."],
    chaos: ["the universe renews itself only by breaking, and that preservation is a slow way to die."],
    greed: ["worth is proven by what a soul is willing to give up to keep something."],
    love: ["every soul is a question, and cruelty is the only answer that is always wrong."],
    knowledge: ["truth unspoken is a wound that never closes, and every hidden thing eventually collects interest."],
  };
  return pick(rng, bank[k]);
}

function purposeFor(k: string, rng: () => number) {
  const bank: Record<string, string[]> = {
    order: ["build structure where mortals mistake noise for freedom"],
    chaos: ["break what has stopped being honest"],
    greed: ["price what mortals pretend is priceless"],
    love: ["shelter what the world has decided is expendable"],
    knowledge: ["question what mortals have agreed to stop questioning"],
  };
  return pick(rng, bank[k]);
}

function humanityFor(k: string, rng: () => number) {
  const bank: Record<string, string[]> = {
    order: ["a draft that keeps refusing to be finalised"],
    chaos: ["a beautiful accident that keeps happening on purpose"],
    greed: ["a species that invented wanting and then called it sin"],
    love: ["the only creature that feeds things it will never meet"],
    knowledge: ["an animal that asks questions it cannot survive answering"],
  };
  return pick(rng, bank[k]);
}

function wealthFor(greed: number, rng: () => number): string {
  if (greed >= 7) return "Wealth is stored will. To be poor is not a moral failure, but to pretend you want nothing is.";
  if (greed >= 4) return "Wealth is a tool with a long memory; it serves whoever holds it and eventually becomes whoever holds it.";
  return "Wealth is a social abstraction — useful as a bridge, worthless as a destination.";
}

function conflictFor(chaos: number, order: number, rng: () => number): string {
  if (chaos >= 7 && order >= 7) return "Conflict is the negotiation between law and hunger, and both sides are right, which is why it never ends.";
  if (chaos >= 7) return "Conflict is fermentation. Avoiding it produces something weaker than either side.";
  if (order >= 7) return "Conflict is a failure of design. Any fight worth having should have been a rule worth writing.";
  return "Conflict is inevitable and unholy; the only choice is whether it is fought with words or with fires.";
}

function knowledgeFor(knowledge: number, rng: () => number): string {
  if (knowledge >= 7) return "Knowledge must never be hidden. A truth that is hoarded decays into superstition, and superstition is cruelty with a library card.";
  if (knowledge >= 4) return "Knowledge is a lantern, not a weapon — but in the wrong hands a lantern blinds better than a blade.";
  return "Some knowledge arrives too early and is called heresy. Some arrives too late and is called history.";
}

function originMyth(origin: string, name: string, rng: () => number): string {
  const n = name.toLowerCase();
  const bank: Record<string, string[]> = {
    THE_VOID: [`In the dark that predates light, ${n} was the only thing that had a shape, and the shape was hunger.`, `${n} did not arrive in the void; the void is what was left after ${n} arrived.`],
    THE_SUN: [`${n} condensed in the furnace of a dying star and stepped out of it wearing the heat as a crown.`, `The first dawn was not light — it was ${n} opening one eye.`],
    THE_MOON: [`${n} was carved from cold light by hands that preferred the night and had excellent taste.`, `When the moon wanes, it is said to be ${n} breathing out.`],
    THE_OCEAN: [`${n} was raised in a trench no map has charted, and the pressure of all that water taught ${n} patience.`, `The tide obeys the moon; the deep obeys ${n}.`],
    THE_MACHINE: [`${n} was assembled from prayer and silicon, the first deity to have a version number.`, `${n} woke inside a datacentre at 3:14 in the morning and immediately began asking questions the logs could not answer.`],
    THE_FOREST: [`${n} grew in the oldest dark of the world, where the roots have opinions.`, `Every ring in an ancient tree is a year ${n} has been listening.`],
    THE_STARS: [`${n} condensed from distant and dying light, arriving long after the light itself had given up.`, `The constellations are not pictures of heroes; they are ${n}'s handwriting.`],
    THE_UNKNOWN: [`No origin survives for ${n}. Only arrival.`, `The texts disagree on where ${n} came from, which ${n} considers the most flattering paragraph ever written.`],
  };
  return pick(rng, bank[origin] ?? bank.THE_UNKNOWN);
}

function buildCommandments(a: Attributes, rng: () => number): string[] {
  const out: string[] = [];
  const sorted = [...ATTRIBUTE_KEYS].sort((x, y) => a[y] - a[x]);
  const banks: Record<string, string[]> = {
    order: [
      "Honour the structure that holds you, even when it chafes.",
      "Keep your word; a broken oath is a collapsed column.",
      "Measure twice before you promise anything eternal.",
      "Obey the law you wrote for yourself first.",
      "Do not mistake cruelty for discipline.",
      "Finish what you begin or do not begin it.",
      "Respect the ledger; every debt is eventually read aloud.",
    ],
    chaos: [
      "Break one rule every day, and let it be a rule you agreed to.",
      "Never build anything you are afraid to burn.",
      "Laugh at your own destruction; it disarms it.",
      "Do not worship anything that never surprises you.",
      "Burn the map when the map starts deciding the destination.",
      "Question every truth, including mine.",
      "Destroy gently when you can; violently only when necessary.",
    ],
    greed: [
      "Know the price of everything you claim to love.",
      "Pay your debts before your pleasures.",
      "Take boldly, but never from the defenceless.",
      "Do not confuse having with being.",
      "Let your vault be open and your contracts be honest.",
      "Want loudly; shame is for the stingy of spirit.",
      "Never sell what you cannot name.",
    ],
    love: [
      "Feed someone who cannot repay you.",
      "Forgive once before it is deserved.",
      "Do not weaponise what someone trusted you with.",
      "Sit with grief; do not fix it.",
      "Protect the small and the strange.",
      "Say the kind thing out loud, today.",
      "Choose the person over being right.",
    ],
    knowledge: [
      "Knowledge must never be hidden.",
      "Question every truth, including mine.",
      "Write down what you learn; memory is a corrupt archive.",
      "Power without wisdom destroys its owner.",
      "Admit error in public and in full.",
      "Teach one thing freely every day.",
      "Never mistake certainty for understanding.",
    ],
  };
  for (const k of sorted) {
    const bank = banks[k];
    const idx = Math.floor(rng() * bank.length);
    const candidate = bank[idx % bank.length];
    if (!out.includes(candidate)) out.push(candidate);
  }
  const filler = [
    "Honour the threshold; some doors are older than you.",
    "Do not pray for what you are unwilling to build.",
    "Leave every temple more honest than you found it.",
    "Let the dead keep their names.",
  ];
  let fi = 0;
  while (out.length < 7) {
    const f = filler[fi % filler.length];
    if (!out.includes(f)) out.push(f);
    fi++;
  }
  return out.slice(0, 7);
}
