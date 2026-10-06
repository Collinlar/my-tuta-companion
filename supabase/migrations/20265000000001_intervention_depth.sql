-- Phase 5: Teacher Intervention Depth
-- 1. intervention_templates  — reusable teacher-authored intervention blueprints
-- 2. intervention_follow_ups — per-student assignment + pre/post outcome tracking
-- 3. teacher_interventions.template_id — optional source template reference
-- 4. class_misconception_summary(class_id) — groups patterns across a class
-- 5. save_intervention_as_template(intervention_id) — copies to templates
-- 6. record_intervention_outcome(follow_up_id, post_score) — stamps post result
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. intervention_templates ────────────────────────────────────────────────
create table if not exists public.intervention_templates (
  id                uuid        primary key default gen_random_uuid(),
  teacher_id        uuid        not null references auth.users(id) on delete cascade,
  title             text        not null,
  intervention_type text        not null check (intervention_type in (
    'prerequisite_review','misconception_correction','guided_practice',
    'support_version','extension_version','practical_application','short_reassessment'
  )),
  content           jsonb       not null default '{}'::jsonb,
  concept_id        uuid        references public.concepts(id) on delete set null,
  use_count         int         not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.intervention_templates enable row level security;

create policy "Teachers manage own templates" on public.intervention_templates
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create index if not exists tmpl_teacher_idx
  on public.intervention_templates (teacher_id, updated_at desc);

create trigger intervention_templates_updated_at
  before update on public.intervention_templates
  for each row execute function public.update_updated_at_column();

-- ── 2. intervention_follow_ups ───────────────────────────────────────────────
-- One row per (intervention, student). pre_score captured at assignment time;
-- post_score filled after the student completes a follow-up assessment.
create table if not exists public.intervention_follow_ups (
  id              uuid        primary key default gen_random_uuid(),
  intervention_id uuid        not null references public.teacher_interventions(id) on delete cascade,
  student_id      uuid        not null references auth.users(id) on delete cascade,
  assigned_at     timestamptz not null default now(),
  completed_at    timestamptz,
  pre_score       numeric,
  post_score      numeric,
  created_at      timestamptz not null default now(),
  unique (intervention_id, student_id)
);

alter table public.intervention_follow_ups enable row level security;

-- Teachers who own the intervention can read all follow-up rows for it.
create policy "Intervention teacher reads follow-ups" on public.intervention_follow_ups
  for select using (
    exists (
      select 1 from public.teacher_interventions ti
      where ti.id = intervention_id and ti.teacher_id = auth.uid()
    )
  );

-- Students see only their own rows.
create policy "Student own follow-up" on public.intervention_follow_ups
  for select using (student_id = auth.uid());

create policy "Student complete follow-up" on public.intervention_follow_ups
  for update using (student_id = auth.uid());

create index if not exists ifu_intervention_idx
  on public.intervention_follow_ups (intervention_id);

create index if not exists ifu_student_idx
  on public.intervention_follow_ups (student_id, assigned_at desc);

-- ── 3. teacher_interventions — add template_id back-reference ────────────────
alter table public.teacher_interventions
  add column if not exists template_id uuid references public.intervention_templates(id) on delete set null;

-- ── 4. class_misconception_summary(p_class_id) RPC ──────────────────────────
-- Groups active misconception resolutions for students in a class.
-- Returns top patterns ranked by student_count descending.
create or replace function public.class_misconception_summary(p_class_id uuid)
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
declare
  v_uid       uuid := auth.uid();
  v_class_size int;
begin
  -- Verify the caller is a teacher/member of this class.
  if not exists (
    select 1 from public.classes c
    where c.id = p_class_id
      and (c.teacher_id = v_uid or exists (
        select 1 from public.class_students cs
        where cs.class_id = p_class_id and cs.student_id = v_uid
      ))
  ) then
    return '[]'::jsonb;
  end if;

  select count(distinct cs.student_id)
  into   v_class_size
  from   public.class_students cs
  where  cs.class_id = p_class_id;

  return coalesce((
    select jsonb_agg(row_to_json(t) order by t.student_count desc)
    from (
      select
        c.name                                          as concept_name,
        c.id                                            as concept_id,
        c.slug                                          as concept_slug,
        m.label                                         as pattern,
        m.detail                                        as detail,
        count(distinct mr.user_id)                      as student_count,
        case when v_class_size > 0
             then round(count(distinct mr.user_id)::numeric / v_class_size * 100)
             else 0
        end                                             as pct_of_class,
        -- average occurrence count as a severity signal
        round(avg(mr.occurrence_count))                 as avg_occurrences
      from public.misconception_resolutions mr
      join public.class_students cs   on cs.student_id = mr.user_id and cs.class_id = p_class_id
      join public.misconceptions m    on m.id = mr.misconception_id
      join public.concepts c          on c.id = mr.concept_id
      where mr.resolved_at is null          -- still active misconceptions only
        and mr.occurrence_count >= 2        -- seen at least twice per student
      group by c.name, c.id, c.slug, m.label, m.detail
      having count(distinct mr.user_id) >= 1
      order by count(distinct mr.user_id) desc
      limit 20
    ) t
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.class_misconception_summary(uuid) to authenticated;

-- ── 5. save_intervention_as_template(p_intervention_id) ─────────────────────
-- Copies an existing teacher_intervention into intervention_templates.
-- Increments template.use_count whenever another intervention is created from it.
create or replace function public.save_intervention_as_template(p_intervention_id uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_row  public.teacher_interventions%rowtype;
  v_tmpl_id uuid;
begin
  select * into v_row
  from   public.teacher_interventions
  where  id = p_intervention_id and teacher_id = v_uid;

  if not found then
    raise exception 'Intervention not found or access denied';
  end if;

  insert into public.intervention_templates
    (teacher_id, title, intervention_type, content, concept_id)
  values
    (v_uid, v_row.title, v_row.intervention_type, coalesce(v_row.content, '{}'::jsonb), v_row.concept_id)
  returning id into v_tmpl_id;

  -- Back-link the source intervention to this template.
  update public.teacher_interventions
  set    template_id = v_tmpl_id
  where  id = p_intervention_id;

  return v_tmpl_id;
end;
$$;

grant execute on function public.save_intervention_as_template(uuid) to authenticated;

-- ── 6. record_intervention_outcome(p_follow_up_id, p_post_score) ─────────────
-- Called after a student completes a follow-up assessment or check.
-- Stamps completed_at + post_score; allows the teacher to see improvement.
create or replace function public.record_intervention_outcome(
  p_follow_up_id uuid,
  p_post_score   numeric
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  -- Students record their own completion; teachers may also stamp it.
  update public.intervention_follow_ups
  set    post_score   = p_post_score,
         completed_at = coalesce(completed_at, now())
  where  id = p_follow_up_id
    and  (student_id = v_uid
          or exists (
            select 1 from public.teacher_interventions ti
            where ti.id = intervention_id and ti.teacher_id = v_uid
          ));
end;
$$;

grant execute on function public.record_intervention_outcome(uuid, numeric) to authenticated;
