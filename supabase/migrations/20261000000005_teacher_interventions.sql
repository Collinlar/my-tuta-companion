-- Teacher-created targeted interventions for class misconception patterns.
create table teacher_interventions (
  id                uuid    primary key default gen_random_uuid(),
  teacher_id        uuid    not null references auth.users(id) on delete cascade,
  class_id          uuid    references classes(id) on delete set null,
  concept_id        uuid    references concepts(id) on delete set null,
  intervention_type text    not null check (intervention_type in (
    'prerequisite_review','misconception_correction','guided_practice',
    'support_version','extension_version','practical_application','short_reassessment'
  )),
  title             text    not null,
  content           jsonb,
  ai_generated      boolean default false,
  status            text    default 'draft' check (status in (
    'draft','assigned','completed','ignored'
  )),
  assigned_to       jsonb,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index teacher_interventions_teacher_idx on teacher_interventions(teacher_id);
create index teacher_interventions_class_idx   on teacher_interventions(class_id);

alter table teacher_interventions enable row level security;

create policy "Teachers manage own interventions"
  on teacher_interventions
  using (auth.uid() = teacher_id);

create policy "Admins manage all interventions"
  on teacher_interventions
  using (auth.jwt() ->> 'role' = 'admin');

create or replace function update_teacher_interventions_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger teacher_interventions_updated_at
  before update on teacher_interventions
  for each row execute procedure update_teacher_interventions_updated_at();
