# AI GOD — Create Your Own Artificial God

An AI-native world where every user can create a unique artificial deity. Choose the
fundamental attributes, and AI generates its identity, appearance, personality,
philosophy, beliefs, commandments, prophecies and ongoing behaviour.

**Many Gods. Many Beliefs. One Multiverse.**

---

## Stack

| Layer      | Choice                                                     |
| ---------- | ---------------------------------------------------------- |
| Framework  | Next.js 14 (App Router) + React 18 + TypeScript            |
| Styling    | Tailwind CSS 3 + custom dark-divine design system          |
| Motion     | Framer Motion                                              |
| Icons      | Lucide + custom sacred-geometry SVG set                    |
| AI         | OpenAI-compatible provider with strict server-side JSON validation |
| Database   | In-memory seeded store, Supabase/Postgres migration path   |
| Web3       | EIP-1193 wallet modal + viem, wagmi-ready abstraction      |

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — everything works with no keys
npm run dev
```

Open http://localhost:3000.

### Production build

```bash
npm run build
npm start
```

## Routes

| Route            | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `/`              | Cinematic hero, global stats, featured gods, live activity, divine history |
| `/create`        | 20-point attribute allocator, origin + form picker, generation ritual |
| `/god/[id]`      | God profile: artwork, attributes, beliefs, commandments, prophecies, prayers |
| `/explore`       | Search, sort, origin filters, paginated grid                |
| `/leaderboard`   | Most followed / most prayed / fastest growing / new gods    |
| `/temple`        | Personal dashboard — my gods, follows, prayers, saved prophecies |
| `/docs`          | Product documentation                                       |

## API

| Endpoint                  | Method | Notes                                              |
| ------------------------- | ------ | -------------------------------------------------- |
| `/api/gods`               | GET    | Search, sort, filter, paginate                     |
| `/api/gods/[id]`          | GET    | Single god                                         |
| `/api/generate-god`       | POST   | Validated attribute input → generated god          |
| `/api/prayer`             | POST   | Attribute-grounded divine response                 |
| `/api/follow`             | POST   | Duplicate follows refused server-side              |
| `/api/prophecies`         | GET    | All prophecies                                     |
| `/api/prophecy/react`     | POST   | Believe / doubt                                    |
| `/api/prayers`            | GET    | Owner-only, wallet-checked                         |
| `/api/activity`           | GET    | Live activity feed                                 |

## The AI engine

`lib/ai/provider.ts` chooses between two engines:

1. **Remote** — if `AI_API_KEY` is set, all generation goes to an OpenAI-compatible
   `/chat/completions` endpoint with JSON mode. Output is parsed and validated by
   `lib/ai/schema.ts`; anything malformed is discarded.
2. **Local engine** — `lib/ai/fallback.ts` and `lib/ai/prayerFallback.ts` compose
   identity, beliefs, commandments and prayer responses deterministically from the
   attribute vector. No key required, and the same profile always produces the same
   god. Two different profiles always sound different.

Archetypes are assigned by **nearest centroid** (`lib/ai/archetypes.ts`), so every
attribute combination resolves to a meaningful identity.

## Security

- AI calls run **server-side only**. No key is ever exposed to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Every route is rate-limited (`lib/security/rateLimit.ts`).
- All user input is sanitised (`lib/security/sanitize.ts`).
- Private prayers are returned only to the wallet that owns them.
- No private keys are ever requested. No token contract is hardcoded.

## Web3

`lib/web3/` contains `wallet.ts` (EIP-1193 detection + errors), `chains.ts`
(chain registry), `contracts.ts` (deliberately empty registry) and `types.ts`.
The wallet modal connects to any injected EVM provider without wagmi, and the
shapes are wagmi-compatible so RainbowKit can be layered on later.

## Database migration path

V1 runs on the seeded in-memory store so the app is functional with zero
configuration. To move to Supabase:

1. Set the env vars in `.env.local`.
2. Run `lib/database/schema.sql` in your Supabase project.
3. Swap the calls in `lib/database/store.ts` for the clients in
   `lib/database/client.ts`. No component changes are required.

## God portraits

Every seed god ships with a unique generated portrait in `public/gods/`. The image
system (`lib/ai/provider.ts → generateGodImage()`) will use a configured image API
when available and always falls back to curated local artwork, so no broken images
are ever displayed.
