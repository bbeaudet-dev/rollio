-- Create unlocked_items table
-- Tracks which items (charms, consumables, blessings, pip_effects, materials, difficulties) each user has unlocked
CREATE TABLE IF NOT EXISTS unlocked_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  unlock_type VARCHAR(20) NOT NULL, -- 'charm', 'consumable', 'blessing', 'pip_effect', 'material', 'difficulty'
  unlock_id VARCHAR(100) NOT NULL,  -- The ID of the item (e.g., charm ID, consumable ID, pip effect ID, etc.)
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, unlock_type, unlock_id)
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_unlocked_items_user_id ON unlocked_items(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_items_type_id ON unlocked_items(unlock_type, unlock_id);

