import { NextResponse } from "next/server";
import { store } from "@/lib/database/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ prophecies: store.listProphecies(undefined, 60) });
}
