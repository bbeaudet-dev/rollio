-- Create combination_usage table for tracking combination statistics
CREATE TABLE IF NOT EXISTS combination_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Combination info
  combination_type VARCHAR(50) NOT NULL, -- e.g., 'pair', 'threeOfAKind', 'straight'
  
  -- Usage stats
  times_used INTEGER DEFAULT 0,
  
  -- Timestamps
  first_used_at TIMESTAMP,
  last_used_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index on user_id + combination_type
CREATE UNIQUE INDEX IF NOT EXISTS idx_combination_usage_user_combination 
  ON combination_usage(user_id, combination_type);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_combination_usage_user_id ON combination_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_combination_usage_combination_type ON combination_usage(combination_type);
CREATE INDEX IF NOT EXISTS idx_combination_usage_times_used ON combination_usage(times_used DESC);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_combination_usage_updated_at ON combination_usage;
CREATE TRIGGER update_combination_usage_updated_at
  BEFORE UPDATE ON combination_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

