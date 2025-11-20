-- Add profile_picture field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(50) DEFAULT 'default';

-- Add index for profile picture lookups (optional, but can help with queries)
CREATE INDEX IF NOT EXISTS idx_users_profile_picture ON users(profile_picture);

