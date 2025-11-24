/**
 * Tallying phase logic
 * Calculates money earned at the end of a level
 */

import { GameState, LevelState, Blessing, GamePhase } from '../types';
import { getLevelConfig } from '../data/levels';
import { debugLog } from '../utils/debug';
import { isMinibossLevel, isMainBossLevel } from '../data/worlds';
import { getDifficulty } from '../logic/difficulty';

export interface LevelRewards {
  baseReward: number;
  banksBonus: number; 
  charmBonuses: number;
  blessingBonuses: number;
  total: number;
}

/**
 * Calculate money earned at the end of a level
 * Includes base reward, unused banks bonus, charm bonuses, and blessing bonuses
 */
export function calculateLevelRewards(
  levelNumber: number,
  levelState: LevelState,
  gameState: GameState,
  charmManager?: any
): LevelRewards {
  const difficulty = getDifficulty(gameState);
  const levelConfig = getLevelConfig(levelNumber, difficulty);
  
  // Base level completion reward (skip for Platinum except miniboss/boss)
  let baseReward = 0;
  if (difficulty !== 'platinum' || isMinibossLevel(levelNumber) || isMainBossLevel(levelNumber)) {
    baseReward = levelConfig.baseMoney;
  }
  
  // Unused banks bonus (default $1 per bank, can be modified by blessings)
  const banksRemaining = levelState.banksRemaining || 0;
  let moneyPerBank = 1;
  
  // Check blessings for money per bank modifiers
  for (const blessing of gameState.blessings || []) {
    if (blessing.effect.type === 'moneyPerBank') {
      moneyPerBank += blessing.effect.amount;
    }
  }
  
  const banksBonus = banksRemaining * moneyPerBank;
  
  // Charm bonuses (charms that give money at level end)
  // Note: World completion bonuses (every 5 levels) are handled in advanceToNextWorld
  // Level-specific bonuses (like OneSongGlory) are handled here for all level completions
  let charmBonuses = 0;
  if (charmManager) {
    const activeCharms = charmManager.getActiveCharms?.() || [];
    
    // Call charm-specific level completion bonus functions
    for (const charm of activeCharms) {
      if (charm.calculateLevelCompletionBonus) {
        const bonus = charm.calculateLevelCompletionBonus(levelNumber, levelState, gameState);
        if (bonus > 0) {
          charmBonuses += bonus;
        }
      }
    }
  }
  
  // Blessing bonuses (blessings that give money at level end)
  let blessingBonuses = 0;
  for (const blessing of gameState.blessings || []) {
    if (blessing.effect.type === 'moneyOnLevelEnd') {
      blessingBonuses += blessing.effect.amount;
    }
  }
  
  const total = baseReward + banksBonus + charmBonuses + blessingBonuses;
  
  debugLog(`[TALLYING] Level ${levelNumber} rewards: base=${baseReward}, banks=${banksBonus} (${banksRemaining} banks × $${moneyPerBank}), charms=${charmBonuses}, blessings=${blessingBonuses}, total=${total}`);
  
  return {
    baseReward,
    banksBonus,
    charmBonuses,
    blessingBonuses,
    total
  };
}

/**
 * Apply level rewards to game state (add money)
 */
export function applyLevelRewards(gameState: GameState, rewards: LevelRewards): void {
  gameState.money = (gameState.money || 0) + rewards.total;
  debugLog(`[TALLYING] Added $${rewards.total} to game state. New total: $${gameState.money}`);
}

/**
 * Tally level completion (calculate and apply rewards)
 * This is the "cashing out" phase - applies rewards and prepares for shop
 * Pure function - returns updated game state with rewards stored
 */
export function tallyLevel(gameState: GameState, completedLevelNumber: number, charmManager?: any): {
  gameState: GameState;
  rewards: LevelRewards;
} {
  if (!gameState.currentWorld?.currentLevel) {
    throw new Error('Cannot tally level: currentWorld.currentLevel is undefined');
  }
  
  const newGameState = { ...gameState };
  const currentLevel = newGameState.currentWorld!.currentLevel;
  
  // Calculate rewards
  const rewards = calculateLevelRewards(completedLevelNumber, currentLevel, newGameState, charmManager);
  
  // Apply rewards (add money)
  applyLevelRewards(newGameState, rewards);
  
  // Store rewards in current level state (will be moved to history when advancing)
  newGameState.currentWorld = {
    ...newGameState.currentWorld!,
    currentLevel: {
      ...currentLevel,
      rewards
    }
  };
  
  // Set game phase to tallying (player will see tally modal)
  newGameState.gamePhase = 'tallying';
  
  return {
    gameState: newGameState,
    rewards
  };
}

