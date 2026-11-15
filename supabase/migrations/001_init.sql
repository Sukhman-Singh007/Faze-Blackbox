-- FaZe Blackbox — Supabase schema
-- Run: supabase db push  (or paste into the Supabase SQL editor)
-- Answers are stored ONLY as SHA-256 hashes. No plaintext answers, ever.

create table if not exists public.rooms (
  code text primary key,
  status text not null default 'waiting' check (status in ('waiting','playing','completed')),
  stage int not null default 1 check (stage between 1 and 4),
  legacy_joined boolean not null default false,
  recruit_joined boolean not null default false,
  legacy_name text not null default '',
  recruit_name text not null default '',
  legacy_player_id text not null default '',
  recruit_player_id text not null default '',
  attempts jsonb not null default '{}'::jsonb,
  solved_at jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_event text not null default 'Room created'
);

create table if not exists public.stage_answers (
  stage_id int primary key,
  answer_hash text not null -- SHA-256 of the normalized (UPPERCASE, A-Z0-9) answer
);

-- Demo hashes for the current answers: SNIP / HOUSE / FIVE
-- (SHA-256 of the normalized answer, matching src/lib/puzzles.ts).
-- These must stay in sync with puzzles.ts if the answers ever change.
insert into public.stage_answers (stage_id, answer_hash) values
  (1, 'efdea8af41d84aeae41b5f1b5fe33fee15c449863d33991c94b01d50ae5402be'),
  (2, '3e83712a5c41abe11cf75a9ff41a66059e3bf823421bbc6d7bd3797e83786ed8'),
  (3, 'b35cf1ba111bbcf3a6f24755f22ed1346a8302aa62b9cf8ce82f8b5f2854eb83')
on conflict (stage_id) do nothing;

create table if not exists public.completed_missions (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.rooms(code),
  duration_ms int not null,
  total_attempts int not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
alter table public.stage_answers enable row level security;
alter table public.completed_missions enable row level security;

-- Rooms are readable/writable by anyone with the 6-char code (hackathon demo
-- scope). Tighten to per-player auth before any production launch.
create policy "rooms readable by code holders" on public.rooms for select using (true);
-- DEMO ONLY: this policy lets anyone with the anon key read/write any room,
-- including setting stage=4. It is wide open by design for the hackathon
-- demo and must be replaced with per-player RLS before any real deployment.
create policy "rooms writable by code holders" on public.rooms for all using (true);
create policy "answers never readable from client" on public.stage_answers for select using (false);
create policy "missions readable" on public.completed_missions for select using (true);
create policy "missions insertable" on public.completed_missions for insert with check (true);
