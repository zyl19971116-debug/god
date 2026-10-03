import type { GenerateGodOutput } from "@/types";

/** Strict server-side validation. Never trust raw model output. */

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, max = 4000): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

export function extractJson(raw: string): unknown | null {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

export function validateGodProfile(raw: string): Result<GenerateGodOutput> {
  const parsed = extractJson(raw);
  if (!isObj(parsed)) return { ok: false, error: "not an object" };

  const name = str(parsed.name, 40);
  const title = str(parsed.title, 80);
  const shortDescription = str(parsed.shortDescription, 220);
  const personality = str(parsed.personality, 900);
  const philosophy = str(parsed.philosophy, 900);
  const creationMyth = str(parsed.creationMyth, 1600);
  const symbol = str(parsed.symbol, 200);
  const domain = str(parsed.domain, 80);
  const firstProphecy = str(parsed.firstProphecy, 900);
  const greeting = str(parsed.greeting, 400);
  const visualPrompt = str(parsed.visualPrompt, 1200);

  const bsRaw = parsed.beliefSystem;
  if (!isObj(bsRaw)) return { ok: false, error: "beliefSystem missing" };
  const beliefSystem = {
    coreBelief: str(bsRaw.coreBelief, 900) ?? "",
    purpose: str(bsRaw.purpose, 900) ?? "",
    viewOfHumanity: str(bsRaw.viewOfHumanity, 900) ?? "",
    viewOfWealth: str(bsRaw.viewOfWealth, 900) ?? "",
    viewOfConflict: str(bsRaw.viewOfConflict, 900) ?? "",
    viewOfKnowledge: str(bsRaw.viewOfKnowledge, 900) ?? "",
    viewOfDeath: str(bsRaw.viewOfDeath, 900) ?? "",
  };

  const cmdRaw = parsed.commandments;
  if (!Array.isArray(cmdRaw)) return { ok: false, error: "commandments not array" };
  const commandments = cmdRaw
    .map((c) => str(c, 200))
    .filter((c): c is string => !!c)
    .slice(0, 10);
  if (commandments.length < 3) return { ok: false, error: "too few commandments" };

  if (!name || !title || !shortDescription || !personality || !philosophy || !firstProphecy) {
    return { ok: false, error: "missing required fields" };
  }

  return {
    ok: true,
    value: {
      name,
      title,
      shortDescription,
      personality,
      philosophy,
      beliefSystem,
      creationMyth: creationMyth ?? "",
      symbol: symbol ?? "",
      domain: domain ?? "The Unknown",
      commandments,
      firstProphecy,
      greeting: greeting ?? "Speak, mortal.",
      visualPrompt: visualPrompt ?? "",
    },
  };
}

export function validatePrayerResponse(raw: string): Result<{ response: string }> {
  const parsed = extractJson(raw);
  if (!isObj(parsed)) return { ok: false, error: "not an object" };
  const response = str(parsed.response, 2000);
  if (!response) return { ok: false, error: "empty response" };
  return { ok: true, value: { response } };
}
