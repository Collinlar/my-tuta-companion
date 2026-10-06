-- Skills taxonomy: the nine skill categories across all STEM subjects.
create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in (
    'Recall','Concept Knowledge','Calculation','Formula Selection',
    'Interpretation','Reasoning','Application','Practical Thinking','Communication'
  )),
  description text,
  subject text
);

insert into skills (name, category, description) values
  ('Recall key facts',            'Recall',             'Remember definitions, formulas, and facts without prompting'),
  ('Define terms accurately',     'Concept Knowledge',  'State the precise meaning of STEM terminology'),
  ('Perform calculations',        'Calculation',        'Execute numerical procedures correctly'),
  ('Select appropriate formula',  'Formula Selection',  'Choose the right formula or method for a given problem'),
  ('Interpret data or graphs',    'Interpretation',     'Read and draw meaning from tables, charts, and graphs'),
  ('Construct logical argument',  'Reasoning',          'Build a valid chain of reasoning from evidence'),
  ('Apply to new context',        'Application',        'Use a learned concept in an unfamiliar situation'),
  ('Plan and conduct practical',  'Practical Thinking', 'Design an experiment or practical activity'),
  ('Communicate findings',        'Communication',      'Present results and conclusions clearly and accurately');

-- Join table linking concepts to skills.
create table concept_skills (
  concept_id uuid not null references concepts(id) on delete cascade,
  skill_id   uuid not null references skills(id)   on delete cascade,
  primary key (concept_id, skill_id)
);

alter table skills enable row level security;
alter table concept_skills enable row level security;

create policy "Authenticated read skills"
  on skills for select
  using (auth.role() = 'authenticated');

create policy "Admins manage skills"
  on skills
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Authenticated read concept_skills"
  on concept_skills for select
  using (auth.role() = 'authenticated');

create policy "Admins manage concept_skills"
  on concept_skills
  using (auth.jwt() ->> 'role' = 'admin');
