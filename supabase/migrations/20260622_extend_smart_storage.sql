-- Extend existing tables and add missing ones for full smart storage support.
-- All ALTER TABLE statements use IF NOT EXISTS / IF EXISTS to be idempotent.

-- =============================================
-- EXTEND flashcards
-- =============================================
ALTER TABLE flashcards
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_review TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mastery_level INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- EXTEND study_sessions
-- =============================================
ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT,
  ADD COLUMN IF NOT EXISTS content_id TEXT,
  ADD COLUMN IF NOT EXISTS performance JSONB,
  ADD COLUMN IF NOT EXISTS mood TEXT;

-- =============================================
-- CREATE quiz_attempts
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id      UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers      JSONB NOT NULL DEFAULT '[]',
  score        INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  percentage   NUMERIC(5,2) NOT NULL DEFAULT 0,
  start_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time     TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE learning_paths
-- =============================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  total_steps     INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  steps           JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE revision_plans
-- =============================================
CREATE TABLE IF NOT EXISTS revision_plans (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject          TEXT NOT NULL,
  topic            TEXT NOT NULL,
  scheduled_dates  TEXT[] NOT NULL DEFAULT '{}',
  completed_dates  TEXT[] NOT NULL DEFAULT '{}',
  feedback         JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE user_preferences
-- =============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme               TEXT NOT NULL DEFAULT 'light',
  notifications       JSONB NOT NULL DEFAULT '{}',
  study_preferences   JSONB NOT NULL DEFAULT '{}',
  privacy             JSONB NOT NULL DEFAULT '{}',
  accessibility       JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE achievements
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT,
  category    TEXT,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE quiz_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths   ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements     ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'own_quiz_attempts') THEN
    CREATE POLICY own_quiz_attempts    ON quiz_attempts    FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_paths' AND policyname = 'own_learning_paths') THEN
    CREATE POLICY own_learning_paths   ON learning_paths   FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'revision_plans' AND policyname = 'own_revision_plans') THEN
    CREATE POLICY own_revision_plans   ON revision_plans   FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'own_user_preferences') THEN
    CREATE POLICY own_user_preferences ON user_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'own_achievements') THEN
    CREATE POLICY own_achievements     ON achievements     FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id        ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review    ON flashcards(next_review);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id     ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id    ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_plans_user_id    ON revision_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id      ON achievements(user_id);
