-- Create consumable_usage table to track consumable usage
CREATE TABLE IF NOT EXISTS consumable_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consumable_id VARCHAR(255) NOT NULL,
  times_used INTEGER DEFAULT 0,
  first_used_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, consumable_id)
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_consumable_usage_user_id ON consumable_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_consumable_usage_consumable_id ON consumable_usage(consumable_id);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_consumable_usage_updated_at ON consumable_usage;
CREATE TRIGGER update_consumable_usage_updated_at
  BEFORE UPDATE ON consumable_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

