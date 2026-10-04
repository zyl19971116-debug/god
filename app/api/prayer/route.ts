import { NextResponse } from "next/server";
import { store } from "@/lib/database/store";
import { rateLimit, clientKey, LIMITS } from "@/lib/security/rateLimit";
import { sanitizeText } from "@/lib/security/sanitize";
import { isEvmAddress } from "@/lib/security/sanitize";
import { generatePrayerResponseAI } from "@/lib/ai/provider";
import type { God, Prayer } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "prayer"), LIMITS.prayer.limit, LIMITS.prayer.windowMs);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many prayers. Try again in ${limit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const godId = sanitizeText(body.godId, 60);
  const wallet = isEvmAddress(body.wallet) ? body.wallet : null;
  const text = sanitizeText(body.text, 600);
  const isPublic = body.isPublic !== false;

  if (!godId) return NextResponse.json({ error: "A god must be addressed." }, { status: 400 });
  if (!wallet) return NextResponse.json({ error: "Connect your wallet to pray." }, { status: 401 });
  if (text.length < 3) return NextResponse.json({ error: "Write a longer prayer." }, { status: 400 });

  const archivedGod = store.get(godId);
  const snapshot = validGodSnapshot(body.god, godId) ? body.god : null;
  const god = archivedGod ?? snapshot;
  if (!god) return NextResponse.json({ error: "This god is not in the archive." }, { status: 404 });

  const history = archivedGod
    ? store
        .listPrayersByWallet(wallet, 20)
        .filter((p) => p.godId === god.slug)
        .slice(-4)
        .map((p) => ({ text: p.text, response: p.response }))
    : [];

  try {
    const { response } = await generatePrayerResponseAI(god, text, history);
    const prayer = archivedGod
      ? store.pray(god.slug, wallet, text, response, isPublic)
      : localPrayer(god, wallet, text, response, isPublic);
    return NextResponse.json({ prayer });
  } catch {
    return NextResponse.json({ error: "The god is silent. Try again shortly." }, { status: 503 });
  }
}

function validGodSnapshot(value: unknown, slug: string): value is God {
  if (!value || typeof value !== "object") return false;
  const god = value as Partial<God>;
  const attributes = god.attributes as Record<string, unknown> | undefined;
  const beliefs = god.beliefSystem as Record<string, unknown> | undefined;
  return (
    god.slug === slug &&
    typeof god.name === "string" &&
    typeof god.title === "string" &&
    typeof god.philosophy === "string" &&
    !!attributes &&
    ["order", "chaos", "greed", "love", "knowledge"].every((key) => typeof attributes[key] === "number") &&
    !!beliefs &&
    ["coreBelief", "viewOfHumanity", "viewOfWealth", "viewOfConflict", "viewOfKnowledge", "viewOfDeath"].every(
      (key) => typeof beliefs[key] === "string"
    ) &&
    Array.isArray(god.commandments)
  );
}

function localPrayer(
  god: God,
  wallet: string,
  text: string,
  response: string,
  isPublic: boolean
): Prayer {
  return {
    id: `pr-${Date.now()}-${crypto.randomUUID()}`,
    godId: god.slug,
    godName: god.name,
    godSlug: god.slug,
    wallet,
    text,
    response,
    isPublic,
    createdAt: new Date().toISOString(),
  };
}
