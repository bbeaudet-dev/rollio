import { Charm, Die, DieValue, GameState, RoundState } from '../types';
import { hasAnyScoringCombination, getAllPartitionings } from '../logic/scoring';
import { shouldTriggerHotDice } from './materialSystem';
import { checkFlopShieldAvailable } from './charms/CommonCharms';

interface ScoringContext {
  charms: Charm[];
}

/**
 * Pure game logic functions - no I/O, no side effects
 * These can be used by both CLI and web interfaces
 */


/**
 * Checks if a roll is a flop (no scoring combinations)
 * REQUIRES gameState - always respects difficulty restrictions and flop shield availability
 * If flop shield is available, it's not a flop (shield can prevent it)
 */
export function isFlop(diceHand: Die[], gameState: GameState): boolean {
  const difficulty = gameState.config.difficulty;
  const hasScoringCombinations = hasAnyScoringCombination(diceHand, difficulty);
  
  // If there are scoring combinations, it's not a flop
  if (hasScoringCombinations) {
    return false;
  }
  
  // No scoring combinations - check if flop shield is available
  // If flop shield is available, it's not a flop (shield can prevent it)
  const shieldCheck = checkFlopShieldAvailable(gameState);
  if (shieldCheck.available) {
    return false;
  }
  
  // No scoring combinations and no flop shield - it's a flop
  return true;
}

/**
 * Checks if hot dice occurred
 * Requires that we're in an active round with roll history (we've rolled before)
 */
export function isHotDice(gameState: GameState, charmManager?: any): boolean {
  const roundState = gameState.currentWorld!.currentLevel.currentRound;
  if (!roundState || !roundState.isActive || !roundState.rollHistory || roundState.rollHistory.length === 0) {
    return false;
  }
  
  // Use material system to check for hot dice triggers
  return shouldTriggerHotDice(roundState.diceHand, charmManager);
}

/**
 * Checks if the current level is completed (pointsBanked >= levelThreshold)
 */
export function isLevelCompleted(gameState: GameState): boolean {
  const currentLevel = gameState.currentWorld!.currentLevel;
  return currentLevel.pointsBanked >= currentLevel.levelThreshold;
}

/**
 * Checks if the player can bank points
 * Requires: round is active, has round points (has rolled and scored), and has banks remaining
 */
export function canBankPoints(gameState: GameState): boolean {
  if (!gameState.currentWorld) return false;
  const currentLevel = gameState.currentWorld.currentLevel;
  const roundState = currentLevel.currentRound;
  if (!roundState) return false;
  return roundState.isActive 
    && roundState.roundPoints > 0 
    && (currentLevel.banksRemaining || 0) > 0;
}

/**
 * Checks if the game is over (pure check function)
 * Returns true if game should end for any reason
 */
export function isGameOver(gameState: GameState): boolean {
  // Game is over if not active
  if (!gameState.isActive) return true;
  
  const currentLevel = gameState.currentWorld!.currentLevel;
  
  // Game is over if no banks remaining (and not in a completed level)
  // Note: If level is completed, player goes to shop, not game over
  if ((currentLevel.banksRemaining || 0) <= 0) {
    // Only game over if level not completed
    return !isLevelCompleted(gameState);
  }
  
  return false;
}

// Checks if the player can roll dice
export function canRoll(gameState: GameState): boolean {
  if (!gameState.isActive) return false;
  if (!gameState.currentWorld) return false;
  if ((gameState.currentWorld.currentLevel.banksRemaining || 0) <= 0) return false;
  
  const roundState = gameState.currentWorld.currentLevel.currentRound;
  if (!roundState) return true; // Can start new round
  if (!roundState.isActive) return true; // Can start new round
  
  const hasRolled = roundState.rollHistory.length > 0;
  const hasRoundPoints = roundState.roundPoints > 0;
  return !hasRolled || hasRoundPoints;
}

/**
 * Checks if the player can select dice to score
 * Can select if: round is active, has rolled dice, has dice in hand
 */
export function canSelectDice(gameState: GameState): boolean {
  if (!gameState.isActive) return false;
  if (!gameState.currentWorld) return false;
  const roundState = gameState.currentWorld.currentLevel.currentRound;
  if (!roundState || !roundState.isActive) return false;
  // Must have rolled dice and have dice in hand to select
  return roundState.rollHistory.length > 0 && roundState.diceHand.length > 0;
}
