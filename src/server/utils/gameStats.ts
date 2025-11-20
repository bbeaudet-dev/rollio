/**
 * Utilities for saving game statistics to the database
 */

import { query } from '../db';
import { GameState } from '../../game/types';
import { serializeGameState } from './gameStateSerialization';

/**
 * Save game completion statistics
 * Called when a game ends (win, loss, or quit)
 */
export async function saveGameCompletion(
  userId: string,
  gameState: GameState,
  endReason: 'win' | 'lost' | 'quit'
): Promise<void> {
  try {
    const diceSetName = gameState.config.diceSetConfig.name || 'Unknown';
    const difficulty = gameState.config.difficulty;
    // Calculate final score from all banked points in completed levels
    const finalScore = gameState.history.levelHistory.reduce((sum, level) => {
      return sum + (level.pointsBanked || 0);
    }, 0) + (gameState.currentLevel.pointsBanked || 0);
    
    // Count levels completed (from levelHistory)
    const levelsCompleted = gameState.history.levelHistory.length;
    
    // Count total rounds (sum of rounds from all completed levels)
    let totalRounds = 0;
    gameState.history.levelHistory.forEach(level => {
      if (level.roundHistory) {
        totalRounds += level.roundHistory.length;
      }
    });
    // Add current level rounds if game ended mid-level
    if (gameState.currentLevel.currentRound) {
      totalRounds += 1; // At least one round in current level
    }
    
    const highSingleRoll = gameState.history.highScoreSingleRoll || 0;
    const highBank = gameState.history.highScoreBank || 0;
    
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
  const combinationCounters = gameState.history.combinationCounters;
  
  // Get all combinations that were used (count > 0)
  const usedCombinations = Object.entries(combinationCounters)
    .filter(([_, count]) => count > 0);
  
  // For each used combination, update or insert usage stats
  for (const [combinationType, timesUsed] of usedCombinations) {
    // Check if record exists
    let result = await query(
      `SELECT * FROM combination_usage 
       WHERE user_id = $1 AND combination_type = $2`,
      [userId, combinationType]
    );
    
    // Calculate total points and highest score for this combination
    // This is a simplified version - in a full implementation, we'd track
    // points per combination during gameplay
    const totalPoints = 0; // TODO: Track this during gameplay
    const highestScore = 0; // TODO: Track this during gameplay
    
    if (result.rows.length === 0) {
      // Insert new record
      await query(
        `INSERT INTO combination_usage 
         (user_id, combination_type, times_used, total_points_scored, 
          highest_score, first_used_at, last_used_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, combinationType, timesUsed, totalPoints, highestScore]
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
}

