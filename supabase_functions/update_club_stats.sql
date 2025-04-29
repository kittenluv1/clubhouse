ALTER TABLE clubs
-- Add columns to 'clubs' table that stores the total sum of satisfaction ratings, total number of reviews
ADD COLUMN satisfaction_sum INTEGER DEFAULT 0,
ADD COLUMN total_num_reviews INTEGER DEFAULT 0,
-- Automatically calculates the average satisfaction rating based on the total sum of satisfaction ratings and total number of reviews
ADD COLUMN average_satisfaction FLOAT GENERATED ALWAYS AS (
  CASE
    WHEN total_num_reviews = 0 THEN NULL
    -- Rounds to 2 decimal places
    ELSE ROUND(satisfaction_sum::NUMERIC / total_num_reviews, 2)
  END
) STORED;

-- Automatically updates respective columns in 'clubs' table when a new review is created
CREATE OR REPLACE FUNCTION update_club_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clubs
  SET
    satisfaction_sum = satisfaction_sum + NEW.overall_satisfaction,
    total_num_reviews = total_num_reviews + 1
  WHERE "OrganizationID" = NEW.club_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_upon_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_club_review_stats()