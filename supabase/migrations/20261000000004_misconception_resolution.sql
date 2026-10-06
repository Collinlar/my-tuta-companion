-- Extend misconceptions table with structured fields for detection and intervention.
alter table misconceptions
  add column if not exists error_pattern        text,
  add column if not exists detection_rule       jsonb,
  add column if not exists intervention_content jsonb,
  add column if not exists follow_up_practice   jsonb,
  add column if not exists teacher_guidance     text,
  add column if not exists confidence           text default 'medium'
    check (confidence in ('low','medium','high')),
  add column if not exists frequency            int default 0,
  add column if not exists resolution_rate      numeric;

-- Per-student tracking of when a misconception is detected, intervened on, and resolved.
create table misconception_resolutions (
  id                    uuid    primary key default gen_random_uuid(),
  user_id               uuid    not null references auth.users(id) on delete cascade,
  misconception_id      uuid    not null references misconceptions(id) on delete cascade,
  concept_id            uuid    not null references concepts(id) on delete cascade,
  first_detected_at     timestamptz default now(),
  intervention_shown_at timestamptz,
  follow_up_passed      boolean,
  resolved_at           timestamptz,
  occurrence_count      int default 1
);

create unique index misconception_resolutions_unique
  on misconception_resolutions(user_id, misconception_id);

alter table misconception_resolutions enable row level security;

create policy "Students see own resolutions"
  on misconception_resolutions for select
  using (auth.uid() = user_id);

create policy "Students insert own resolutions"
  on misconception_resolutions for insert
  with check (auth.uid() = user_id);

create policy "Students update own resolutions"
  on misconception_resolutions for update
  using (auth.uid() = user_id);

create policy "Admins full resolutions"
  on misconception_resolutions
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Teachers see class resolutions"
  on misconception_resolutions for select
  using (auth.jwt() ->> 'role' = 'teacher');
