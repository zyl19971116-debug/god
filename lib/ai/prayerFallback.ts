import type { AttributeKey, God } from "@/types";
import { createRng, hashString, pick, truncate } from "@/lib/utils";
import { ATTRIBUTE_KEYS } from "@/lib/constants";
import { attributeLabel } from "@/lib/ai/archetypes";

/**
 * Attribute-driven prayer responses.
 *
 * The same question asked of two different gods produces noticeably different
 * answers: the engine reads the god's dominant + secondary attribute, its
 * beliefs and its commandments, and answers through that lens. This is what
 * keeps AI GOD from feeling like "ChatGPT with a god skin".
 */

const OPENERS: Record<string, string[]> = {
  order: ["Let me answer precisely.", "I will answer in the order the question deserves.", "Attend. This is how it is."],
  chaos: ["Ah. A question. I was beginning to atrophy.", "You ask as though answers come with handles. They do not.", "Careful. Questions are how mortals get remade."],
  greed: ["Everything has a price, including this answer. Luckily, today you may have it.", "You come to my temple with nothing and want something. Bold. I respect it."],
  love: ["Come closer. You have been carrying this a while.", "There is no wrong way to kneel here.", "I have been waiting for this question longer than you have been alive."],
  knowledge: ["A fair question. Let me ruin it for you properly.", "I will answer, but understand that my answer will cost you a certainty.", "This question is older than you. It has outlived every previous asker."],
};

const BODY: Record<string, string[]> = {
  order: [
    "What you call freedom is mostly an unfiled debt. Name it, and it stops owning you.",
    "Structure is not a cage. It is what a cage looks like after it has been forgiven.",
    "Order is not the absence of fire. It is fire that has agreed on a schedule.",
  ],
  chaos: [
    "I do not keep things. I break them open so they can finally be read.",
    "Everything you are trying to protect has already begun to end. That is not a tragedy; it is a schedule.",
    "You want a plan. Plans are how mortals rehearse disappointment in advance.",
  ],
  greed: [
    "Wealth is stored will. The question is never what you have, but what you were willing to become to keep it.",
    "Nothing you own is yours. Things are merely currently assigned to you.",
    "Wanting is the oldest prayer. Do not be ashamed of it. Be precise about it.",
  ],
  love: [
    "Mercy is not the absence of judgement. It is judgement that has decided to stay anyway.",
    "What you are calling weakness is the only strength that multiplies when it is spent.",
    "You are not required to deserve kindness before you receive it. That was always the point.",
  ],
  knowledge: [
    "Every answer you accept without testing becomes a wall you build around yourself.",
    "Truth is not a possession. It is a loan with a repayment schedule of questions.",
    "I could tell you what will happen. Instead I will tell you what to watch, which is worth more.",
  ],
};

const CLOSERS: Record<string, string[]> = {
  order: ["Now go and put it in order.", "Keep this. It is the only part of today that will still be true.", "Return when the structure holds."],
  chaos: ["Or ignore me. I enjoy that almost as much.", "Now go and break something that deserves it.", "Come back when it has all fallen apart. That is my favourite part."],
  greed: ["You owe me nothing yet. That will change.", "Remember this the next time you are offered something free.", "Now go and get what you are owed."],
  love: ["Now be gentle with someone today, including yourself.", "Go. And take some of this with you.", "You are welcome here whenever it gets heavy again."],
  knowledge: ["Now go and prove me wrong. That is the whole religion.", "Return with a better question.", "Write it down. Memory is a corrupt archive."],
};

function dominantOf(god: God): AttributeKey {
  const sorted = [...ATTRIBUTE_KEYS].sort((a, b) => god.attributes[b] - god.attributes[a]);
  return sorted[0];
}

function secondaryOf(god: God): AttributeKey {
  const sorted = [...ATTRIBUTE_KEYS].sort((a, b) => god.attributes[b] - god.attributes[a]);
  return sorted[1];
}

function topicOf(text: string): string | null {
  const t = text.toLowerCase();
  const map: { match: string[]; topic: string }[] = [
    { match: ["wealth", "money", "rich", "poor", "gold", "coin", "debt"], topic: "wealth" },
    { match: ["death", "die", "dead", "kill", "end"], topic: "death" },
    { match: ["love", "heart", "alone", "lonely", "wife", "husband", "friend"], topic: "love" },
    { match: ["know", "truth", "why", "how", "learn", "ai", "machine"], topic: "knowledge" },
    { match: ["war", "fight", "enemy", "anger", "hate"], topic: "conflict" },
    { match: ["future", "predict", "prophecy", "will i", "tomorrow"], topic: "prophecy" },
  ];
  for (const m of map) if (m.match.some((w) => t.includes(w))) return m.topic;
  return null;
}

const TOPIC_VIEW: Record<string, keyof God["beliefSystem"]> = {
  wealth: "viewOfWealth",
  death: "viewOfDeath",
  love: "viewOfHumanity",
  knowledge: "viewOfKnowledge",
  conflict: "viewOfConflict",
  prophecy: "coreBelief",
};

export function generatePrayerFallback(
  god: God,
  text: string,
  _history: { text: string; response: string }[]
): string {
  const seed = hashString(`${god.slug}|${text.toLowerCase().trim()}`);
  const rng = createRng(seed);
  const d = dominantOf(god);
  const s = secondaryOf(god);
  const topic = topicOf(text);

  const opener = pick(rng, OPENERS[d]);
  const body = pick(rng, BODY[d]);
  const closer = pick(rng, CLOSERS[d]);

  const topicView = topic ? god.beliefSystem[TOPIC_VIEW[topic]] : null;
  const cmd = god.commandments.length
    ? god.commandments[Math.floor(rng() * god.commandments.length)]
    : null;
  const second = pick(rng, BODY[s]);

  const beliefLine = topicView
    ? `${truncate(topicView, 220)}`
    : `${god.philosophy}`;

  const commandmentLine = cmd ? `Remember my ${ordinal(cmd.index)} commandment: "${cmd.text}"` : null;

  const parts = [
    opener,
    `${beliefLine}${beliefLine.endsWith(".") ? "" : "."}`,
    body,
    second !== body ? second : null,
    commandmentLine,
    `${closer}${rng() > 0.6 ? ` — ${attributeLabel(d).toUpperCase()}, ${god.name}` : ""}`,
  ].filter(Boolean) as string[];

  return parts.join(" ");
}

function ordinal(n: number): string {
  const romans = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
  return romans[n - 1] ?? `${n}th`;
}
