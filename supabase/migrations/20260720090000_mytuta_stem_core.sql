-- =====================================================================
-- mytuta STEM mastery — core schema
-- New direction: Diagnose -> Understand -> Recall -> Practise -> Apply -> Prove
-- Reuses existing conventions: per-user RLS (user_id = auth.uid()),
-- teacher gate via profiles.user_type = 'teacher', update_updated_at_column()
-- trigger, handle_new_user() trigger (unchanged).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper: unique 5-char class join code
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code text;
BEGIN
  LOOP
    new_code := upper(substr(md5(random()::text), 1, 5));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE code = new_code);
  END LOOP;
  RETURN new_code;
END;
$$;

-- =====================================================================
-- CONTENT (global reference data, readable by everyone)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  subject text NOT NULL,
  name text NOT NULL,
  description text,
  learning_stage text,
  difficulty text,
  related_areas text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.misconceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id uuid REFERENCES public.concepts(id) ON DELETE CASCADE,
  label text NOT NULL,
  detail text,
  created_at timestamptz DEFAULT now()
);

-- Template mastery-path stages for a concept, with rich per-stage content in jsonb.
CREATE TABLE IF NOT EXISTS public.concept_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id uuid NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  ord int NOT NULL,
  name text NOT NULL,
  loop_phase text,
  description text,
  est_time text,
  content jsonb DEFAULT '{}'::jsonb,
  UNIQUE (concept_id, ord)
);

CREATE TABLE IF NOT EXISTS public.lab_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  subject text,
  title text NOT NULL,
  body text,
  equipment text,
  time_estimate text,
  demonstrates text,
  objective text,
  materials jsonb DEFAULT '[]'::jsonb,
  safety text,
  steps jsonb DEFAULT '[]'::jsonb,
  color text,
  cat_fg text,
  cat_bg text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL = platform challenge
  type text NOT NULL,
  scope text,
  mode text,
  timeline text,
  accent text,
  fg text,
  bg text,
  title text NOT NULL,
  body text,
  brief text,
  stages jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- LEARNER (per-user, RLS own rows)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.learner_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  mastered int DEFAULT 0,
  developing int DEFAULT 0,
  accuracy int DEFAULT 0,
  streak int DEFAULT 0,
  skills jsonb DEFAULT '[]'::jsonb,       -- [{ name, pct }]
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mastery_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  concept_name text NOT NULL,
  subject text,
  current_stage int DEFAULT 0,
  stage_label text,
  pct int DEFAULT 0,
  level text DEFAULT 'Beginning',
  status text DEFAULT 'active',
  color text,
  next_action text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.path_stage_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid NOT NULL REFERENCES public.mastery_paths(id) ON DELETE CASCADE,
  ord int NOT NULL,
  state text DEFAULT 'not_started',       -- not_started | current | done
  UNIQUE (path_id, ord)
);

CREATE TABLE IF NOT EXISTS public.mastery_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  concept_name text,
  subject text,
  concept_knowledge int DEFAULT 0,
  procedural_fluency int DEFAULT 0,
  recall int DEFAULT 0,
  reasoning int DEFAULT 0,
  application int DEFAULT 0,
  overall_state text DEFAULT 'Beginning',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, concept_id)
);

-- Denormalized student-facing assignment feed (populated from real class
-- assignments and by provisioning). Keeps the student Home populated without
-- requiring class membership.
CREATE TABLE IF NOT EXISTS public.student_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  teacher_name text,
  subject text,
  due text,
  status text DEFAULT 'Not started',
  status_color text,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id uuid REFERENCES public.mastery_paths(id) ON DELETE SET NULL,
  concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  activity_id uuid,
  kind text,                              -- diagnostic | practice | recall | mastery_check | solve
  prompt text,
  correct boolean,
  mistake_category text,                  -- concept | method | formula | calculation | unit | interpretation | incomplete
  response jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'in_progress',      -- in_progress | submitted
  stage int DEFAULT 0,
  work jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

-- =====================================================================
-- TEACHER (teacher-owned, RLS teacher_id = auth.uid())
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text,
  year_group text,
  code text UNIQUE NOT NULL,
  color text,
  mark text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.classes ALTER COLUMN code SET DEFAULT public.generate_class_code();

CREATE TABLE IF NOT EXISTS public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = rostered, not yet a user
  display_name text NOT NULL,
  mark text,
  color text,
  current_concept text,
  stage text,
  mastery_level text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text,
  form text,
  concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  status text DEFAULT 'draft',            -- draft | published
  cover text,
  tags text[] DEFAULT '{}',
  stages_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experience_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.learning_experiences(id) ON DELETE CASCADE,
  ord int NOT NULL,
  name text NOT NULL,
  body text,
  ai_blocks jsonb DEFAULT '[]'::jsonb,    -- [{ action, text }]
  UNIQUE (experience_id, ord)
);

CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  type text NOT NULL,
  title text,
  class_label text,                       -- display label when class_id is not a real row
  item_mix jsonb DEFAULT '[]'::jsonb,     -- [{ label, pct }]
  status text DEFAULT 'draft',
  submitted int DEFAULT 0,
  total int DEFAULT 0,
  distribution jsonb DEFAULT '[]'::jsonb, -- [{ l, v, c }]
  avg_level text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  experience_id uuid REFERENCES public.learning_experiences(id) ON DELETE SET NULL,
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE SET NULL,
  title text,
  required_stages text[] DEFAULT '{}',
  deadline date,
  mastery_threshold text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept text NOT NULL,
  pct_label text,
  detail text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  active_classes int DEFAULT 0,
  students int DEFAULT 0,
  reaching_secure int DEFAULT 0,
  concepts_taught int DEFAULT 0,
  class_skills jsonb DEFAULT '[]'::jsonb, -- [{ name, pct, color }]
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text,
  title text NOT NULL,
  body text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_concept_stages_concept ON public.concept_stages(concept_id);
CREATE INDEX IF NOT EXISTS idx_misconceptions_concept ON public.misconceptions(concept_id);
CREATE INDEX IF NOT EXISTS idx_mastery_paths_user ON public.mastery_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_path_stage_progress_path ON public.path_stage_progress(path_id);
CREATE INDEX IF NOT EXISTS idx_mastery_profiles_user ON public.mastery_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_user ON public.student_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user ON public.challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_experiences_teacher ON public.learning_experiences(teacher_id);
CREATE INDEX IF NOT EXISTS idx_experience_sections_experience ON public.experience_sections(experience_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher ON public.assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_insights_teacher ON public.teacher_insights(teacher_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- =====================================================================
-- updated_at triggers (reuse public.update_updated_at_column())
-- =====================================================================
CREATE TRIGGER trg_learner_stats_updated BEFORE UPDATE ON public.learner_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mastery_paths_updated BEFORE UPDATE ON public.mastery_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mastery_profiles_updated BEFORE UPDATE ON public.mastery_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_challenge_submissions_updated BEFORE UPDATE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_learning_experiences_updated BEFORE UPDATE ON public.learning_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_teacher_stats_updated BEFORE UPDATE ON public.teacher_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.misconceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_stage_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Content: readable by everyone (reference STEM content is not sensitive).
CREATE POLICY "content readable" ON public.concepts FOR SELECT USING (true);
CREATE POLICY "content readable" ON public.misconceptions FOR SELECT USING (true);
CREATE POLICY "content readable" ON public.concept_stages FOR SELECT USING (true);
CREATE POLICY "content readable" ON public.lab_activities FOR SELECT USING (true);
CREATE POLICY "challenges readable" ON public.challenges FOR SELECT USING (true);

-- Teachers may create their own challenges.
CREATE POLICY "teachers create challenges" ON public.challenges FOR INSERT
  WITH CHECK (created_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'teacher'));
CREATE POLICY "challenge owners update" ON public.challenges FOR UPDATE USING (created_by = auth.uid());

-- Learner own-row helper policies (SELECT/INSERT/UPDATE/DELETE where user_id = auth.uid()).
CREATE POLICY "own select" ON public.learner_stats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.learner_stats FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.learner_stats FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "own select" ON public.mastery_paths FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.mastery_paths FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.mastery_paths FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "own delete" ON public.mastery_paths FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "own select" ON public.mastery_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.mastery_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.mastery_profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "own select" ON public.student_assignments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.student_assignments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.student_assignments FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "own select" ON public.attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.attempts FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "own select" ON public.challenge_submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.challenge_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.challenge_submissions FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "own select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- path_stage_progress: access via owning mastery_path.
CREATE POLICY "own via path select" ON public.path_stage_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.mastery_paths p WHERE p.id = path_id AND p.user_id = auth.uid()));
CREATE POLICY "own via path insert" ON public.path_stage_progress FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.mastery_paths p WHERE p.id = path_id AND p.user_id = auth.uid()));
CREATE POLICY "own via path update" ON public.path_stage_progress FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.mastery_paths p WHERE p.id = path_id AND p.user_id = auth.uid()));

-- Teacher-owned tables.
CREATE POLICY "teacher select" ON public.classes FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "teacher insert" ON public.classes FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teacher update" ON public.classes FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "teacher delete" ON public.classes FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "teacher select" ON public.assessments FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "teacher insert" ON public.assessments FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teacher update" ON public.assessments FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "teacher delete" ON public.assessments FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "teacher select" ON public.teacher_insights FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "teacher insert" ON public.teacher_insights FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teacher update" ON public.teacher_insights FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "teacher delete" ON public.teacher_insights FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "teacher select" ON public.teacher_stats FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "teacher insert" ON public.teacher_stats FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teacher update" ON public.teacher_stats FOR UPDATE USING (teacher_id = auth.uid());

-- learning_experiences: teacher owns; published readable by any authenticated user.
CREATE POLICY "experiences read" ON public.learning_experiences FOR SELECT
  USING (teacher_id = auth.uid() OR status = 'published');
CREATE POLICY "experiences insert" ON public.learning_experiences FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "experiences update" ON public.learning_experiences FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "experiences delete" ON public.learning_experiences FOR DELETE USING (teacher_id = auth.uid());

-- experience_sections: access via owning experience (or published).
CREATE POLICY "sections read" ON public.experience_sections FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.learning_experiences e
                 WHERE e.id = experience_id AND (e.teacher_id = auth.uid() OR e.status = 'published')));
CREATE POLICY "sections insert" ON public.experience_sections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.learning_experiences e WHERE e.id = experience_id AND e.teacher_id = auth.uid()));
CREATE POLICY "sections update" ON public.experience_sections FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.learning_experiences e WHERE e.id = experience_id AND e.teacher_id = auth.uid()));
CREATE POLICY "sections delete" ON public.experience_sections FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.learning_experiences e WHERE e.id = experience_id AND e.teacher_id = auth.uid()));

-- class_students: teacher who owns the class, or the student themselves.
CREATE POLICY "class students read" ON public.class_students FOR SELECT
  USING (student_id = auth.uid()
         OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()));
CREATE POLICY "class students insert" ON public.class_students FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()));
CREATE POLICY "class students update" ON public.class_students FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()));
CREATE POLICY "class students delete" ON public.class_students FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()));

-- assignments: teacher owns, or student is in the class.
CREATE POLICY "assignments read" ON public.assignments FOR SELECT
  USING (teacher_id = auth.uid()
         OR class_id IN (SELECT class_id FROM public.class_students WHERE student_id = auth.uid()));
CREATE POLICY "assignments insert" ON public.assignments FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "assignments update" ON public.assignments FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "assignments delete" ON public.assignments FOR DELETE USING (teacher_id = auth.uid());
