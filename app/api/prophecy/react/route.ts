import { NextResponse } from "next/server";
import { store } from "@/lib/database/store";
import { sanitizeText } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const id = sanitizeText(body.prophecyId, 60);
  const kind = body.kind === "DOUBT" ? "DOUBT" : "BELIEVE";
  const prophecy = store.reactToProphecy(id, kind);
  if (!prophecy) return NextResponse.json({ error: "Prophecy not found." }, { status: 404 });
  return NextResponse.json({ reactions: prophecy.reactions });
}
