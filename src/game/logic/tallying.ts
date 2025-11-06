/**
 * Tallying phase logic
 * Calculates money earned at the end of a level
 */

import { GameState, LevelState, Blessing } from '../types';
import { getLevelConfig } from '../data/levels';
import { debugLog } from '../utils/debug';

export interface LevelRewards {
  baseReward: number;
  livesBonus: number;
  charmBonuses: number;
  blessingBonuses: number;
  total: number;
}

/**
 * Calculate money earned at the end of a level
 * Includes base reward, unused lives bonus, charm bonuses, and blessing bonuses
 */
export function calculateLevelRewards(
  levelNumber: number,
  levelState: LevelState,
  gameState: GameState
): LevelRewards {
  const levelConfig = getLevelConfig(levelNumber);
  
  // Base level completion reward
  const baseReward = levelConfig.baseMoney;
  
  // Unused lives bonus (default $1 per life, can be modified by blessings)
  const livesRemaining = levelState.livesRemaining || 0;
  let moneyPerLife = 1;
  
  // Check blessings for money per life modifiers
  for (const blessing of gameState.blessings || []) {
    if (blessing.effect.type === 'moneyPerLife') {
      moneyPerLife += blessing.effect.amount;
    }
  }
  
  const livesBonus = livesRemaining * moneyPerLife;
  
  // Charm bonuses (for now, no charms give money at level end - can add onLevelEnd hook later)
  const charmBonuses = 0;
  
  // Blessing bonuses (blessings that give money at level end)
  let blessingBonuses = 0;
  for (const blessing of gameState.blessings || []) {
    if (blessing.effect.type === 'moneyOnLevelEnd') {
      blessingBonuses += blessing.effect.amount;
    }
  }
  
  const total = baseReward + livesBonus + charmBonuses + blessingBonuses;
  
  debugLog(`[TALLYING] Level ${levelNumber} rewards: base=${baseReward}, lives=${livesBonus} (${livesRemaining} lives × $${moneyPerLife}), charms=${charmBonuses}, blessings=${blessingBonuses}, total=${total}`);
  
  return {
    baseReward,
    livesBonus,
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

