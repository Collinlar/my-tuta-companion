-- Phase 4: Intelligence Expansion
-- 1. mastery_profiles — add last_successful_attempt_at + decayed_at (forgetting model)
-- 2. explanation_effectiveness — tracks pass/fail after each explanation unit
-- 3. apply_mastery_decay()  — callable function that decays mastery states
-- 4. record_explanation_result() — student-callable RPC
-- 5. learner_model()  — adds decayed flag + last_practice per concept entry
-- 6. next_best_action() — adds decay_review + explanation_weak signals
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. mastery_profiles columns ──────────────────────────────────────────────
alter table public.mastery_profiles
  add column if not exists last_successful_attempt_at timestamptz,
  add column if not exists decayed_at                  timestamptz;

create index if not exists mp_decay_idx
  on public.mastery_profiles (user_id, last_successful_attempt_at)
  where last_successful_attempt_at is not null;

-- ── 2. explanation_effectiveness ─────────────────────────────────────────────
create table if not exists public.explanation_effectiveness (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  content_unit_id uuid        not null references public.content_units(id) on delete cascade,
  concept_id      uuid        references public.concepts(id) on delete set null,
  passed          boolean     not null,
  created_at      timestamptz not null default now()
);

alter table public.explanation_effectiveness enable row level security;

create policy "own explanation results" on public.explanation_effectiveness
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists ee_unit_idx
  on public.explanation_effectiveness (user_id, content_unit_id, created_at desc);

-- ── 3. apply_mastery_decay(p_uid) ────────────────────────────────────────────
-- Decay schedule (forgetting curve):
--   Secure     → Established  if not practised for 14 days
--   Established → Developing  if not practised for 30 days
--   Developing → Beginning    if not practised for 60 days
-- Sets decayed_at so NBA and learner_model can surface "needs review".
create or replace function public.apply_mastery_decay(p_uid uuid default auth.uid())
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_count int;
begin
  if p_uid is null then return 0; end if;

  with to_decay as (
    select id,
      case
        when overall_state = 'Secure'
             and (last_successful_attempt_at is null
                  or last_successful_attempt_at < now() - interval '14 days')
          then 'Established'
        when overall_state = 'Established'
             and (last_successful_attempt_at is null
                  or last_successful_attempt_at < now() - interval '30 days')
          then 'Developing'
        when overall_state = 'Developing'
             and (last_successful_attempt_at is null
                  or last_successful_attempt_at < now() - interval '60 days')
          then 'Beginning'
        else null
      end as new_state
    from public.mastery_profiles
    where user_id = p_uid
      and overall_state in ('Secure','Established','Developing')
  )
  update public.mastery_profiles mp
  set    overall_state = td.new_state,
         decayed_at    = now()
  from   to_decay td
  where  mp.id = td.id
    and  td.new_state is not null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.apply_mastery_decay(uuid) to authenticated;

-- ── 4. record_explanation_result() ──────────────────────────────────────────
-- Called by the frontend after a practice attempt that followed an explanation.
-- Also updates last_successful_attempt_at on the concept's mastery_profile when passed.
create or replace function public.record_explanation_result(
  p_content_unit_id uuid,
  p_passed          boolean,
  p_concept_id      uuid default null
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then return; end if;

  insert into public.explanation_effectiveness
    (user_id, content_unit_id, concept_id, passed)
  values
    (v_uid, p_content_unit_id, p_concept_id, p_passed);

  -- Stamp successful practice on the mastery profile (enables forgetting curve).
  if p_passed and p_concept_id is not null then
    update public.mastery_profiles
    set    last_successful_attempt_at = now(),
           decayed_at                 = null
    where  user_id    = v_uid
      and  concept_id = p_concept_id;
  end if;
end;
$$;

grant execute on function public.record_explanation_result(uuid, boolean, uuid) to authenticated;

-- ── 5. learner_model() — adds decayed + last_practice per concept ─────────────
create or replace function public.learner_model()
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
declare
  v_uid        uuid := auth.uid();
  v_prof       record;
  v_lp         record;
  v_skills     jsonb;
  v_top_mistake text;
begin
  if v_uid is null then return '{}'::jsonb; end if;

  select learning_stage, subjects, goals, onboarding_answers into v_prof
  from public.profiles where user_id = v_uid;

  select support_level, prefs, corrections, summary into v_lp
  from public.learner_profile where user_id = v_uid;

  select jsonb_build_object(
    'recall',       coalesce(round(avg(recall) * 20), 0),
    'calculation',  coalesce(round(avg(procedural_fluency) * 20), 0),
    'reasoning',    coalesce(round(avg(reasoning) * 20), 0),
    'application',  coalesce(round(avg(application) * 20), 0),
    'knowledge',    coalesce(round(avg(concept_knowledge) * 20), 0)
  ) into v_skills
  from public.mastery_profiles where user_id = v_uid;

  select mistake_category into v_top_mistake
  from public.attempts
  where user_id = v_uid and mistake_category is not null
    and created_at >= now() - interval '60 days'
  group by mistake_category order by count(*) desc limit 1;

  return jsonb_build_object(
    'identity', jsonb_build_object(
      'learning_stage', v_prof.learning_stage,
      'subjects',       coalesce(to_jsonb(v_prof.subjects), '[]'::jsonb),
      'onboarding',     coalesce(v_prof.onboarding_answers, '{}'::jsonb)),
    'skills',     v_skills,
    'strengths',  coalesce((
      select jsonb_agg(label)
      from (select k as label from jsonb_each_text(v_skills) e(k, val) where val::int >= 70) s
    ), '[]'::jsonb),
    'challenges', coalesce((
      select jsonb_agg(label)
      from (select k as label from jsonb_each_text(v_skills) e(k, val) where val::int > 0 and val::int < 45) s
    ), '[]'::jsonb),
    'top_mistake', v_top_mistake,
    -- Phase 4: concept entries now include decayed flag and last_practice date.
    'concepts', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'concept',       mp.concept_name,
          'state',         mp.overall_state,
          'decayed',       (mp.decayed_at is not null and mp.decayed_at > now() - interval '30 days'),
          'last_practice', mp.last_successful_attempt_at
        )
        order by mp.updated_at desc
      )
      from public.mastery_profiles mp
      where mp.user_id = v_uid
    ), '[]'::jsonb),
    'goals', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'title', title, 'kind', kind, 'status', status) order by created_at desc)
      from public.student_goals where user_id = v_uid and status = 'active'
    ), '[]'::jsonb),
    'support_level', coalesce(v_lp.support_level, 'guided'),
    'prefs',         coalesce(v_lp.prefs,        '{}'::jsonb),
    'corrections',   coalesce(v_lp.corrections,  '{}'::jsonb),
    'summary',       v_lp.summary
  );
end;
$$;

grant execute on function public.learner_model() to authenticated;

-- ── 6. next_best_action() — adds decay_review + explanation_weak signals ─────
-- Rebuilds on the Phase 2 (20261000000008) version which already includes
-- the prerequisite_gap step at position 0.
create or replace function public.next_best_action()
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
declare
  v_uid     uuid := auth.uid();
  v_cands   jsonb := '[]'::jsonb;
  r         record;
  v_recall  int;
  v_paths   int;
  v_prereq  record;
begin
  if v_uid is null then return '{}'::jsonb; end if;

  -- ── 0. Prerequisite gap ───────────────────────────────────────────────────
  select
    mp.concept_name        as blocked_concept,
    c_pre.name             as prerequisite_name,
    c_pre.slug             as prerequisite_slug,
    mp.id                  as path_id
  into v_prereq
  from public.mastery_paths mp
  join public.concepts c_blocked on c_blocked.name = mp.concept_name
  join public.concept_relationships cr
    on cr.target_concept_id = c_blocked.id
    and cr.relationship_type = 'prerequisite_of'
  join public.concepts c_pre on c_pre.id = cr.source_concept_id
  left join public.mastery_profiles prof
    on prof.user_id = v_uid and prof.concept_id = c_pre.id
  where mp.user_id = v_uid
    and mp.status = 'active'
    and mp.pct < 30
    and (prof.id is null or prof.overall_state not in ('Secure','Mastered'))
  order by mp.updated_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',           'prerequisite_gap',
      'action',        'Learn ' || v_prereq.prerequisite_name || ' first',
      'reason',        'You are working on ' || v_prereq.blocked_concept || ', but it builds on ' || v_prereq.prerequisite_name || '. A quick foundation session will make the harder topic much easier.',
      'route',         '/student/learn?concept=' || v_prereq.prerequisite_slug,
      'est_minutes',   15,
      'blocked_concept', v_prereq.blocked_concept,
      'prerequisite',    v_prereq.prerequisite_name
    );
  end if;

  -- ── 0b. Decayed mastery — concept that recently slipped ───────────────────
  -- Surfaces one recently-decayed concept so the student knows to review it.
  select mp.concept_name, c.slug, mp.overall_state
  into r
  from public.mastery_profiles mp
  join public.concepts c on c.id = mp.concept_id
  where mp.user_id   = v_uid
    and mp.decayed_at is not null
    and mp.decayed_at > now() - interval '14 days'
    and mp.overall_state not in ('Mastered')
  order by mp.decayed_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'decay_review',
      'action',      'Refresh ' || r.concept_name || ' before it fades',
      'reason',      'It has been a while since you practised ' || r.concept_name || '. A short session will bring it back to ' || r.overall_state || '.',
      'route',       '/student/learn?concept=' || r.slug,
      'est_minutes', 10
    );
  end if;

  -- ── 0c. Explanation not working ───────────────────────────────────────────
  -- When the same explanation unit has 3+ fail results in 30 days, surface
  -- an alternative explanation action for that concept.
  select ee.content_unit_id, c.name as concept_name, c.slug, count(*) as fail_count
  into r
  from public.explanation_effectiveness ee
  join public.content_units cu on cu.id = ee.content_unit_id
  join public.concepts c on c.id = ee.concept_id
  where ee.user_id   = v_uid
    and ee.passed    = false
    and ee.created_at >= now() - interval '30 days'
  group by ee.content_unit_id, c.name, c.slug
  having count(*) >= 3
  order by count(*) desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'explanation_weak',
      'action',      'Try a different explanation for ' || r.concept_name,
      'reason',      'The current explanation for ' || r.concept_name || ' has not been clicking. mytuta has another approach that may work better for you.',
      'route',       '/student/learn?concept=' || r.slug || '&mode=alternative',
      'est_minutes', 8
    );
  end if;

  -- ── 1. Urgent teacher assignment ──────────────────────────────────────────
  select a.id, a.title, a.deadline, a.assessment_id, a.experience_id into r
  from public.assignments a
  join public.class_students cs on cs.class_id = a.class_id and cs.student_id = v_uid
  where a.deadline is not null
    and a.deadline >= current_date
    and a.deadline <= current_date + 5
    and (a.assessment_id is null or not exists (
          select 1 from public.assessment_submissions s
          where s.assessment_id = a.assessment_id and s.student_id = v_uid and s.submitted_at is not null))
    and (a.experience_id is null or not exists (
          select 1 from public.experience_progress ep
          where ep.experience_id = a.experience_id and ep.user_id = v_uid and ep.status = 'completed'))
  order by a.deadline asc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'assignment',
      'action',      'Complete your teacher''s assignment',
      'reason',      'Your teacher set "' || coalesce(r.title, 'an assignment') || '", due ' || to_char(r.deadline, 'Dy DD Mon') || '.',
      'route',       case
                       when r.assessment_id is not null then '/student/assessments/' || r.assessment_id
                       when r.experience_id is not null  then '/student/experiences/' || r.experience_id
                       else '/student/assignments'
                     end,
      'est_minutes', 20
    );
  end if;

  -- ── 2. Continue unfinished active Mastery Path ────────────────────────────
  select id, concept_name, stage_label, current_stage, pct into r
  from public.mastery_paths
  where user_id = v_uid and status = 'active' and coalesce(pct,0) < 100
  order by updated_at desc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'continue',
      'action',      'Continue ' || r.concept_name,
      'reason',      'You reached ' || coalesce(nullif(r.stage_label,''), 'stage ' || (r.current_stage + 1)) || ' (' || coalesce(r.pct,0) || '% done). Pick up where you stopped.',
      'route',       '/student/mastery/' || r.id,
      'est_minutes', 10
    );
  end if;

  -- ── 3. Recall cards due ───────────────────────────────────────────────────
  select count(*) into v_recall
  from public.recall_cards where user_id = v_uid and due_at <= current_date;

  if v_recall > 0 then
    v_cands := v_cands || jsonb_build_object(
      'key',         'recall',
      'action',      'Review ' || v_recall || ' item' || case when v_recall = 1 then '' else 's' end || ' before you forget',
      'reason',      'A short review keeps what you have already learned from slipping away.',
      'route',       '/student/review',
      'est_minutes', least(v_recall * 1, 10)
    );
  end if;

  -- ── 4. Repeated misconception ─────────────────────────────────────────────
  select mistake_category, count(*) as n into r
  from public.attempts
  where user_id = v_uid
    and mistake_category is not null
    and created_at >= now() - interval '30 days'
  group by mistake_category
  having count(*) >= 3
  order by count(*) desc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'misconception',
      'action',      'Target your ' || r.mistake_category || ' errors',
      'reason',      'You have made ' || r.n || ' ' || r.mistake_category || ' errors recently. A focused practice set will help.',
      'route',       '/student/solve',
      'est_minutes', 8
    );
  end if;

  -- ── 5. Active goal ────────────────────────────────────────────────────────
  select g.title, g.concept_id into r
  from public.student_goals g
  where g.user_id = v_uid and g.status = 'active'
  order by g.created_at desc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'goal',
      'action',      'Work toward: ' || r.title,
      'reason',      'This is a goal you set. A focused session moves you closer.',
      'route',       '/student/learn',
      'est_minutes', 12
    );
  end if;

  -- ── Fallback ──────────────────────────────────────────────────────────────
  select count(*) into v_paths from public.mastery_paths where user_id = v_uid;

  if v_paths = 0 then
    v_cands := v_cands || jsonb_build_object(
      'key',         'start',
      'action',      'Start your first Mastery Path',
      'reason',      'Pick a concept you want to understand and mytuta builds a path from a quick check to proven mastery.',
      'route',       '/student/learn',
      'est_minutes', 15
    );
  else
    v_cands := v_cands || jsonb_build_object(
      'key',         'explore',
      'action',      'Explore a new concept',
      'reason',      'You are up to date. Extend your learning with something new.',
      'route',       '/student/learn',
      'est_minutes', 12
    );
  end if;

  return jsonb_build_object(
    'primary',      v_cands->0,
    'alternatives', coalesce(
      (select jsonb_agg(e)
       from (select e from jsonb_array_elements(v_cands) with ordinality t(e, ord)
             where ord > 1 and ord <= 4) s
      ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.next_best_action() to authenticated;
