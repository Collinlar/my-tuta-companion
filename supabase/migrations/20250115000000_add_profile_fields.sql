-- Add additional fields to profiles table for onboarding data
-- This migration extends the profiles table with student/teacher specific fields

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS school TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS subjects TEXT[],
  ADD COLUMN IF NOT EXISTS goals TEXT[],
  ADD COLUMN IF NOT EXISTS parent_contact TEXT,
  ADD COLUMN IF NOT EXISTS teaching_experience TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON public.profiles(grade);
CREATE INDEX IF NOT EXISTS idx_profiles_school ON public.profiles(school);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.school IS 'School name for students and teachers';
COMMENT ON COLUMN public.profiles.grade IS 'Grade level for students or teaching level for teachers';
COMMENT ON COLUMN public.profiles.subjects IS 'Array of subjects student studies or teacher teaches';
COMMENT ON COLUMN public.profiles.goals IS 'Array of learning/teaching goals';
COMMENT ON COLUMN public.profiles.parent_contact IS 'Parent/guardian contact for students';
COMMENT ON COLUMN public.profiles.teaching_experience IS 'Teaching experience description for teachers';


