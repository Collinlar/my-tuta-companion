-- =====================================================================
-- mytuta: self-service account deletion
--  * profiles already carries school/grade/subjects/goals/parent_contact/
--    teaching_experience (added by 20250115000000_add_profile_fields.sql),
--    so no schema change is needed for profile editing itself.
--  * delete_my_account() lets a signed-in user remove their own auth.users
--    row. Every mytuta table that references auth.users(id) was created
--    with ON DELETE CASCADE (classes, mastery_paths, class_students,
--    learning_experiences, assessments, notifications, recall_cards, etc.),
--    so this one delete cleans up everything the user owns.
-- Apply AFTER 20260720170000_mytuta_recall_cards.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
