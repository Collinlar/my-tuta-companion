-- Demand tracking for Tier C (provisional/open) concepts.
-- When a student requests a concept not in the catalog, we record it here.
-- Admins use request_count to decide which concepts to promote to Tier B.

create table if not exists concept_demand (
  id uuid primary key default gen_random_uuid(),
  concept_slug text not null unique,
  concept_name text not null,
  subject text,
  request_count int not null default 1,
  last_requested_at timestamptz not null default now(),
  promoted_at timestamptz,
  promoted_to_tier text check (promoted_to_tier in ('B', 'A')),
  notes text,
  created_at timestamptz not null default now()
);

create index concept_demand_count_idx on concept_demand(request_count desc);

alter table concept_demand enable row level security;
create policy "Admins manage demand" on concept_demand
  using (auth.jwt() ->> 'role' = 'admin');
create policy "Authenticated read demand" on concept_demand
  for select using (auth.role() = 'authenticated');

comment on table concept_demand is
  'Tracks student requests for concepts not yet in the reviewed catalog. Drives Tier C → Tier B promotion decisions.';
