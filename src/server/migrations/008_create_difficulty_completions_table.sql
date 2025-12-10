-- Create difficulty_completions table
-- Tracks which difficulties each user has completed
CREATE TABLE IF NOT EXISTS difficulty_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, difficulty)
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_difficulty_completions_user_id ON difficulty_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_completions_difficulty ON difficulty_completions(difficulty);

