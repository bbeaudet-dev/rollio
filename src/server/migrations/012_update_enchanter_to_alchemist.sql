-- Update all legacy "enchanter" and "materialEnchanter" consumable IDs to "alchemist"
-- This fixes old game data that still references the old consumable name

-- Update game_saves table
UPDATE game_saves
SET game_state = jsonb_set(
  game_state,
  '{consumables}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN elem->>'id' = 'enchanter' OR elem->>'id' = 'materialEnchanter' THEN
          jsonb_set(elem, '{id}', '"alchemist"')
        ELSE
          elem
      END
    )
    FROM jsonb_array_elements(game_state->'consumables') AS elem
  )
)
WHERE game_state->'consumables' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(game_state->'consumables') AS elem
    WHERE elem->>'id' IN ('enchanter', 'materialEnchanter')
  );

-- Update completed_games table
UPDATE completed_games
SET game_state = jsonb_set(
  game_state,
  '{consumables}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN elem->>'id' = 'enchanter' OR elem->>'id' = 'materialEnchanter' THEN
          jsonb_set(elem, '{id}', '"alchemist"')
        ELSE
          elem
      END
    )
    FROM jsonb_array_elements(game_state->'consumables') AS elem
  )
)
WHERE game_state->'consumables' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(game_state->'consumables') AS elem
    WHERE elem->>'id' IN ('enchanter', 'materialEnchanter')
  );

