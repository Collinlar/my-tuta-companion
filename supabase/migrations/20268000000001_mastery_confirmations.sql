-- Gate 2: delayed mastery confirmation
-- A single unseen application question stored at Mastery Check completion,
-- surfaced 48–72 hours later. Correct → "Secured". Wrong → back to "In progress".

create table if not exists mastery_confirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id uuid references concepts(id),
  concept_name text not null,
  subject text,
  path_id uuid references mastery_paths(id) on delete cascade,
  question jsonb not null,
  -- question shape: {prompt, options:[4], correctIndex, explanation}
  scheduled_for timestamptz not null,
  answered_at timestamptz,
  correct boolean,
  created_at timestamptz default now()
);

create index mastery_confirmations_user_due
  on mastery_confirmations(user_id, scheduled_for)
  where answered_at is null;

alter table mastery_confirmations enable row level security;

create policy "Students manage own confirmations"
  on mastery_confirmations
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins full access to confirmations"
  on mastery_confirmations
  using (auth.jwt() ->> 'role' = 'admin');
