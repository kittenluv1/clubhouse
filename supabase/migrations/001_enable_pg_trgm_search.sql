-- Migration: Enable pg_trgm extension for fuzzy search
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Step 1: Enable the pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Set similarity threshold (0.3 is default, lower = more fuzzy matches)
-- You can adjust this value: 0.1 (very fuzzy) to 0.6 (strict)
SET pg_trgm.similarity_threshold = 0.2;

-- Step 3: Create GIN indexes for fast trigram searches on club name and description
-- These indexes make LIKE, ILIKE, and similarity searches much faster

-- Index on OrganizationName for fuzzy name matching
CREATE INDEX IF NOT EXISTS idx_clubs_name_trgm
ON clubs USING gin (OrganizationName gin_trgm_ops);

-- Index on OrganizationDescription for description search
CREATE INDEX IF NOT EXISTS idx_clubs_desc_trgm
ON clubs USING gin (OrganizationDescription gin_trgm_ops);

-- Index on Category names for faster category filtering
CREATE INDEX IF NOT EXISTS idx_clubs_category1
ON clubs (Category1Name);

CREATE INDEX IF NOT EXISTS idx_clubs_category2
ON clubs (Category2Name);

-- Step 4: Add acronyms column for acronym/abbreviation search support
-- Users can store common acronyms for clubs (e.g., "ACM, USAC, VSU")
ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS acronyms TEXT;

-- Step 5: Create a combined search text column for even faster searches
-- This combines name + acronyms + first 50 words of description into one searchable field

-- Add the column if it doesn't exist
ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS search_text TEXT;

-- Helper function to get first N words from text
CREATE OR REPLACE FUNCTION get_first_n_words(input_text TEXT, n INT)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT string_agg(word, ' ')
    FROM (
      SELECT unnest(string_to_array(regexp_replace(COALESCE(input_text, ''), '\s+', ' ', 'g'), ' ')) AS word
      LIMIT n
    ) AS words
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Populate the search text column with name + acronyms + first 50 words of description
UPDATE clubs
SET search_text = COALESCE("OrganizationName", '') || ' ' ||
                  COALESCE(acronyms, '') || ' ' ||
                  COALESCE(get_first_n_words("OrganizationDescription", 50), '');

-- Create index on the combined search text
CREATE INDEX IF NOT EXISTS idx_clubs_search_text_trgm
ON clubs USING gin (search_text gin_trgm_ops);

-- Step 6: Create a function to automatically update search_text when club data changes
CREATE OR REPLACE FUNCTION update_club_search_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text = COALESCE(NEW."OrganizationName", '') || ' ' ||
                    COALESCE(NEW.acronyms, '') || ' ' ||
                    COALESCE(get_first_n_words(NEW."OrganizationDescription", 50), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search_text
DROP TRIGGER IF EXISTS trigger_update_club_search_text ON clubs;
CREATE TRIGGER trigger_update_club_search_text
  BEFORE INSERT OR UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_club_search_text();

-- Step 7: Create a helper function for similarity search with ranking
-- Prioritizes: exact acronym match > name match > acronym fuzzy > description match
CREATE OR REPLACE FUNCTION search_clubs(search_term TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE (
  "OrganizationID" INT,
  "OrganizationName" TEXT,
  "OrganizationDescription" TEXT,
  "Category1Name" TEXT,
  "Category2Name" TEXT,
  "OrganizationEmail" TEXT,
  "OrganizationWebSite" TEXT,
  "SocialMediaLink" TEXT,
  average_satisfaction NUMERIC,
  average_time_commitment NUMERIC,
  average_inclusivity NUMERIC,
  average_social_community NUMERIC,
  average_competitiveness NUMERIC,
  total_num_reviews INT,
  similarity_score REAL
) AS $$
DECLARE
  search_upper TEXT := UPPER(search_term);
BEGIN
  RETURN QUERY
  SELECT
    c."OrganizationID",
    c."OrganizationName",
    c."OrganizationDescription",
    c."Category1Name",
    c."Category2Name",
    c."OrganizationEmail",
    c."OrganizationWebSite",
    c."SocialMediaLink",
    c.average_satisfaction,
    c.average_time_commitment,
    c.average_inclusivity,
    c.average_social_community,
    c.average_competitiveness,
    c.total_num_reviews,
    -- Scoring: acronym exact match (2.0) > acronym contains (1.5) > name similarity > description
    CASE
      -- Exact acronym match (case-insensitive) - highest priority
      WHEN c.acronyms IS NOT NULL AND (
        UPPER(c.acronyms) = search_upper
        OR UPPER(c.acronyms) LIKE '%,' || search_upper || ',%'
        OR UPPER(c.acronyms) LIKE search_upper || ',%'
        OR UPPER(c.acronyms) LIKE '%,' || search_upper
      ) THEN 2.0
      -- Acronym contains match
      WHEN c.acronyms IS NOT NULL AND UPPER(c.acronyms) LIKE '%' || search_upper || '%'
        THEN 1.5
      -- Name/description similarity
      ELSE GREATEST(
        similarity(c."OrganizationName", search_term),
        similarity(c.search_text, search_term) * 0.8,
        similarity(COALESCE(c.acronyms, ''), search_term) * 0.9
      )
    END::REAL as similarity_score
  FROM clubs c
  WHERE
    -- Match on acronyms (exact or partial)
    (c.acronyms IS NOT NULL AND UPPER(c.acronyms) LIKE '%' || search_upper || '%')
    -- Match on name (fuzzy or contains)
    OR c."OrganizationName" % search_term
    OR c."OrganizationName" ILIKE '%' || search_term || '%'
    -- Match on combined search text (name + acronyms + first 50 words of description)
    OR c.search_text % search_term
    OR c.search_text ILIKE '%' || search_term || '%'
  ORDER BY similarity_score DESC, c.average_satisfaction DESC NULLS LAST
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create index on acronyms for faster acronym searches
CREATE INDEX IF NOT EXISTS idx_clubs_acronyms_trgm
ON clubs USING gin (acronyms gin_trgm_ops);

-- Also create a simple btree index for exact acronym lookups
CREATE INDEX IF NOT EXISTS idx_clubs_acronyms_upper
ON clubs (UPPER(acronyms));

-- Verification: Test the similarity function
-- SELECT * FROM search_clubs('engineering', 10);
-- SELECT * FROM search_clubs('ACM', 10);  -- Test acronym search
-- SELECT * FROM search_clubs('VSU', 10);  -- Test acronym search
-- SELECT similarity('UCLA Engineering', 'enginering');  -- Should return ~0.5 even with typo

-- Example: Manually add acronyms for popular clubs
-- UPDATE clubs SET acronyms = 'ACM' WHERE "OrganizationName" ILIKE '%Association for Computing Machinery%';
-- UPDATE clubs SET acronyms = 'USAC' WHERE "OrganizationName" ILIKE '%Undergraduate Students Association Council%';
-- UPDATE clubs SET acronyms = 'VSU' WHERE "OrganizationName" ILIKE '%Vietnamese Student Union%';
