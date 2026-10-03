import { NextResponse } from "next/server";
import type { ExploreSort, GodQuery, Origin } from "@/types";
import { store } from "@/lib/database/store";
import { sanitizeText } from "@/lib/security/sanitize";
import { rateLimit, clientKey, LIMITS } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

const SORTS: ExploreSort[] = [
  "trending", "new", "most_followed", "most_prayed",
  "order", "chaos", "greed", "love", "knowledge", "fastest",
];

export async function GET(req: Request) {
  const limit = rateLimit(clientKey(req, "search"), LIMITS.search.limit, LIMITS.search.windowMs);
  if (!limit.ok) return NextResponse.json({ error: "Too many searches." }, { status: 429 });

  const url = new URL(req.url);
  const sortParam = url.searchParams.get("sort") as ExploreSort | null;
  const attributeParam = url.searchParams.get("attribute");
  const originParam = url.searchParams.get("origin");

  const query: GodQuery = {
    search: sanitizeText(url.searchParams.get("q"), 60) || undefined,
    sort: sortParam && SORTS.includes(sortParam) ? sortParam : "most_followed",
    attribute: (["order", "chaos", "greed", "love", "knowledge"] as const).includes(
      attributeParam as "order"
    )
      ? (attributeParam as GodQuery["attribute"])
      : undefined,
    origin: originParam ? (originParam as Origin) : undefined,
    limit: Math.min(Number(url.searchParams.get("limit") ?? 60) || 60, 200),
    offset: Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0),
  };

  const gods = store.list(query);
  return NextResponse.json({ gods, total: store.count() });
}
