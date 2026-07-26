-- Smart Storage System Tables for mytuta AI
-- Creates all necessary tables for cloud sync functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STUDY SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL DEFAULT 0,
  content_type TEXT CHECK (content_type IN ('notes', 'flashcards', 'quiz', 'contest', 'learning-path')),
  content_id TEXT,
  performance JSONB,
  mood TEXT CHECK (mood IN ('energetic', 'focused', 'tired', 'stressed', 'confident')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_subject ON study_sessions(subject);
CREATE INDEX idx_study_sessions_created_at ON study_sessions(created_at DESC);

-- ============================================
-- FLASHCARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  review_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_subject ON flashcards(subject);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review);

-- ============================================
-- FLASHCARD SETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  flashcard_ids TEXT[],
  total_cards INTEGER NOT NULL DEFAULT 0,
  mastered_cards INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flashcard_sets_user_id ON flashcard_sets(user_id);
CREATE INDEX idx_flashcard_sets_subject ON flashcard_sets(subject);

-- ============================================
-- STUDY NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS study_notes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  tags TEXT[],
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_notes_user_id ON study_notes(user_id);
CREATE INDEX idx_study_notes_subject ON study_notes(subject);
CREATE INDEX idx_study_notes_created_at ON study_notes(created_at DESC);

-- ============================================
-- QUIZZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  questions JSONB NOT NULL,
  time_limit INTEGER,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_subject ON quizzes(subject);

-- ============================================
-- QUIZ ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
  answers INTEGER[],
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage NUMERIC(5,2),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_created_at ON quiz_attempts(created_at DESC);

-- ============================================
-- LEARNING PATHS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_steps INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  steps JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_subject ON learning_paths(subject);

-- ============================================
-- REVISION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS revision_plans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  scheduled_dates TIMESTAMPTZ[],
  completed_dates TIMESTAMPTZ[],
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revision_plans_user_id ON revision_plans(user_id);
CREATE INDEX idx_revision_plans_subject ON revision_plans(subject);

-- ============================================
-- PROGRESS METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS progress_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  total_study_time INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  average_session_duration INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_study_date TIMESTAMPTZ,
  topics_studied TEXT[],
  mastery_levels JSONB,
  weekly_goal_minutes INTEGER NOT NULL DEFAULT 0,
  weekly_progress INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

CREATE INDEX idx_progress_metrics_user_id ON progress_metrics(user_id);
CREATE INDEX idx_progress_metrics_subject ON progress_metrics(subject);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'light',
  notifications JSONB,
  study_preferences JSONB,
  privacy JSONB,
  accessibility JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT CHECK (category IN ('study', 'progress', 'milestone', 'social')),
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);

-- ============================================
-- CONTESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contests (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  questions JSONB NOT NULL,
  time_limit INTEGER,
  participants INTEGER DEFAULT 0,
  best_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contests_subject ON contests(subject);
CREATE INDEX idx_contests_difficulty ON contests(difficulty);

-- ============================================
-- CONTEST ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contest_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id TEXT REFERENCES contests(id) ON DELETE CASCADE,
  answers INTEGER[],
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage NUMERIC(5,2),
  rank INTEGER,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contest_attempts_user_id ON contest_attempts(user_id);
CREATE INDEX idx_contest_attempts_contest_id ON contest_attempts(contest_id);

-- ============================================
-- TEACHER CLASSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teacher_classes (
  id TEXT PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT,
  student_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teacher_classes_teacher_id ON teacher_classes(teacher_id);
CREATE INDEX idx_teacher_classes_subject ON teacher_classes(subject);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES teacher_classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  content_type TEXT CHECK (content_type IN ('quiz', 'notes', 'project')),
  content_id TEXT,
  submitted_by UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for each table (users can only access their own data)

-- Study Sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study sessions" ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Flashcards
CREATE POLICY "Users can view their own flashcards" ON flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own flashcards" ON flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcards" ON flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flashcards" ON flashcards FOR DELETE USING (auth.uid() = user_id);

-- Flashcard Sets
CREATE POLICY "Users can view their own flashcard sets" ON flashcard_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own flashcard sets" ON flashcard_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard sets" ON flashcard_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flashcard sets" ON flashcard_sets FOR DELETE USING (auth.uid() = user_id);

-- Study Notes
CREATE POLICY "Users can view their own study notes" ON study_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own study notes" ON study_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study notes" ON study_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study notes" ON study_notes FOR DELETE USING (auth.uid() = user_id);

-- Quizzes
CREATE POLICY "Users can view their own quizzes" ON quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quizzes" ON quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quizzes" ON quizzes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quizzes" ON quizzes FOR DELETE USING (auth.uid() = user_id);

-- Quiz Attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning Paths
CREATE POLICY "Users can view their own learning paths" ON learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own learning paths" ON learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own learning paths" ON learning_paths FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own learning paths" ON learning_paths FOR DELETE USING (auth.uid() = user_id);

-- Revision Plans
CREATE POLICY "Users can view their own revision plans" ON revision_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own revision plans" ON revision_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own revision plans" ON revision_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own revision plans" ON revision_plans FOR DELETE USING (auth.uid() = user_id);

-- Progress Metrics
CREATE POLICY "Users can view their own progress metrics" ON progress_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress metrics" ON progress_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress metrics" ON progress_metrics FOR UPDATE USING (auth.uid() = user_id);

-- User Preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can view their own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Contests (public read, authenticated create)
CREATE POLICY "Anyone can view contests" ON contests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create contests" ON contests FOR INSERT TO authenticated WITH CHECK (true);

-- Contest Attempts
CREATE POLICY "Users can view their own contest attempts" ON contest_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contest attempts" ON contest_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teacher Classes
CREATE POLICY "Teachers can view their own classes" ON teacher_classes FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create their own classes" ON teacher_classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own classes" ON teacher_classes FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own classes" ON teacher_classes FOR DELETE USING (auth.uid() = teacher_id);

-- Assignments
CREATE POLICY "Teachers can view their own assignments" ON assignments FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create their own assignments" ON assignments FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own assignments" ON assignments FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own assignments" ON assignments FOR DELETE USING (auth.uid() = teacher_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at
CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON study_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flashcard_sets_updated_at BEFORE UPDATE ON flashcard_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_notes_updated_at BEFORE UPDATE ON study_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revision_plans_updated_at BEFORE UPDATE ON revision_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_metrics_updated_at BEFORE UPDATE ON progress_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_classes_updated_at BEFORE UPDATE ON teacher_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

