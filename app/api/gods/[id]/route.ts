import { NextResponse } from "next/server";
import { store } from "@/lib/database/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const god = store.get(params.id);
  if (!god) return NextResponse.json({ error: "God not found." }, { status: 404 });
  return NextResponse.json({ god });
}
