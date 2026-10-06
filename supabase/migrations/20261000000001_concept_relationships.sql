-- Typed relationships between concepts, replacing the flat related_areas text[] column.
create table concept_relationships (
  id uuid primary key default gen_random_uuid(),
  source_concept_id uuid not null references concepts(id) on delete cascade,
  target_concept_id uuid not null references concepts(id) on delete cascade,
  relationship_type text not null check (relationship_type in (
    'prerequisite_of','builds_on','related_to','applied_in',
    'extension_of','commonly_confused_with','assessed_by','used_in_lab','used_in_challenge'
  )),
  strength text default 'strong' check (strength in ('strong','moderate','weak')),
  notes text,
  created_at timestamptz default now()
);

create unique index concept_relationships_unique
  on concept_relationships(source_concept_id, target_concept_id, relationship_type);

alter table concept_relationships enable row level security;

create policy "Admins manage relationships"
  on concept_relationships
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Authenticated read relationships"
  on concept_relationships for select
  using (auth.role() = 'authenticated');
