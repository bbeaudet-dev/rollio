-- Migration 011: Rename item_type and item_id to unlock_type and unlock_id
-- This migration is now a no-op since migration 009 was updated to use the new column names
-- Keeping this file for reference, but it will be skipped if columns already have the new names

-- Only rename if the old columns exist (for databases that were created before migration 009 was updated)
DO $$
BEGIN
  -- Check if item_type column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'unlocked_items' 
    AND column_name = 'item_type'
  ) THEN
    ALTER TABLE unlocked_items RENAME COLUMN item_type TO unlock_type;
  END IF;

  -- Check if item_id column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'unlocked_items' 
    AND column_name = 'item_id'
  ) THEN
    ALTER TABLE unlocked_items RENAME COLUMN item_id TO unlock_id;
  END IF;

  -- Update the unique constraint if it exists with old name
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'unlocked_items_user_id_item_type_item_id_key'
  ) THEN
    ALTER TABLE unlocked_items 
      DROP CONSTRAINT unlocked_items_user_id_item_type_item_id_key;
    
    ALTER TABLE unlocked_items 
      ADD CONSTRAINT unlocked_items_user_id_unlock_type_unlock_id_key 
      UNIQUE(user_id, unlock_type, unlock_id);
  END IF;

  -- Update the index if it exists with old column names
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_unlocked_items_type_id'
    AND indexdef LIKE '%item_type%'
  ) THEN
    DROP INDEX IF EXISTS idx_unlocked_items_type_id;
    CREATE INDEX IF NOT EXISTS idx_unlocked_items_type_id ON unlocked_items(unlock_type, unlock_id);
  END IF;
END $$;

