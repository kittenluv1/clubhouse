-- Add recommendation-related columns to profiles table
-- These fields are used by the recommendation engine to match users with clubs

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS major TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS minor TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Table for tracking which clubs a user is already a member of
CREATE TABLE IF NOT EXISTS club_memberships (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id INTEGER REFERENCES clubs("OrganizationID") ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, club_id)
);

ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships"
  ON club_memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships"
  ON club_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships"
  ON club_memberships FOR DELETE
  USING (auth.uid() = user_id);
