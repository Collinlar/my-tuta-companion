-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  user_type text NOT NULL DEFAULT 'student' CHECK (user_type IN ('student', 'teacher')),
  avatar_url text,
  bio text,
  onboarding_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  subject text,
  tags text[],
  file_url text,
  file_type text,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create flashcard sets table
CREATE TABLE public.flashcard_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id uuid NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  image_url text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit integer, -- in minutes
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options jsonb, -- for multiple choice options
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Create learning goals table
CREATE TABLE public.learning_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text,
  target_date date,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create study sessions table
CREATE TABLE public.study_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.learning_goals(id) ON DELETE SET NULL,
  session_type text NOT NULL CHECK (session_type IN ('flashcards', 'quiz', 'reading', 'notes')),
  resource_id uuid, -- references different tables based on session_type
  duration_minutes integer,
  score integer, -- for quizzes
  completed boolean DEFAULT false,
  notes text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create resources table
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('pdf', 'video', 'article', 'interactive', 'text')),
  content_url text,
  content text, -- for text-based resources
  subject text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time_minutes integer,
  is_public boolean DEFAULT false,
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create contests table
CREATE TABLE public.contests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration_minutes integer NOT NULL,
  max_participants integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create contest participants table
CREATE TABLE public.contest_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  completed boolean DEFAULT false,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  UNIQUE(contest_id, user_id)
);

-- Create progress tracking table
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  total_study_time_minutes integer DEFAULT 0,
  flashcards_reviewed integer DEFAULT 0,
  quizzes_completed integer DEFAULT 0,
  notes_created integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, subject)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" 
ON public.notes FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notes" 
ON public.notes FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notes" 
ON public.notes FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" 
ON public.notes FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for flashcard sets
CREATE POLICY "Users can view their own flashcard sets and public ones" 
ON public.flashcard_sets FOR SELECT 
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own flashcard sets" 
ON public.flashcard_sets FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own flashcard sets" 
ON public.flashcard_sets FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own flashcard sets" 
ON public.flashcard_sets FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for flashcards
CREATE POLICY "Users can view flashcards from accessible sets" 
ON public.flashcards FOR SELECT 
USING (set_id IN (
  SELECT id FROM public.flashcard_sets 
  WHERE user_id = auth.uid() OR is_public = true
));

CREATE POLICY "Users can create flashcards in their own sets" 
ON public.flashcards FOR INSERT 
WITH CHECK (set_id IN (
  SELECT id FROM public.flashcard_sets 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update flashcards in their own sets" 
ON public.flashcards FOR UPDATE 
USING (set_id IN (
  SELECT id FROM public.flashcard_sets 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete flashcards in their own sets" 
ON public.flashcards FOR DELETE 
USING (set_id IN (
  SELECT id FROM public.flashcard_sets 
  WHERE user_id = auth.uid()
));

-- Create RLS policies for quizzes
CREATE POLICY "Users can view their own quizzes and public ones" 
ON public.quizzes FOR SELECT 
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own quizzes" 
ON public.quizzes FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quizzes" 
ON public.quizzes FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own quizzes" 
ON public.quizzes FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for quiz questions
CREATE POLICY "Users can view questions from accessible quizzes" 
ON public.quiz_questions FOR SELECT 
USING (quiz_id IN (
  SELECT id FROM public.quizzes 
  WHERE user_id = auth.uid() OR is_public = true
));

CREATE POLICY "Users can create questions in their own quizzes" 
ON public.quiz_questions FOR INSERT 
WITH CHECK (quiz_id IN (
  SELECT id FROM public.quizzes 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update questions in their own quizzes" 
ON public.quiz_questions FOR UPDATE 
USING (quiz_id IN (
  SELECT id FROM public.quizzes 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete questions in their own quizzes" 
ON public.quiz_questions FOR DELETE 
USING (quiz_id IN (
  SELECT id FROM public.quizzes 
  WHERE user_id = auth.uid()
));

-- Create RLS policies for learning goals
CREATE POLICY "Users can view their own learning goals" 
ON public.learning_goals FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own learning goals" 
ON public.learning_goals FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own learning goals" 
ON public.learning_goals FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own learning goals" 
ON public.learning_goals FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for study sessions
CREATE POLICY "Users can view their own study sessions" 
ON public.study_sessions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own study sessions" 
ON public.study_sessions FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own study sessions" 
ON public.study_sessions FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for resources
CREATE POLICY "Users can view their own resources and public ones" 
ON public.resources FOR SELECT 
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own resources" 
ON public.resources FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own resources" 
ON public.resources FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own resources" 
ON public.resources FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for contests
CREATE POLICY "Everyone can view active contests" 
ON public.contests FOR SELECT 
USING (is_active = true);

CREATE POLICY "Teachers can create contests" 
ON public.contests FOR INSERT 
WITH CHECK (
  created_by = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'teacher'
  )
);

CREATE POLICY "Contest creators can update their contests" 
ON public.contests FOR UPDATE 
USING (created_by = auth.uid());

-- Create RLS policies for contest participants
CREATE POLICY "Users can view contest participants" 
ON public.contest_participants FOR SELECT 
USING (true);

CREATE POLICY "Users can join contests" 
ON public.contest_participants FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" 
ON public.contest_participants FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for user progress
CREATE POLICY "Users can view their own progress" 
ON public.user_progress FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own progress records" 
ON public.user_progress FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" 
ON public.user_progress FOR UPDATE 
USING (user_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcard_sets_updated_at
    BEFORE UPDATE ON public.flashcard_sets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_goals_updated_at
    BEFORE UPDATE ON public.learning_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();