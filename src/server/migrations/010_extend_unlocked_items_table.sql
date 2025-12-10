-- Extend unlocked_items table to support more item types
-- Add support for pip_effect, material, and difficulty unlock types
-- The item_type column already supports VARCHAR(20), so we just need to update the constraint if needed
-- No schema changes needed, just documentation that these types are now supported

-- Note: The existing table structure already supports these types since item_type is VARCHAR(20)
-- We just need to ensure the application code handles these new types

