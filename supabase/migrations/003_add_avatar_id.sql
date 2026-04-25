-- Assign every profile a random avatar_id at creation time.
-- Range (1..7) must match AVATAR_COUNT in src/app/lib/avatars.js.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_id SMALLINT NOT NULL
  DEFAULT (floor(random() * 7) + 1)::smallint;

-- Backfill any legacy rows that somehow lack a value.
UPDATE profiles
  SET avatar_id = (floor(random() * 7) + 1)::smallint
  WHERE avatar_id IS NULL;
