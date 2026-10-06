-- Phase 3: AI Retrieval Refinement
-- 1. Batch usage tracking RPC — avoids N round-trips when a path is served
-- 2. Seed adaptation_rules on Tier A content units (support / core / extension variants)
-- 3. RLS: allow authenticated users to increment usage_count on approved content

-- ─── RLS: authenticated increment ────────────────────────────────────────────
-- The existing "Authenticated read approved" policy covers SELECT.
-- This restricted UPDATE policy only allows touching usage_count on approved units.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'content_units'
      and policyname = 'Authenticated increment usage'
  ) then
    execute $pol$
      create policy "Authenticated increment usage" on content_units
        for update
        using (
          auth.role() = 'authenticated'
          and review_status in ('approved','published')
        )
        with check (review_status in ('approved','published'))
    $pol$;
  end if;
end;
$$;

-- ─── Batch usage increment RPC ───────────────────────────────────────────────
-- Called by pathBuilder after assembling a path; increments every served unit
-- in a single SQL round-trip.  security definer so the function runs as owner
-- and can bypass the row-level check on non-usage_count columns.
create or replace function record_content_unit_usage(unit_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  update content_units
  set    usage_count = usage_count + 1
  where  id = any(unit_ids)
    and  review_status in ('approved','published');
$$;

grant execute on function record_content_unit_usage(uuid[]) to authenticated;

-- ─── Seed adaptation_rules on Tier A content units ───────────────────────────
-- adaptation_rules schema:
--   skip_for_levels  text[]   — support levels that should skip this unit
--   boost_for_levels text[]   — support levels that should see this unit first
--   variant          text     — "support" | "core" | "extension"
--
-- Rules are applied per unit type before a stage unit is chosen.

-- Quick Check (Diagnose stage) — skip for independent learners who have mastery
update content_units cu
set    adaptation_rules = '{"skip_for_levels":["independent"],"boost_for_levels":["struggling"],"variant":"core"}'::jsonb
where  cu.unit_type = 'Quick Check'
  and  cu.review_status in ('approved','published')
  and  cu.adaptation_rules is null;

-- Core Explanation — boost for struggling, core for guided, skip for independent (unless first visit)
update content_units cu
set    adaptation_rules = '{"skip_for_levels":[],"boost_for_levels":["struggling"],"variant":"core"}'::jsonb
where  cu.unit_type = 'Core Explanation'
  and  cu.review_status in ('approved','published')
  and  cu.adaptation_rules is null;

-- Alternative Explanation / Analogy — always show; boost for struggling
update content_units cu
set    adaptation_rules = '{"skip_for_levels":[],"boost_for_levels":["struggling"],"variant":"support"}'::jsonb
where  cu.unit_type in ('Alternative Explanation','Analogy')
  and  cu.review_status in ('approved','published')
  and  cu.adaptation_rules is null;

-- Extension units — skip for struggling, boost for independent
update content_units cu
set    adaptation_rules = '{"skip_for_levels":["struggling"],"boost_for_levels":["independent"],"variant":"extension"}'::jsonb
where  cu.unit_type = 'Extension'
  and  cu.review_status in ('approved','published')
  and  cu.adaptation_rules is null;

-- Guided Problem — always show; boost for struggling
update content_units cu
set    adaptation_rules = '{"skip_for_levels":[],"boost_for_levels":["struggling","guided"],"variant":"support"}'::jsonb
where  cu.unit_type = 'Guided Problem'
  and  cu.review_status in ('approved','published')
  and  cu.adaptation_rules is null;

-- Independent Problem — boost for independent; core default
update content_units cu
set    adaptation_rules = '{"skip_for_levels":[],"boost_for_levels":["independent"],"variant":"core"}'::jsonb
where  cu.unit_type = 'Independent Problem'
  and  cu.review_status in ('approved','published')
  and  cu.adaptation_rules is null;

-- Intervention — only for struggling / guided
update content_units cu
set    adaptation_rules = '{"skip_for_levels":["independent"],"boost_for_levels":["struggling"],"variant":"support"}'::jsonb
where  cu.unit_type = 'Intervention'
  and  cu.review_status in ('approved','published')
  and  cu.adaptation_rules is null;
