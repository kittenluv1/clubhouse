-- Migration: Add onboarding completion flag and preference columns

-- 0: Rename onboarding_done to onboarding_started for clarity
-- onboarding_started = user has been redirected to /onboarding at least once (guard fires once)
-- onboarding_completed = user has finished all onboarding steps (set on final step submit)
ALTER TABLE public.profiles
  RENAME COLUMN onboarding_done TO onboarding_started;

-- 1: Add onboarding_completed flag to profiles
-- Distinct from onboarding_started (which tracks the one-time redirect).
-- This is set to true only when the user finishes all onboarding steps.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 2: Add academic preference columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS majors text[],
  ADD COLUMN IF NOT EXISTS minors text[],
  ADD COLUMN IF NOT EXISTS current_clubs text[];

-- Note: Club category and subcategory interests (Steps 2 & 3) are stored in
-- the existing user_interests table as (user_id, category) rows.
-- No schema change needed there — both broad categories and subcategories
-- are inserted as individual rows, giving the recommendation algorithm
-- the full interest signal from both levels.
