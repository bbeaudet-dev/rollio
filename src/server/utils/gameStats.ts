/**
 * Utilities for saving game statistics to the database
 */

import { query } from '../db';
import { GameState } from '../../game/types';
import { serializeGameState } from './gameStateSerialization';

/**
 * Upsert current game to completed_games with 'in_progress' status
 * Called during auto-save to show current game in recent games
 */
export async function upsertCurrentGame(
  userId: string,
  gameState: GameState
): Promise<void> {
  try {
    // Don't update completed_games if game has ended
    if (!gameState.isActive) {
      return;
    }
    
    const diceSetName = gameState.config.diceSetConfig.name || 'Unknown';
    const difficulty = gameState.config.difficulty;
    
    const currentLevel = gameState.currentWorld?.currentLevel;
    const finalScore = currentLevel?.pointsBanked || 0;
    const isLevelCompleted = currentLevel && currentLevel.pointsBanked >= currentLevel.levelThreshold;
    const levelsCompleted = currentLevel?.levelNumber 
      ? (isLevelCompleted ? currentLevel.levelNumber : currentLevel.levelNumber - 1)
      : 0;
    
    let totalRounds = 0;
    if (currentLevel?.currentRound) {
      totalRounds = currentLevel.currentRound.roundNumber || 1;
    }
    
    const highSingleRoll = gameState.history.highScoreSingleRoll || 0;
    const highBank = gameState.history.highScoreBank || 0;
    
    // Check if there's already an in_progress game for this user
    const existing = await query(
      `SELECT id FROM completed_games 
       WHERE user_id = $1 AND end_reason = 'in_progress'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId]
    );
    
    if (existing.rows.length > 0) {
      // Update existing in_progress game
      await query(
        `UPDATE completed_games 
         SET dice_set_name = $1, difficulty = $2, final_score = $3,
             levels_completed = $4, total_rounds = $5,
             high_single_roll = $6, high_bank = $7,
             game_state = $8, completed_at = NOW()
         WHERE id = $9`,
        [
          diceSetName,
          difficulty,
          finalScore,
          levelsCompleted,
          totalRounds,
          highSingleRoll,
          highBank,
          serializeGameState(gameState),
          existing.rows[0].id
        ]
      );
    } else {
      // Insert new in_progress game
      await query(
        `INSERT INTO completed_games 
         (user_id, dice_set_name, difficulty, end_reason, final_score, 
          levels_completed, total_rounds, high_single_roll, high_bank, 
          game_state, started_at, completed_at)
         VALUES ($1, $2, $3, 'in_progress', $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          userId,
          diceSetName,
          difficulty,
          finalScore,
          levelsCompleted,
          totalRounds,
          highSingleRoll,
          highBank,
          serializeGameState(gameState)
        ]
      );
    }
  } catch (error) {
    console.error('Error upserting current game:', error);
    // Don't throw - we don't want to break the game flow if stats fail
  }
}

/**
 * Mark any in_progress games as 'quit' for a user
 * Called when starting a new game
 */
export async function markInProgressGamesAsQuit(userId: string): Promise<void> {
  try {
    await query(
      `UPDATE completed_games 
       SET end_reason = 'quit', completed_at = NOW()
       WHERE user_id = $1 AND end_reason = 'in_progress'`,
      [userId]
    );
  } catch (error) {
    console.error('Error marking in_progress games as quit:', error);
    // Don't throw - we don't want to break the game flow if stats fail
  }
}

/**
 * Save game completion statistics
 * Called when a game ends (win, loss, or quit)
 * Updates existing in_progress game if it exists, otherwise creates a new entry
 */
export async function saveGameCompletion(
  userId: string,
  gameState: GameState,
  endReason: 'win' | 'lost' | 'quit'
): Promise<void> {
  try {
    const diceSetName = gameState.config.diceSetConfig.name || 'Unknown';
    const difficulty = gameState.config.difficulty;
    const currentLevel = gameState.currentWorld?.currentLevel;
    const finalScore = currentLevel?.pointsBanked || 0;
    const isLevelCompleted = currentLevel && currentLevel.pointsBanked >= currentLevel.levelThreshold;
    const levelsCompleted = currentLevel?.levelNumber 
      ? (isLevelCompleted ? currentLevel.levelNumber : currentLevel.levelNumber - 1)
      : 0;
    
    // Count total rounds - estimate based on current level
    // Since we don't track round history, we'll use a simple estimate
    // or count rounds from the current level's round number
    let totalRounds = 0;
    if (currentLevel?.currentRound) {
      // Use the round number as an estimate (at least this many rounds were played)
      totalRounds = currentLevel.currentRound.roundNumber || 1;
    }
    
    const highSingleRoll = gameState.history.highScoreSingleRoll || 0;
    const highBank = gameState.history.highScoreBank || 0;
    
    // Check if there's an existing in_progress game for this user
    const existing = await query(
      `SELECT id FROM completed_games 
       WHERE user_id = $1 AND end_reason = 'in_progress'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId]
    );
    
    if (existing.rows.length > 0) {
      // Update existing in_progress game instead of creating a new one
      await query(
        `UPDATE completed_games 
         SET dice_set_name = $1, difficulty = $2, end_reason = $3, final_score = $4,
             levels_completed = $5, total_rounds = $6,
             high_single_roll = $7, high_bank = $8,
             game_state = $9, completed_at = NOW()
         WHERE id = $10`,
        [
          diceSetName,
          difficulty,
          endReason,
          finalScore,
          levelsCompleted,
          totalRounds,
          highSingleRoll,
          highBank,
          serializeGameState(gameState),
          existing.rows[0].id
        ]
      );
      
      // Still update user statistics and save combination usage
      await updateUserStats(userId, endReason, highSingleRoll, highBank);
      await saveCombinationUsage(userId, gameState);
      await saveCharmUsage(userId, gameState);
      await saveConsumableUsage(userId, gameState);
      
      // Record difficulty completion if game was won
      if (endReason === 'win') {
        try {
          await query(
            `INSERT INTO difficulty_completions (user_id, difficulty, completed_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_id, difficulty) DO NOTHING`,
            [userId, difficulty]
          );
          
          // Also unlock the NEXT difficulty (not the current one)
          try {
            const DIFFICULTY_ORDER = ['plastic', 'copper', 'silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond', 'quantum'];
            const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
            if (currentIndex >= 0 && currentIndex < DIFFICULTY_ORDER.length - 1) {
              const nextDifficulty = DIFFICULTY_ORDER[currentIndex + 1];
              await query(
                `INSERT INTO unlocked_items (user_id, unlock_type, unlock_id, unlocked_at)
                 VALUES ($1, 'difficulty', $2, NOW())
                 ON CONFLICT (user_id, unlock_type, unlock_id) DO NOTHING`,
                [userId, nextDifficulty]
              );
            }
          } catch (error) {
            console.error('Error unlocking difficulty:', error);
          }
        } catch (error) {
          console.error('Error recording difficulty completion:', error);
        }
      }
      
      return; // Exit early - we've updated the existing game
    }
    
    // Save to completed_games table
    await query(
      `INSERT INTO completed_games 
       (user_id, dice_set_name, difficulty, end_reason, final_score, 
        levels_completed, total_rounds, high_single_roll, high_bank, 
        game_state, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        userId,
        diceSetName,
        difficulty,
        endReason,
        finalScore,
        levelsCompleted,
        totalRounds,
        highSingleRoll,
        highBank,
        serializeGameState(gameState) // Store serialized game state for history
      ]
    );
    
    // Update user statistics
    await updateUserStats(userId, endReason, highSingleRoll, highBank);
    
    // Save combination usage
    await saveCombinationUsage(userId, gameState);
    
    // Save charm and consumable usage
    await saveCharmUsage(userId, gameState);
    await saveConsumableUsage(userId, gameState);
    
    // Record difficulty completion if game was won
    if (endReason === 'win') {
      try {
        await query(
          `INSERT INTO difficulty_completions (user_id, difficulty, completed_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id, difficulty) DO NOTHING`,
          [userId, difficulty]
        );
        
        // Also unlock the NEXT difficulty (not the current one)
        try {
          const DIFFICULTY_ORDER = ['plastic', 'copper', 'silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond', 'quantum'];
          const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
          if (currentIndex >= 0 && currentIndex < DIFFICULTY_ORDER.length - 1) {
            const nextDifficulty = DIFFICULTY_ORDER[currentIndex + 1];
            await query(
              `INSERT INTO unlocked_items (user_id, unlock_type, unlock_id, unlocked_at)
               VALUES ($1, 'difficulty', $2, NOW())
               ON CONFLICT (user_id, unlock_type, unlock_id) DO NOTHING`,
              [userId, nextDifficulty]
            );
          }
        } catch (error) {
          console.error('Error unlocking difficulty:', error);
        }
      } catch (error) {
        console.error('Error recording difficulty completion:', error);
      }
    }
    
  } catch (error) {
    console.error('Error saving game completion:', error);
    // Don't throw - we don't want to break the game flow if stats fail
  }
}

/**
 * Update user statistics
 */
async function updateUserStats(
  userId: string,
  endReason: 'win' | 'lost' | 'quit',
  highSingleRoll: number,
  highBank: number
): Promise<void> {
  // Get or create user statistics
  let result = await query(
    'SELECT * FROM user_statistics WHERE user_id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    // Create initial stats record
    await query(
      `INSERT INTO user_statistics (user_id) VALUES ($1)`,
      [userId]
    );
  }
  
  // Update stats
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  // Increment games played
  updates.push(`games_played = games_played + 1`);
  
  // Increment wins or losses
  if (endReason === 'win') {
    updates.push(`wins = wins + 1`);
  } else if (endReason === 'lost') {
    updates.push(`losses = losses + 1`);
  }
  
  // Update high scores if higher
  if (highSingleRoll > 0) {
    updates.push(`high_score_single_roll = GREATEST(high_score_single_roll, $${paramIndex})`);
    values.push(highSingleRoll);
    paramIndex++;
  }
  
  if (highBank > 0) {
    updates.push(`high_score_bank = GREATEST(high_score_bank, $${paramIndex})`);
    values.push(highBank);
    paramIndex++;
  }
  
  values.push(userId);
  
  await query(
    `UPDATE user_statistics 
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE user_id = $${paramIndex}`,
    values
  );
}

/**
 * Save combination usage statistics
 */
async function saveCombinationUsage(userId: string, gameState: GameState): Promise<void> {
  try {
    const combinationCounters = gameState.history.combinationCounters || {};
    
    // Get all combinations that were used (count > 0)
    const usedCombinations = Object.entries(combinationCounters)
      .filter(([_, count]) => count > 0);
    
    if (usedCombinations.length === 0) {
      return;
    }
    
    // For each used combination, update or insert usage stats
    for (const [combinationType, timesUsed] of usedCombinations) {
      // Check if record exists
      let result = await query(
        `SELECT * FROM combination_usage 
         WHERE user_id = $1 AND combination_type = $2`,
        [userId, combinationType]
      );
      
      if (result.rows.length === 0) {
        // Insert new record
        await query(
          `INSERT INTO combination_usage 
           (user_id, combination_type, times_used, first_used_at, last_used_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [userId, combinationType, timesUsed]
        );
      } else {
        // Update existing record
        await query(
          `UPDATE combination_usage
           SET times_used = times_used + $1,
               last_used_at = NOW(),
               updated_at = NOW()
           WHERE user_id = $2 AND combination_type = $3`,
          [timesUsed, userId, combinationType]
        );
      }
    }
  } catch (error) {
    console.error('Error saving combination usage:', error);
    throw error; // Re-throw so it's caught by the outer try-catch
  }
}

/**
 * Save charm usage statistics (purchases, generated, copied)
 */
async function saveCharmUsage(userId: string, gameState: GameState): Promise<void> {
  try {
    const charmCounters = gameState.history.charmCounters || {};
    const charmState = gameState.history.charmState || {};
    
    // Track purchased charms
    for (const [charmId, timesPurchased] of Object.entries(charmCounters)) {
      if (timesPurchased > 0) {
        // Check if record exists
        let result = await query(
          `SELECT * FROM charm_usage 
           WHERE user_id = $1 AND charm_id = $2`,
          [userId, charmId]
        );
        
        if (result.rows.length === 0) {
          // Insert new record
          await query(
            `INSERT INTO charm_usage 
             (user_id, charm_id, times_purchased, first_purchased_at, last_purchased_at)
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [userId, charmId, timesPurchased]
          );
        } else {
          // Update existing record
          await query(
            `UPDATE charm_usage
             SET times_purchased = times_purchased + $1,
                 last_purchased_at = NOW(),
                 updated_at = NOW()
             WHERE user_id = $2 AND charm_id = $3`,
            [timesPurchased, userId, charmId]
          );
        }
      }
    }
    
    // Track generated charms (from Generator charm)
    // This would need to be tracked in charmState if we want to track it
    // For now, we'll just track purchases
    
    // Track copied charms (from Paranoia charm)
    // This would also need to be tracked in charmState if we want to track it
    // For now, we'll just track purchases
  } catch (error) {
    console.error('Error saving charm usage:', error);
    // Don't throw - we don't want to break the game flow if stats fail
  }
}

/**
 * Save consumable usage statistics
 */
async function saveConsumableUsage(userId: string, gameState: GameState): Promise<void> {
  try {
    const consumableUsage = gameState.history.charmState?.consumableUsage || {};
    
    // Track consumable usage 
    const specialKeys = ['totalUsed', 'whimUsed', 'wishUsed'];
    for (const [consumableId, timesUsed] of Object.entries(consumableUsage)) {
      if (specialKeys.includes(consumableId)) {
        continue;
      }
      
      if (typeof timesUsed === 'number' && timesUsed > 0) {
        // Check if record exists
        let result = await query(
          `SELECT * FROM consumable_usage 
           WHERE user_id = $1 AND consumable_id = $2`,
          [userId, consumableId]
        );
        
        if (result.rows.length === 0) {
          // Insert new record
          await query(
            `INSERT INTO consumable_usage 
             (user_id, consumable_id, times_used, first_used_at, last_used_at)
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [userId, consumableId, timesUsed]
          );
        } else {
          // Update existing record
          await query(
            `UPDATE consumable_usage
             SET times_used = times_used + $1,
                 last_used_at = NOW(),
                 updated_at = NOW()
             WHERE user_id = $2 AND consumable_id = $3`,
            [timesUsed, userId, consumableId]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error saving consumable usage:', error);
    // Don't throw - we don't want to break the game flow if stats fail
  }
}

