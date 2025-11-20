-- Create completed_games table for game history
CREATE TABLE IF NOT EXISTS completed_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Game metadata
  dice_set_name VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  end_reason VARCHAR(10) NOT NULL, -- 'win', 'lost', 'quit'
  
  -- Game stats
  final_score INTEGER DEFAULT 0,
  levels_completed INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 0,
  
  -- High scores from this game
  high_single_roll INTEGER DEFAULT 0,
  high_bank INTEGER DEFAULT 0,
  
  -- Full game state (for detailed history if needed)
  game_state JSONB,
  
  -- Timestamps
  started_at TIMESTAMP,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_completed_games_user_id ON completed_games(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_games_completed_at ON completed_games(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_completed_games_difficulty ON completed_games(difficulty);
CREATE INDEX IF NOT EXISTS idx_completed_games_end_reason ON completed_games(end_reason);

