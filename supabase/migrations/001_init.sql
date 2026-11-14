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

-- Demo hashes for FAZE / CLAN / VAULT. Replace when the sponsor timeline ships.
insert into public.stage_answers (stage_id, answer_hash) values
  (1, '7e71bc438645f7ce334cf9b678d82459b3cf521eb78b03c3a551d2edd618cc7f'),
  (2, '68cf9218d6057b3d33d4d1631d5b24905d984ffd9411473bd7622506a70d66ec'),
  (3, 'e1c20be7b222031d9091b8ab95a5ce2b59e2ed514b86c2d1eaf064fd8abbd531')
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
create policy "rooms writable by code holders" on public.rooms for all using (true);
create policy "answers never readable from client" on public.stage_answers for select using (false);
create policy "missions readable" on public.completed_missions for select using (true);
create policy "missions insertable" on public.completed_missions for insert with check (true);
