import { NextResponse, type NextRequest } from "next/server";
import { store } from "@/lib/database/store";
import { isEvmAddress } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!isEvmAddress(wallet)) {
    return NextResponse.json({ error: "A valid wallet is required." }, { status: 400 });
  }
  // Private prayers are only ever returned to the wallet that owns them.
  const prayers = store.listPrayersByWallet(wallet as string, 50);
  return NextResponse.json({ prayers });
}
