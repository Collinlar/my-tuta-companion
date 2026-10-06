-- Modular reusable content units. One concept has many units across 17 types.
-- Students only see approved/published units; admins see all.
create table content_units (
  id                  uuid    primary key default gen_random_uuid(),
  concept_id          uuid    not null references concepts(id) on delete cascade,
  skill_id            uuid    references skills(id),
  unit_type           text    not null check (unit_type in (
    'Core Explanation','Alternative Explanation','Visual Explanation','Analogy',
    'Worked Example','Guided Problem','Independent Problem','Hint Set',
    'Recall Cards','Quick Check','Intervention','Extension',
    'Practical Activity','Reflection','Mastery Check Item','Revision Activity','Teacher Guide'
  )),
  learning_stage      text,
  difficulty          text    check (difficulty in ('foundation','core','extension','challenge')),
  estimated_duration_mins int,
  content             jsonb   not null,
  correct_answer      text,
  explanation         text,
  common_mistakes     jsonb,
  hints               jsonb,
  adaptation_rules    jsonb,
  source              text,
  author              text,
  reviewer            text,
  review_status       text    default 'draft' check (review_status in (
    'draft','under_review','approved','published','needs_revision','archived'
  )),
  version             int     default 1,
  ai_generated        boolean default false,
  ai_model            text,
  ai_prompt_version   text,
  usage_count         int     default 0,
  correct_rate        numeric,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index content_units_concept_idx on content_units(concept_id);
create index content_units_type_idx    on content_units(unit_type);
create index content_units_status_idx  on content_units(review_status);

alter table content_units enable row level security;

create policy "Authenticated read approved content"
  on content_units for select
  using (
    auth.role() = 'authenticated'
    and review_status in ('approved','published')
  );

create policy "Admins manage content_units"
  on content_units
  using (auth.jwt() ->> 'role' = 'admin');

-- Update updated_at automatically.
create or replace function update_content_units_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger content_units_updated_at
  before update on content_units
  for each row execute procedure update_content_units_updated_at();
