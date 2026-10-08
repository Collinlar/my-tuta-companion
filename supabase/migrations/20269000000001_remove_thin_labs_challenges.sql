-- Remove all thin/placeholder labs and challenges, keeping only the 5 flagship labs
-- and 3 flagship challenges that have full content (steps, mission, prediction,
-- reflection, rubric, story) in the content jsonb column.
--
-- Background: several earlier migrations seeded lab_activities and challenges with
-- minimal steps and no extended content. These records produce a hollow experience
-- alongside the properly authored flagships. Until additional labs and challenges are
-- authored to the same standard they are removed from the visible catalog.

-- Keep only the 5 flagship slugs from 20262000000001_flagship_labs_seed.sql.
DELETE FROM public.lab_activities
WHERE slug NOT IN (
  'density-investigation',
  'photosynthesis-experiment',
  'simple-circuits',
  'forces-paper-bridge',
  'cooling-temperature-data'
);

-- Keep only the 3 flagship titles from 20262000000002_flagship_challenges_seed.sql.
DELETE FROM public.challenges
WHERE title NOT IN (
  'Clean Water Challenge',
  'Paper Bridge Engineering Challenge',
  'Smarter Energy School Challenge'
);
