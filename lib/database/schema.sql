-- AI GOD — Supabase / Postgres schema (V1)
-- Enable Row Level Security on every table. Private prayers are owner-only.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  wallet text unique not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists gods (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  creator_id uuid references users(id) on delete set null,
  creator_wallet text not null,
  name text not null,
  title text not null,
  description text,
  personality text,
  philosophy text,
  origin text not null,
  form text not null,
  domain text,
  symbol text,
  image_url text,
  dominant_attribute text,
  secondary_attribute text,
  archetype text,
  divine_level int not null default 1,
  experience int not null default 0,
  followers_count int not null default 0,
  prayers_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists god_attributes (
  god_id uuid references gods(id) on delete cascade,
  attribute text not null,
  value int not null check (value between 0 and 10),
  primary key (god_id, attribute)
);

create table if not exists god_beliefs (
  god_id uuid references gods(id) on delete cascade,
  version int not null default 1,
  core_belief text,
  purpose text,
  view_of_humanity text,
  view_of_wealth text,
  view_of_conflict text,
  view_of_knowledge text,
  view_of_death text,
  created_at timestamptz not null default now(),
  primary key (god_id, version)
);

create table if not exists god_commandments (
  id uuid primary key default gen_random_uuid(),
  god_id uuid references gods(id) on delete cascade,
  ordinal int not null,
  text text not null
);

create table if not exists god_prophecies (
  id uuid primary key default gen_random_uuid(),
  god_id uuid references gods(id) on delete cascade,
  number int not null,
  text text not null,
  category text,
  believe int not null default 0,
  doubt int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists god_relationships (
  god_id uuid references gods(id) on delete cascade,
  other_god_id uuid references gods(id) on delete cascade,
  kind text not null check (kind in ('ALLY','RIVAL','OPPOSED','UNKNOWN')),
  primary key (god_id, other_god_id)
);

create table if not exists god_history (
  id uuid primary key default gen_random_uuid(),
  god_id uuid references gods(id) on delete cascade,
  event text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  wallet text not null,
  god_id uuid references gods(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wallet, god_id)
);

create table if not exists prayers (
  id uuid primary key default gen_random_uuid(),
  god_id uuid references gods(id) on delete cascade,
  wallet text not null,
  text text not null,
  response text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists prayer_responses (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid references prayers(id) on delete cascade,
  body text not null,
  provider text,
  created_at timestamptz not null default now()
);

create table if not exists saved_prophecies (
  wallet text not null,
  prophecy_id uuid references god_prophecies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wallet, prophecy_id)
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  text text not null,
  wallet text,
  god_slug text,
  created_at timestamptz not null default now()
);

create table if not exists world_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  detail text,
  god_slug text,
  created_at timestamptz not null default now()
);

alter table prayers enable row level security;
drop policy if exists "prayers are owner readable" on prayers;
create policy "prayers are owner readable" on prayers
  for select using (is_public = true or wallet = current_setting('app.wallet', true));

alter table prayer_responses enable row level security;
drop policy if exists "responses follow prayers" on prayer_responses;
create policy "responses follow prayers" on prayer_responses
  for select using (
    exists (select 1 from prayers p where p.id = prayer_id and (p.is_public = true or p.wallet = current_setting('app.wallet', true)))
  );

alter table users enable row level security;
alter table gods enable row level security;
alter table god_attributes enable row level security;
alter table god_beliefs enable row level security;
alter table god_commandments enable row level security;
alter table god_prophecies enable row level security;
alter table god_relationships enable row level security;
alter table god_history enable row level security;
alter table follows enable row level security;
alter table saved_prophecies enable row level security;
alter table activities enable row level security;
alter table world_events enable row level security;
