import { NextResponse } from "next/server";
import { store } from "@/lib/database/store";
import { rateLimit, clientKey, LIMITS } from "@/lib/security/rateLimit";
import { isEvmAddress, sanitizeText } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "follow"), 60, 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Slow down." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const godId = sanitizeText(body.godId, 60);
  const wallet = body.wallet;

  if (!godId) return NextResponse.json({ error: "A god must be addressed." }, { status: 400 });
  if (!isEvmAddress(wallet)) return NextResponse.json({ error: "Connect your wallet." }, { status: 401 });

  const god = store.get(godId);
  if (!god) return NextResponse.json({ error: "This god is not in the archive." }, { status: 404 });

  // A wallet can follow a god only once. store.follow is idempotent and does
  // not increment the counter when this wallet/god pair already exists.
  const res = store.follow(god.slug, wallet as string);
  return NextResponse.json({ followersCount: res.followers, following: true, created: res.ok });
}
