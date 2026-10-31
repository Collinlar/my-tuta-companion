-- =====================================================================
-- Mastery Depth: Next-Best-Action §32.8 relevant lab candidate.
--
-- 20270000000011 left §32.8 "Relevant Lab" empty because lab_activities has no
-- structured concept link. This adds a high-precision candidate anyway: a
-- hands-on lab that builds APPLIED depth for a concept the learner is already
-- secure at Foundation and could take deeper. The lab is matched by subject AND
-- a text reference to the concept (slug / title / demonstrates), and only when
-- the learner has NOT completed it (no 'lab' depth_evidence for that lab). If
-- nothing matches, no candidate fires — it never recommends a generic
-- same-subject lab. It slots at §32.8, below next-depth readiness and the goal,
-- above the challenge. Full CREATE OR REPLACE carried over verbatim from
-- 20270000000011 with only the lab block added.
--
-- Body uses SELECT ... INTO, so apply via psql / `supabase db push`, NOT the
-- dashboard SQL editor. Apply AFTER 20270000000011_nba_section32_reorder.sql.
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

  -- ── §32.1 Urgent teacher work ─────────────────────────────────────────────
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

  -- ── §32.2 Active Depth Journey ────────────────────────────────────────────
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

  -- ── §32.3 Blocking prerequisite ───────────────────────────────────────────
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

  -- ── §32.4 Required reinforcement ──────────────────────────────────────────
  -- A depth that passed but is not secure.
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

  -- The current explanation keeps failing: offer another approach.
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

  -- A repeated mistake category: targeted remediation.
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

  -- ── §32.5 Retention due ───────────────────────────────────────────────────
  -- A secured depth whose retention review is due (protect mastery).
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

  -- Recall cards due across everything studied.
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

  -- A concept whose mastery has decayed: bring it back.
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

  -- ── §32.6 Next depth readiness (go deeper) ────────────────────────────────
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

  -- ── §32.7 Learner goal ────────────────────────────────────────────────────
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

  -- ── §32.8 Relevant Lab ────────────────────────────────────────────────────
  -- A hands-on lab that builds Applied depth for a concept the learner is secure
  -- at Foundation but could take deeper. Matched by subject AND a text reference
  -- to the concept, and only if not already completed, so it stays relevant
  -- rather than a generic same-subject suggestion.
  select la.id as lab_id, la.title as lab_title, c.name as concept_name
  into r
  from public.concept_depth_mastery cdm
  join public.concepts c on c.id = cdm.concept_id
  join public.lab_activities la
    on la.subject is not distinct from c.subject
    and (
      la.slug ilike '%' || c.slug || '%'
      or la.title ilike '%' || c.name || '%'
      or coalesce(la.demonstrates, '') ilike '%' || c.name || '%'
    )
  where cdm.user_id = v_uid
    and cdm.depth = 'foundation'
    and cdm.state = 'secure'
    and (case coalesce(c.max_depth,'foundation') when 'applied' then 2 when 'advanced' then 3 else 1 end) >= 2
    and not exists (
      select 1 from public.depth_evidence de
      where de.user_id = v_uid and de.source_type = 'lab' and de.source_id = la.id::text
    )
  order by cdm.updated_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'relevant_lab',
      'action',      'Try the ' || r.lab_title || ' lab',
      'reason',      'You are secure in ' || r.concept_name || '. This hands-on lab puts it to work and builds your Applied depth.',
      'route',       '/student/lab',
      'est_minutes', 25
    );
  end if;

  -- ── §32.9 Relevant Challenge ──────────────────────────────────────────────
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

  -- ── §32.10 Exploration (fallback) ─────────────────────────────────────────
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
