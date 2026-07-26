-- =====================================================================
-- mytuta STEM mastery — starter-data provisioning
-- provision_starter_data() is called by the app after onboarding. It
-- creates the caller's own starter rows from templates so screens look
-- populated with real, owned data. Idempotent per user.
-- Apply AFTER 20260720090100_mytuta_seed_content.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.provision_starter_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  role text;
  photo_id uuid;
  path_id uuid;
  cls1 uuid;
  cls2 uuid;
  cls3 uuid;
  cls4 uuid;
BEGIN
  IF uid IS NULL THEN
    RETURN;
  END IF;

  SELECT user_type INTO role FROM public.profiles WHERE user_id = uid;
  IF role IS NULL THEN role := 'student'; END IF;

  -- =================================================================
  -- TEACHER
  -- =================================================================
  IF role = 'teacher' THEN
    IF EXISTS (SELECT 1 FROM public.teacher_stats WHERE teacher_id = uid) THEN
      RETURN; -- already provisioned
    END IF;

    INSERT INTO public.classes (teacher_id, name, subject, year_group, color, mark)
      VALUES (uid, 'Form 2 Integrated Science', 'Integrated Science', 'Form 2', '#2e9e6b', 'F2') RETURNING id INTO cls1;
    INSERT INTO public.classes (teacher_id, name, subject, year_group, color, mark)
      VALUES (uid, 'Form 3 Mathematics', 'Mathematics', 'Form 3', '#3f8fc4', 'F3') RETURNING id INTO cls2;
    INSERT INTO public.classes (teacher_id, name, subject, year_group, color, mark)
      VALUES (uid, 'Form 1 General Science', 'General Science', 'Form 1', '#6b5aa8', 'F1') RETURNING id INTO cls3;
    INSERT INTO public.classes (teacher_id, name, subject, year_group, color, mark)
      VALUES (uid, 'Form 4 Chemistry', 'Chemistry', 'Form 4', '#c47a17', 'F4') RETURNING id INTO cls4;

    INSERT INTO public.class_students (class_id, display_name, mark, color, current_concept, stage, mastery_level) VALUES
      (cls1, 'Abena Owusu', 'AO', '#2e9e6b', 'Respiration', 'Mastery check', 'Secure'),
      (cls1, 'Kwame Asante', 'KA', '#3f8fc4', 'Respiration', 'Guided practice', 'Developing'),
      (cls1, 'Efua Mensah', 'EM', '#6b5aa8', 'Respiration', 'Understand', 'Beginning'),
      (cls1, 'Yaw Boateng', 'YB', '#c47a17', 'Respiration', 'Apply', 'Mastered'),
      (cls1, 'Adjoa Darko', 'AD', '#2e9e6b', 'Respiration', 'Independent', 'Secure'),
      (cls2, 'Kofi Adjei', 'KA', '#3f8fc4', 'Linear equations', 'Guided practice', 'Developing'),
      (cls2, 'Ama Boadu', 'AB', '#2e9e6b', 'Linear equations', 'Independent', 'Secure'),
      (cls2, 'Nana Yaa', 'NY', '#6b5aa8', 'Linear equations', 'Understand', 'Beginning'),
      (cls2, 'Kojo Tetteh', 'KT', '#c47a17', 'Linear equations', 'Mastery check', 'Mastered'),
      (cls3, 'Esi Amoah', 'EA', '#2e9e6b', 'Forces', 'Understand', 'Developing'),
      (cls3, 'Kwabena Osei', 'KO', '#3f8fc4', 'Forces', 'Guided practice', 'Secure'),
      (cls3, 'Akosua Frimpong', 'AF', '#6b5aa8', 'Forces', 'Independent', 'Secure'),
      (cls4, 'Yaw Danso', 'YD', '#c47a17', 'The mole concept', 'Understand', 'Beginning'),
      (cls4, 'Abena Sarpong', 'AS', '#2e9e6b', 'The mole concept', 'Guided practice', 'Developing');

    INSERT INTO public.learning_experiences (teacher_id, title, subject, form, status, cover, tags, stages_count) VALUES
      (uid, 'The respiratory system', 'Science', 'Integrated Science · Form 2', 'published', 'linear-gradient(135deg,#2e9e6b,#1f7d53)', ARRAY['Form 2','Household lab'], 8),
      (uid, 'Linear equations', 'Maths', 'Mathematics · Form 3', 'published', 'linear-gradient(135deg,#3f8fc4,#2f6f9e)', ARRAY['Form 3','No equipment'], 7),
      (uid, 'Photosynthesis', 'Science', 'Integrated Science · Form 2', 'draft', 'linear-gradient(135deg,#6b5aa8,#463880)', ARRAY['Form 2'], 8),
      (uid, 'The mole concept', 'Chemistry', 'Chemistry · Form 4', 'draft', 'linear-gradient(135deg,#c47a17,#9c6012)', ARRAY['Form 4','Lab'], 6),
      (uid, 'Ratios and proportion', 'Maths', 'Mathematics · Form 2', 'published', 'linear-gradient(135deg,#2e9e6b,#3f8fc4)', ARRAY['Form 2'], 7),
      (uid, 'Forces and motion', 'Physics', 'Physics · Form 3', 'published', 'linear-gradient(135deg,#3f8fc4,#6b5aa8)', ARRAY['Form 3','Device'], 8);

    INSERT INTO public.assessments (teacher_id, class_id, type, title, class_label, status, submitted, total, avg_level, distribution) VALUES
      (uid, cls1, 'Mastery', 'Respiration mastery check', 'Form 2 Sci', 'assigned', 29, 32, 'Developing',
        '[{"l":"Mastered","v":6,"c":"#6b5aa8"},{"l":"Secure","v":11,"c":"#2e9e6b"},{"l":"Developing","v":9,"c":"#3f8fc4"},{"l":"Beginning","v":3,"c":"#c47a17"}]'::jsonb),
      (uid, NULL, 'Topic', 'Ratios topic test', 'Form 2 Maths', 'assigned', 30, 32, 'Secure',
        '[{"l":"Mastered","v":9,"c":"#6b5aa8"},{"l":"Secure","v":13,"c":"#2e9e6b"},{"l":"Developing","v":6,"c":"#3f8fc4"},{"l":"Beginning","v":2,"c":"#c47a17"}]'::jsonb),
      (uid, NULL, 'Exam-style', 'WASSCE-style Maths paper', 'Form 3 Maths', 'assigned', 26, 28, 'Developing',
        '[{"l":"Mastered","v":4,"c":"#6b5aa8"},{"l":"Secure","v":8,"c":"#2e9e6b"},{"l":"Developing","v":10,"c":"#3f8fc4"},{"l":"Beginning","v":4,"c":"#c47a17"}]'::jsonb),
      (uid, NULL, 'Mastery', 'Forces mastery check', 'Form 3 Sci', 'assigned', 27, 28, 'Secure',
        '[{"l":"Mastered","v":8,"c":"#6b5aa8"},{"l":"Secure","v":12,"c":"#2e9e6b"},{"l":"Developing","v":6,"c":"#3f8fc4"},{"l":"Beginning","v":1,"c":"#c47a17"}]'::jsonb);

    INSERT INTO public.teacher_insights (teacher_id, concept, pct_label, detail) VALUES
      (uid, 'Density', '48% affected', 'Students recall the formula but choose the wrong units when applying it.'),
      (uid, 'Photosynthesis', '39% affected', 'Can label the leaf but cannot explain the role of chlorophyll.'),
      (uid, 'Linear equations', '31% affected', 'Method error: they move terms without changing the sign.'),
      (uid, 'Ratios', '27% affected', 'They add quantities instead of scaling them proportionally.');

    INSERT INTO public.teacher_stats (teacher_id, active_classes, students, reaching_secure, concepts_taught, class_skills)
      VALUES (uid, 3, 119, 71, 12,
        '[{"name":"Recall","pct":81,"color":"#2e9e6b"},{"name":"Calculation","pct":68,"color":"#2e9e6b"},{"name":"Reasoning","pct":63,"color":"#3f8fc4"},{"name":"Application","pct":44,"color":"#c47a17"},{"name":"Practical thinking","pct":52,"color":"#3f8fc4"}]'::jsonb);

    RETURN;
  END IF;

  -- =================================================================
  -- STUDENT
  -- =================================================================
  IF EXISTS (SELECT 1 FROM public.learner_stats WHERE user_id = uid) THEN
    RETURN; -- already provisioned
  END IF;

  SELECT id INTO photo_id FROM public.concepts WHERE slug = 'photosynthesis';

  INSERT INTO public.mastery_paths (user_id, concept_id, concept_name, subject, current_stage, stage_label, pct, level, color, next_action) VALUES
    (uid, (SELECT id FROM public.concepts WHERE slug = 'linear-equations'), 'Linear equations', 'Mathematics', 4, 'Guided practice', 62, 'Developing', '#3f8fc4', 'Solve three questions without hints'),
    (uid, (SELECT id FROM public.concepts WHERE slug = 'density'), 'Density', 'Physics', 5, 'Independent practice', 78, 'Secure', '#6b5aa8', 'Try mixed application questions');

  INSERT INTO public.mastery_paths (user_id, concept_id, concept_name, subject, current_stage, stage_label, pct, level, color, next_action)
    VALUES (uid, photo_id, 'Photosynthesis', 'General Science', 1, 'Understand', 22, 'Beginning', '#2e9e6b', 'Continue understanding')
    RETURNING id INTO path_id;

  INSERT INTO public.path_stage_progress (path_id, ord, state)
    SELECT path_id, gs,
      CASE WHEN gs < 1 THEN 'done' WHEN gs = 1 THEN 'current' ELSE 'not_started' END
    FROM generate_series(0, 7) AS gs;

  INSERT INTO public.mastery_profiles (user_id, concept_id, concept_name, subject, overall_state, concept_knowledge, procedural_fluency, recall, reasoning, application) VALUES
    (uid, (SELECT id FROM public.concepts WHERE slug = 'fractions'), 'Fractions', 'Maths', 'Mastered', 90, 88, 92, 85, 80),
    (uid, (SELECT id FROM public.concepts WHERE slug = 'density'), 'Density', 'Physics', 'Secure', 80, 75, 78, 79, 70),
    (uid, (SELECT id FROM public.concepts WHERE slug = 'linear-equations'), 'Linear equations', 'Maths', 'Developing', 62, 58, 60, 55, 50),
    (uid, photo_id, 'Photosynthesis', 'Science', 'Developing', 82, 58, 34, 80, 34),
    (uid, (SELECT id FROM public.concepts WHERE slug = 'chemical-bonding'), 'Chemical bonding', 'Chemistry', 'Beginning', 30, 25, 28, 26, 20);

  INSERT INTO public.learner_stats (user_id, mastered, developing, accuracy, streak, skills)
    VALUES (uid, 7, 4, 86, 9,
      '[{"name":"Recall","pct":84},{"name":"Calculation","pct":72},{"name":"Reasoning","pct":79},{"name":"Application","pct":48},{"name":"Practical thinking","pct":55},{"name":"Communication","pct":66}]'::jsonb);

  INSERT INTO public.student_assignments (user_id, title, teacher_name, subject, due, status, status_color, icon, color) VALUES
    (uid, 'Respiration: understand + recall', 'Mr Owusu', 'Science', 'Fri', 'In progress', '#c47a17', '▤', '#2e9e6b'),
    (uid, 'Ratios mastery check', 'Mrs Mensah', 'Maths', 'Mon', 'Not started', '#9a927f', '◉', '#3f8fc4');
END;
$$;

GRANT EXECUTE ON FUNCTION public.provision_starter_data() TO authenticated;
