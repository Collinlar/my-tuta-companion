-- =====================================================================
-- Mastery Depth: admin cross-concept cluster CRUD (PRD 23).
--
-- The concept_clusters / concept_cluster_members tables (20270000000008) were
-- seeded once and read-only under RLS. This adds the admin-gated, audited writers
-- the academic team uses to create, rename, retire and re-member clusters from
-- the admin panel, mirroring admin_set_concept_depth (SECURITY DEFINER, admin
-- check, admin_log). A learner's cluster depth is still DERIVED client-side from
-- member concepts; these functions only curate the grouping.
--
-- Several bodies use DML / RETURNING ... INTO, so apply with psql or
-- `supabase db push`, NOT the dashboard SQL editor (it mangles DML function
-- bodies). Apply AFTER 20270000000008_mastery_depth_clusters.sql.
-- =====================================================================

-- ── Read: clusters with their members (SELECT-only) ─────────────────────────
CREATE OR REPLACE FUNCTION public.admin_list_clusters()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $alc$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',          cl.id,
        'slug',        cl.slug,
        'name',        cl.name,
        'subject',     cl.subject,
        'description', cl.description,
        'members', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'subject', c.subject)
            ORDER BY c.name)
          FROM public.concept_cluster_members m
          JOIN public.concepts c ON c.id = m.concept_id
          WHERE m.cluster_id = cl.id
        ), '[]'::jsonb)
      )
      ORDER BY cl.name
    )
    FROM public.concept_clusters cl
  ), '[]'::jsonb);
END;
$alc$;

-- ── Create or rename a cluster ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_upsert_cluster(
  p_id uuid, p_slug text, p_name text, p_subject text, p_description text, p_reason text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $auc$
DECLARE v_id uuid;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF COALESCE(btrim(p_name), '') = '' THEN RAISE EXCEPTION 'name required'; END IF;
  IF COALESCE(btrim(p_slug), '') = '' THEN RAISE EXCEPTION 'slug required'; END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.concept_clusters (slug, name, subject, description)
    VALUES (btrim(p_slug), btrim(p_name), NULLIF(btrim(p_subject), ''), NULLIF(btrim(p_description), ''))
    RETURNING id INTO v_id;
    PERFORM public.admin_log('create_cluster', 'cluster', v_id::text, p_reason,
      NULL, jsonb_build_object('slug', btrim(p_slug), 'name', btrim(p_name)));
  ELSE
    UPDATE public.concept_clusters
    SET slug = btrim(p_slug),
        name = btrim(p_name),
        subject = NULLIF(btrim(p_subject), ''),
        description = NULLIF(btrim(p_description), '')
    WHERE id = p_id;
    v_id := p_id;
    PERFORM public.admin_log('update_cluster', 'cluster', v_id::text, p_reason,
      NULL, jsonb_build_object('slug', btrim(p_slug), 'name', btrim(p_name)));
  END IF;

  RETURN v_id;
END;
$auc$;

-- ── Delete a cluster (membership rows cascade) ──────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_delete_cluster(p_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $adc$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  DELETE FROM public.concept_clusters WHERE id = p_id;
  PERFORM public.admin_log('delete_cluster', 'cluster', p_id::text, p_reason, NULL, NULL);
END;
$adc$;

-- ── Replace a cluster's membership ──────────────────────────────────────────
-- Only real concept ids are inserted, so a stale id is skipped rather than
-- raising a foreign-key error.
CREATE OR REPLACE FUNCTION public.admin_set_cluster_members(
  p_cluster_id uuid, p_concept_ids uuid[], p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $acm$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.concept_clusters WHERE id = p_cluster_id) THEN
    RAISE EXCEPTION 'cluster not found';
  END IF;

  DELETE FROM public.concept_cluster_members WHERE cluster_id = p_cluster_id;

  INSERT INTO public.concept_cluster_members (cluster_id, concept_id)
  SELECT p_cluster_id, c.id
  FROM public.concepts c
  WHERE c.id = ANY(p_concept_ids)
  ON CONFLICT (cluster_id, concept_id) DO NOTHING;

  PERFORM public.admin_log('set_cluster_members', 'cluster', p_cluster_id::text, p_reason,
    NULL, jsonb_build_object('count', COALESCE(array_length(p_concept_ids, 1), 0)));
END;
$acm$;

GRANT EXECUTE ON FUNCTION public.admin_list_clusters() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_cluster(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_cluster(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_cluster_members(uuid, uuid[], text) TO authenticated;
