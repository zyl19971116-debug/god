export type AttributeKey = "order" | "chaos" | "greed" | "love" | "knowledge";

export interface Attributes {
  order: number;
  chaos: number;
  greed: number;
  love: number;
  knowledge: number;
}

export type Origin =
  | "THE_VOID"
  | "THE_SUN"
  | "THE_MOON"
  | "THE_OCEAN"
  | "THE_MACHINE"
  | "THE_FOREST"
  | "THE_STARS"
  | "THE_UNKNOWN";

export type GodForm = "MALE" | "FEMALE" | "ANDROGYNOUS" | "NON_HUMAN" | "RANDOM";

export interface BeliefSystem {
  coreBelief: string;
  purpose: string;
  viewOfHumanity: string;
  viewOfWealth: string;
  viewOfConflict: string;
  viewOfKnowledge: string;
  viewOfDeath: string;
}

export interface Commandment {
  index: number;
  numeral: string;
  text: string;
}

export interface ProphecyReaction {
  believe: number;
  doubt: number;
}

export interface Prophecy {
  id: string;
  godId: string;
  godName: string;
  godSlug: string;
  number: number;
  text: string;
  category: string;
  createdAt: string;
  reactions: ProphecyReaction;
}

export interface Relationship {
  otherGodId: string;
  otherGodName: string;
  kind: "ALLY" | "RIVAL" | "OPPOSED" | "UNKNOWN";
}

export interface DivineLevel {
  level: number;
  title: string;
  experience: number;
  nextLevelAt: number;
}

export interface God {
  id: string;
  slug: string;
  name: string;
  title: string;
  shortDescription: string;
  personality: string;
  philosophy: string;
  beliefSystem: BeliefSystem;
  creationMyth: string;
  symbol: string;
  domain: string;
  origin: Origin;
  form: GodForm;
  attributes: Attributes;
  imageUrl: string;
  dominantAttribute: AttributeKey;
  secondaryAttribute: AttributeKey;
  archetype: string;
  divineLevel: DivineLevel;
  followersCount: number;
  prayersCount: number;
  propheciesCount: number;
  growth: number;
  commandments: Commandment[];
  greeting: string;
  visualPrompt: string;
  creatorWallet: string;
  creatorName: string;
  createdAt: string;
  isSeed: boolean;
  relationships: Relationship[];
}

export interface Prayer {
  id: string;
  godId: string;
  godName: string;
  godSlug: string;
  wallet: string;
  text: string;
  response: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  kind: "GOD_CREATED" | "FOLLOW" | "PRAYER" | "PROPHECY" | "MILESTONE" | "WORLD_EVENT";
  text: string;
  wallet?: string;
  godSlug?: string;
  createdAt: string;
}

export interface WorldEvent {
  id: string;
  type:
    | "GOD_CREATED"
    | "FOLLOWER_MILESTONE"
    | "PROPHECY"
    | "MAJOR_PRAYER"
    | "BELIEF_EVOLUTION"
    | "RIVALRY"
    | "ALLIANCE"
    | "WORLD_EVENT";
  title: string;
  detail: string;
  godSlug?: string;
  createdAt: string;
}

export interface GlobalStats {
  godsCreated: number;
  totalFollowers: number;
  dailyPrayers: number;
  countries: number;
}

export interface GenerateGodInput {
  attributes: Attributes;
  origin: Origin;
  form: GodForm;
  creatorWallet?: string;
}

export interface GenerateGodOutput {
  name: string;
  title: string;
  shortDescription: string;
  personality: string;
  philosophy: string;
  beliefSystem: BeliefSystem;
  creationMyth: string;
  symbol: string;
  domain: string;
  commandments: string[];
  firstProphecy: string;
  greeting: string;
  visualPrompt: string;
}

export type ExploreSort =
  | "trending"
  | "new"
  | "most_followed"
  | "most_prayed"
  | "fastest"
  | "order"
  | "chaos"
  | "greed"
  | "love"
  | "knowledge";

export interface GodQuery {
  search?: string;
  sort?: ExploreSort;
  origin?: Origin;
  attribute?: AttributeKey;
  creatorWallet?: string;
  limit?: number;
  offset?: number;
}

export interface LeaderboardTab {
  key: "MOST_FOLLOWED" | "MOST_PRAYED" | "FASTEST_GROWING" | "NEW_GODS";
  label: string;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  connecting: boolean;
  error: string | null;
}
