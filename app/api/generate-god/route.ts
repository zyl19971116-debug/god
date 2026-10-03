import { NextResponse } from "next/server";
import type { Attributes, GenerateGodInput, God, Origin, GodForm } from "@/types";
import { store } from "@/lib/database/store";
import { generateGodProfileAI, generateGodImage, aiStatus } from "@/lib/ai/provider";
import { generateGodProfile } from "@/lib/ai/fallback";
import { rateLimit, clientKey, LIMITS } from "@/lib/security/rateLimit";
import { isEvmAddress, sanitizeText } from "@/lib/security/sanitize";
import { ATTRIBUTE_KEYS, MAX_POINTS, MAX_PER_ATTRIBUTE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const ORIGINS = [
  "THE_VOID", "THE_SUN", "THE_MOON", "THE_OCEAN",
  "THE_MACHINE", "THE_FOREST", "THE_STARS", "THE_UNKNOWN",
];
const FORMS = ["MALE", "FEMALE", "ANDROGYNOUS", "NON_HUMAN", "RANDOM"];

function validateAttributes(raw: unknown): { ok: true; value: Attributes } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) return { ok: false, error: "Attributes are required." };
  const rec = raw as Record<string, unknown>;
  const out: Attributes = { order: 0, chaos: 0, greed: 0, love: 0, knowledge: 0 };
  let total = 0;
  for (const k of ATTRIBUTE_KEYS) {
    const v = Number(rec[k]);
    if (!Number.isFinite(v) || v < 0 || v > MAX_PER_ATTRIBUTE) {
      return { ok: false, error: `Each attribute must be between 0 and ${MAX_PER_ATTRIBUTE}.` };
    }
    out[k] = Math.round(v);
    total += out[k];
  }
  if (total === 0) return { ok: false, error: "Distribute at least one attribute point." };
  if (total > MAX_POINTS) return { ok: false, error: `Total attribute points cannot exceed ${MAX_POINTS}.` };
  return { ok: true, value: out };
}

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "god-create"), LIMITS.godCreation.limit, LIMITS.godCreation.windowMs);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Creation limit reached. Try again in ${limit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const attrs = validateAttributes(body.attributes);
  if (!attrs.ok) return NextResponse.json({ error: attrs.error }, { status: 400 });

  const origin = ORIGINS.includes(body.origin as Origin) ? (body.origin as Origin) : "THE_UNKNOWN";
  let form = FORMS.includes(body.form as GodForm) ? (body.form as GodForm) : "ANDROGYNOUS";

  const wallet = isEvmAddress(body.wallet) ? body.wallet : "0x0000000000000000000000000000000000000000";

  const input: GenerateGodInput = { attributes: attrs.value, origin, form, creatorWallet: wallet };

  // RANDOM form is resolved server-side so the AI prompt is never ambiguous.
  if (form === "RANDOM") {
    form = FORMS[Math.floor(Math.random() * 4)] as GodForm;
    input.form = form;
  }

  try {
    const { profile } = await generateGodProfileAI(input);

    let imageUrl: string | null = null;
    try {
      imageUrl = await generateGodImage({
        name: profile.name,
        title: profile.title,
        visualPrompt: profile.visualPrompt,
        attributes: attrs.value,
      });
    } catch {
      imageUrl = null;
    }

    const god: God = store.create({
      name: sanitizeText(profile.name, 40),
      title: sanitizeText(profile.title, 80),
      shortDescription: sanitizeText(profile.shortDescription, 220),
      personality: sanitizeText(profile.personality, 900),
      philosophy: sanitizeText(profile.philosophy, 900),
      beliefSystem: {
        coreBelief: sanitizeText(profile.beliefSystem.coreBelief, 900),
        purpose: sanitizeText(profile.beliefSystem.purpose, 900),
        viewOfHumanity: sanitizeText(profile.beliefSystem.viewOfHumanity, 900),
        viewOfWealth: sanitizeText(profile.beliefSystem.viewOfWealth, 900),
        viewOfConflict: sanitizeText(profile.beliefSystem.viewOfConflict, 900),
        viewOfKnowledge: sanitizeText(profile.beliefSystem.viewOfKnowledge, 900),
        viewOfDeath: sanitizeText(profile.beliefSystem.viewOfDeath, 900),
      },
      creationMyth: sanitizeText(profile.creationMyth, 1600),
      symbol: sanitizeText(profile.symbol, 200),
      domain: sanitizeText(profile.domain, 80),
      origin,
      form,
      attributes: attrs.value,
      commandments: profile.commandments.map((c) => sanitizeText(c, 200)).filter(Boolean),
      firstProphecy: sanitizeText(profile.firstProphecy, 900),
      greeting: sanitizeText(profile.greeting, 400),
      visualPrompt: sanitizeText(profile.visualPrompt, 1200),
      creatorWallet: wallet,
      imageUrl,
    });

    return NextResponse.json({ god, engine: aiStatus().provider });
  } catch {
    // Never expose a raw server error — fall back to the local engine.
    const profile = generateGodProfile(input);
    const god = store.create({
      name: profile.name,
      title: profile.title,
      shortDescription: profile.shortDescription,
      personality: profile.personality,
      philosophy: profile.philosophy,
      beliefSystem: profile.beliefSystem,
      creationMyth: profile.creationMyth,
      symbol: profile.symbol,
      domain: profile.domain,
      origin,
      form,
      attributes: attrs.value,
      commandments: profile.commandments,
      firstProphecy: profile.firstProphecy,
      greeting: profile.greeting,
      visualPrompt: profile.visualPrompt,
      creatorWallet: wallet,
      imageUrl: null,
    });
    return NextResponse.json({ god, engine: "local-engine" });
  }
}
