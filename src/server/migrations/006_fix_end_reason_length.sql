-- Fix end_reason column length to accommodate 'in_progress'
ALTER TABLE completed_games ALTER COLUMN end_reason TYPE VARCHAR(20);

