import type { Metadata } from "next";
import { store } from "@/lib/database/store";
import { GodProfile } from "@/components/god/GodProfile";
import { GeneratedGodFallback } from "@/components/god/GeneratedGodFallback";
import { sanitizeText } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const god = store.get(sanitizeText(params.id, 60));
  if (!god) return { title: "God not found" };
  return {
    title: `${god.name} — ${god.title}`,
    description: god.shortDescription,
    openGraph: {
      title: `${god.name} — ${god.title}`,
      description: god.shortDescription,
      images: [{ url: god.imageUrl, alt: god.name }],
    },
  };
}

export default function GodPage({ params }: Props) {
  const god = store.get(sanitizeText(params.id, 60));
  if (!god) return <GeneratedGodFallback slug={sanitizeText(params.id, 60)} />;

  const prophecies = store.listProphecies(god.slug, 20);
  const publicPrayers = store.listPublicPrayers(god.slug, 12);
  const related = god.relationships
    .map((r) => ({ rel: r, god: store.get(r.otherGodId) }))
    .filter((x) => x.god);

  return (
    <GodProfile
      god={god}
      prophecies={prophecies}
      publicPrayers={publicPrayers}
      related={related.map((x) => x.god!)}
    />
  );
}
