-- =====================================================================
-- Mastery Depth: Next-Best-Action depth candidates.
--
-- Adds three depth-aware recommendations to next_best_action, reusing the
-- existing candidate engine and keeping the relative order of the non-depth
-- candidates unchanged:
--   * protect_mastery  — a secured depth whose retention review is due
--   * strengthen_first — a depth that passed but is not secure (needs_reinforcement)
--   * go_deeper        — a secured depth with a deeper level available, not yet begun
-- Full CREATE OR REPLACE (plpgsql cannot be patched in place). Apply AFTER
-- 20270000000003_mytuta_per_depth_stages.sql.
-- =====================================================================

create or replace function public.next_best_action()
returns jsonb
language plpgsql security definer set search_path = public stable
as $nba$
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

  -- ── 0b. Decayed mastery ───────────────────────────────────────────────────
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

  -- ── 0d. Depth retention review due (protect mastery) ──────────────────────
  select c.name as concept_name, c.slug, cdm.depth
  into r
  from public.concept_depth_mastery cdm
  join public.concepts c on c.id = cdm.concept_id
  where cdm.user_id = v_uid
    and cdm.state = 'secure'
    and cdm.next_review_at is not null
    and cdm.next_review_at <= now()
  order by cdm.next_review_at asc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'protect_mastery',
      'action',      'Protect your ' || r.concept_name || ' mastery',
      'reason',      'A short retention check keeps ' || initcap(r.depth) || ' mastery of ' || r.concept_name || ' secure.',
      'route',       '/student/learn?concept=' || r.slug || '&view=overview',
      'est_minutes', 4
    );
  end if;

  -- ── 0c. Explanation not working ───────────────────────────────────────────
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

  -- ── Required reinforcement: a depth that passed but is not secure ─────────
  select c.name as concept_name, c.slug, cdm.depth
  into r
  from public.concept_depth_mastery cdm
  join public.concepts c on c.id = cdm.concept_id
  where cdm.user_id = v_uid
    and cdm.state = 'needs_reinforcement'
  order by cdm.updated_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'strengthen_first',
      'action',      'Strengthen ' || r.concept_name || ' before going deeper',
      'reason',      'You got through ' || r.concept_name || ' but a few areas are still shaky. A short reinforcement will lock it in.',
      'route',       '/student/learn?concept=' || r.slug || '&view=overview',
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

  -- ── Next-depth readiness (go deeper) ──────────────────────────────────────
  select c.name as concept_name, c.slug, cdm.depth as done_depth,
    (case cdm.depth when 'foundation' then 'applied' when 'applied' then 'advanced' end) as next_depth
  into r
  from public.concept_depth_mastery cdm
  join public.concepts c on c.id = cdm.concept_id
  where cdm.user_id = v_uid
    and cdm.state = 'secure'
    and (case cdm.depth when 'foundation' then 1 when 'applied' then 2 else 3 end)
        < (case coalesce(c.max_depth,'foundation') when 'foundation' then 1 when 'applied' then 2 else 3 end)
    and not exists (
      select 1 from public.concept_depth_mastery nx
      where nx.user_id = v_uid and nx.concept_id = cdm.concept_id
        and nx.depth = (case cdm.depth when 'foundation' then 'applied' when 'applied' then 'advanced' end)
    )
  order by cdm.updated_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'go_deeper',
      'action',      'Go deeper: ' || initcap(r.next_depth) || ' in ' || r.concept_name,
      'reason',      r.concept_name || ' is secure at ' || initcap(r.done_depth) || '. You are ready to use it in harder, more realistic problems.',
      'route',       '/student/learn?concept=' || r.slug || '&view=overview',
      'est_minutes', 18
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

  -- ── 6. Mastery-linked challenge ───────────────────────────────────────────
  select ch.title as challenge_title, ch.id as challenge_id, mp2.concept_name
  into r
  from public.challenges ch
  cross join lateral (
    select concept_name from public.mastery_profiles
    where user_id = v_uid and overall_state in ('Secure', 'Mastered')
    order by updated_at desc limit 1
  ) mp2
  where ch.created_by is null
    and not exists (
      select 1 from public.challenge_submissions cs
      where cs.challenge_id = ch.id
        and cs.user_id = v_uid
        and cs.status = 'submitted'
    )
  order by ch.created_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'challenge',
      'action',      'Take on the ' || r.challenge_title || ' challenge',
      'reason',      'You have a strong grasp of ' || r.concept_name || '. This challenge puts that knowledge to work in a real problem.',
      'route',       '/student/challenges',
      'challenge_id', r.challenge_id,
      'est_minutes', 30
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
$nba$;

grant execute on function public.next_best_action() to authenticated;
