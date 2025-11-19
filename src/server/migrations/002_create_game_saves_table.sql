-- Create game_saves table
CREATE TABLE IF NOT EXISTS game_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  game_state JSONB NOT NULL,

  -- Generated columns for fast queries (auto-synced with game_state)
  difficulty VARCHAR(20) GENERATED ALWAYS AS (game_state->'config'->>'difficulty') STORED,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Remove dice_set_index column if it exists (from previous migration)
ALTER TABLE game_saves DROP COLUMN IF EXISTS dice_set_index;

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_game_saves_user_active ON game_saves(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_game_saves_difficulty ON game_saves(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON game_saves(user_id);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_game_saves_updated_at ON game_saves;
CREATE TRIGGER update_game_saves_updated_at
  BEFORE UPDATE ON game_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

