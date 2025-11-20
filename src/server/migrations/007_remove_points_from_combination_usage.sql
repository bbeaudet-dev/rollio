-- Remove total_points_scored and highest_score columns from combination_usage table
-- These columns are no longer needed as we only track usage counts

ALTER TABLE combination_usage
DROP COLUMN IF EXISTS total_points_scored,
DROP COLUMN IF EXISTS highest_score;

