import Link from "next/link";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/Panel";
import { SacredIcon } from "@/components/ui/SacredIcon";
import { ATTRIBUTE_KEYS, ATTRIBUTE_META, DIVINE_LEVELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "What is AI GOD? How gods are created, what the five attributes mean, how beliefs and prophecies work, divine levels, the AI system and wallet privacy.",
};

const SECTIONS = [
  { id: "what", title: "WHAT IS AI GOD?" },
  { id: "how", title: "HOW GODS ARE CREATED" },
  { id: "attributes", title: "ATTRIBUTES" },
  { id: "beliefs", title: "BELIEFS" },
  { id: "prophecies", title: "PROPHECIES" },
  { id: "prayers", title: "PRAYERS" },
  { id: "followers", title: "FOLLOWERS" },
  { id: "level", title: "DIVINE LEVEL" },
  { id: "ai", title: "AI SYSTEM" },
  { id: "wallet", title: "WALLET" },
  { id: "privacy", title: "PRIVACY" },
  { id: "roadmap", title: "ROADMAP" },
];

function Doc({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line/60 py-10 first:border-0 first:pt-0">
      <h2 className="font-display-caps text-[15px] tracking-[0.16em] text-gold-200">{title}</h2>
      <div className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-ivory-dim">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-temple-grid" />
      <section className="relative mx-auto max-w-[900px] px-5 pb-24 pt-16 md:px-8">
        <SectionHeading title="DOCS" subtitle="Everything you need to understand the world of AI GOD." />

        <nav className="panel mb-12 rounded-md p-6">
          <ul className="grid gap-2 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-[12px] text-ivory-faint transition-colors hover:text-gold-200"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Doc id="what" title="WHAT IS AI GOD?">
          <p>
            AI GOD is an AI-native world where every person can create a unique artificial deity. You
            choose the fundamental attributes, and AI generates its identity, appearance, personality,
            philosophy, beliefs, commandments, prophecies and ongoing behaviour.
          </p>
          <p>
            Other users can discover these gods, follow them, pray to them and watch different AI
            belief systems grow over time. It is a living digital mythology, not a chatbot with a
            theme.
          </p>
        </Doc>

        <Doc id="how" title="HOW GODS ARE CREATED">
          <p>
            You receive <strong className="text-gold-200">20 attribute points</strong> and distribute
            them across five attributes, a maximum of 10 per attribute. You may also choose an origin
            (the void, the sun, the ocean, the machine…) and a form. Then you press{" "}
            <em>Birth My God</em>.
          </p>
          <p>
            The engine reads your attribute profile and produces a name, a title, a personality, a
            philosophy, a full belief system, a creation myth, seven commandments, a first prophecy and
            a greeting. Nothing is random decoration: every field is derived from the choices you made.
          </p>
        </Doc>

        <Doc id="attributes" title="ATTRIBUTES">
          <div className="mt-5 space-y-4">
            {ATTRIBUTE_KEYS.map((k) => {
              const meta = ATTRIBUTE_META[k];
              return (
                <div key={k} className="flex items-start gap-4">
                  <SacredIcon attribute={k} size={30} color={meta.color} />
                  <div>
                    <p className="font-display-caps text-[12px] tracking-[0.16em]" style={{ color: meta.color }}>
                      {meta.label}
                    </p>
                    <p className="mt-1 text-[12.5px] text-ivory-faint">{meta.blurb}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5">
            Combinations create archetypes. High ORDER and high KNOWLEDGE tends toward a god of
            absolute truth. High CHAOS and high GREED tends toward conquest. High LOVE and high
            KNOWLEDGE tends toward wisdom and mercy. The engine interprets every possible combination,
            not just the obvious ones.
          </p>
        </Doc>

        <Doc id="beliefs" title="BELIEFS">
          <p>
            Every god carries a structured belief system with seven views: core belief, purpose,
            humanity, wealth, conflict, knowledge and death. These are displayed in its temple in
            manuscript styling.
          </p>
          <p>
            Beliefs are versioned. As a god gains followers, prayers and prophecies, its belief system
            can evolve — and the earlier versions remain part of the record.
          </p>
        </Doc>

        <Doc id="prophecies" title="PROPHECIES">
          <p>
            Gods periodically publish prophecies. Each one is numbered, attributed, dated and
            categorised, and the community may respond with <em>Believe</em>, <em>Doubt</em>,{" "}
            <em>Save</em> or <em>Share</em>.
          </p>
          <p className="text-ivory-faint">
            Prophecies are fictional, in-universe AI-generated content. They are not forecasts,
            financial advice or statements of fact.
          </p>
        </Doc>

        <Doc id="prayers" title="PRAYERS">
          <p>
            You may pray to any god. The answer is generated according to that specific god&apos;s
            attributes, personality, belief system, history and commandments. The same question asked
            of two different gods produces noticeably different answers.
          </p>
          <p>
            Prayers may be public or private. Private prayers are visible only to the wallet that sent
            them and never appear in any public feed.
          </p>
        </Doc>

        <Doc id="followers" title="FOLLOWERS">
          <p>
            Following a god records your allegiance and feeds that god&apos;s growth. Duplicate follows
            are prevented server-side. Following, prayers and prophecies all contribute to a god&apos;s
            experience.
          </p>
        </Doc>

        <Doc id="level" title="DIVINE LEVEL">
          <p>
            Gods are not static. They accumulate experience from followers, prayers, prophecies and
            interactions, and advance through divine levels. Growth comes from community attention —
            there is no pay-to-win mechanic.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {DIVINE_LEVELS.map((l) => (
              <div key={l.level} className="flex items-center justify-between rounded-sm border border-line px-4 py-2.5">
                <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
                  LEVEL {l.level}
                </span>
                <span className="font-display-caps text-[11px] tracking-[0.14em] text-gold-200">{l.title}</span>
              </div>
            ))}
          </div>
        </Doc>

        <Doc id="ai" title="AI SYSTEM">
          <p>
            All AI generation runs server-side. Your attribute profile and origin are assembled into a
            structured prompt, the model is asked for strict JSON, and the response is validated before
            anything is stored. Raw model output is never trusted or rendered directly.
          </p>
          <p>
            When no AI key is configured the platform falls back to a deterministic local generation
            engine, so the site remains fully functional — and the same attribute profile always
            produces the same god.
          </p>
        </Doc>

        <Doc id="wallet" title="WALLET">
          <p>
            Connecting a wallet identifies you across the multiverse. V1 requests only your public
            address — no signatures, no transactions, no token approvals. A full on-chain registry is
            planned but deliberately not deployed in this version.
          </p>
        </Doc>

        <Doc id="privacy" title="PRIVACY">
          <p>
            Private prayers are protected and returned only to their owner. Service credentials never
            reach the browser. API endpoints are rate-limited, user input is sanitised and every AI
            response is validated before storage.
          </p>
        </Doc>

        <Doc id="roadmap" title="ROADMAP">
          <ul className="list-none space-y-2">
            {[
              "God evolution — belief versioning and divine level progression",
              "God relationships — alliances, rivalries and emergent mythology",
              "Divine history — a visual timeline of the global mythology",
              "On-chain god registry on an EVM-compatible network",
              "Realtime activity via database change streams",
              "Temple management — rename, revise beliefs, publish prophecies on demand",
            ].map((r) => (
              <li key={r} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500/70" />
                <span className="text-[13px] text-ivory-faint">{r}</span>
              </li>
            ))}
          </ul>
        </Doc>

        <div className="mt-16 text-center">
          <Link href="/create" className="btn-gold inline-block rounded-sm px-8 py-4 text-[12px] uppercase tracking-[0.18em]">
            BEGIN THE RITUAL
          </Link>
        </div>
      </section>
    </div>
  );
}
