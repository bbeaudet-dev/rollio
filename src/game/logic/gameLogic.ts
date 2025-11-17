import { Charm, Die, DieValue, GameState, RoundState } from '../types';
import { hasAnyScoringCombination, getAllPartitionings } from '../logic/scoring';
import { shouldTriggerHotDice } from './materialSystem';

interface ScoringContext {
  charms: Charm[];
}

/**
 * Pure game logic functions - no I/O, no side effects
 * These can be used by both CLI and web interfaces
 */


/**
 * Checks if a roll is a flop (no scoring combinations)
 */
export function isFlop(diceHand: Die[]): boolean {
  return !hasAnyScoringCombination(diceHand);
}

/**
 * Checks if hot dice occurred
 * Requires that we're in an active round with roll history (we've rolled before)
 */
export function isHotDice(gameState: GameState, charmManager?: any): boolean {
  const roundState = gameState.currentLevel.currentRound;
  if (!roundState) return false;
  if (!roundState.isActive || !roundState.rollHistory || roundState.rollHistory.length === 0) {
    return false;
  }
  
  // Use material system to check for hot dice triggers
  return shouldTriggerHotDice(roundState.diceHand, charmManager);
}

/**
 * Checks if the current level is completed (pointsBanked >= levelThreshold)
 */
export function isLevelCompleted(gameState: GameState): boolean {
  return gameState.currentLevel.pointsBanked >= gameState.currentLevel.levelThreshold;
}

/**
 * Checks if the player can bank points
 * Requires: round is active, has round points (has rolled and scored), and has banks remaining
 */
export function canBankPoints(gameState: GameState): boolean {
  const roundState = gameState.currentLevel.currentRound;
  if (!roundState) return false;
  return roundState.isActive 
    && roundState.roundPoints > 0 
    && (gameState.currentLevel.banksRemaining || 0) > 0;
}

/**
 * Checks if the game is over (pure check function)
 * Returns true if game should end for any reason
 */
export function isGameOver(gameState: GameState): boolean {
  // Game is over if not active
  if (!gameState.isActive) return true;
  
  // Game is over if no banks remaining (and not in a completed level)
  // Note: If level is completed, player goes to shop, not game over
  if ((gameState.currentLevel.banksRemaining || 0) <= 0) {
    // Only game over if level not completed
    return !isLevelCompleted(gameState);
  }
  
  return false;
} 