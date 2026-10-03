import { NextResponse } from "next/server";
import { store } from "@/lib/database/store";
import { rateLimit, clientKey, LIMITS } from "@/lib/security/rateLimit";
import { sanitizeText } from "@/lib/security/sanitize";
import { isEvmAddress } from "@/lib/security/sanitize";
import { generatePrayerResponseAI } from "@/lib/ai/provider";

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

  const god = store.get(godId);
  if (!god) return NextResponse.json({ error: "This god is not in the archive." }, { status: 404 });

  const history = store
    .listPrayersByWallet(wallet, 20)
    .filter((p) => p.godId === god.slug)
    .slice(-4)
    .map((p) => ({ text: p.text, response: p.response }));

  try {
    const { response } = await generatePrayerResponseAI(god, text, history);
    const prayer = store.pray(god.slug, wallet, text, response, isPublic);
    return NextResponse.json({ prayer });
  } catch {
    return NextResponse.json({ error: "The god is silent. Try again shortly." }, { status: 503 });
  }
}
