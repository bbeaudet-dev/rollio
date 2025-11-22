/**
 * Flop-related game logic
 * Handles flop penalties, tracking, and game over conditions
 */

import { GameState } from '../types';
import { getDifficultyConfig } from './difficulty';

/**
 * Increment consecutive flops counter
 */
export function incrementConsecutiveFlops(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.consecutiveFlops = 
    (gameState.currentLevel.consecutiveFlops || 0) + 1;
  return newGameState;
}

/**
 * Reset consecutive flop counter to 0
 */
export function resetConsecutiveFlops(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.consecutiveFlops = 0;
  return newGameState;
}

/**
 * Calculate progressive flop penalty percentage based on flop count
 * First flop: 0%, then 5% increments up to 20%, then 10% increments up to 50%,
 * then 25% increments up to 150%, then 50% increments up to 300%,
 * then 100% increments up to 500%, then 250% increments up to 1000%,
 * then 500% increments (1500%, 2000%, etc.)
 */
export function calculateFlopPenaltyPercentage(flopCount: number): number {
  if (flopCount <= 1) return 0; // First flop is free
  
  // 5% increments: flops 2-5 (5%, 10%, 15%, 20%)
  if (flopCount <= 5) {
    return (flopCount - 1) * 5;
  }
  
  // 10% increments: flops 6-8 (30%, 40%, 50%)
  if (flopCount <= 8) {
    return 20 + (flopCount - 5) * 10;
  }
  
  // 25% increments: flops 9-12 (75%, 100%, 125%, 150%)
  if (flopCount <= 12) {
    return 50 + (flopCount - 8) * 25;
  }
  
  // 50% increments: flops 13-15 (200%, 250%, 300%)
  if (flopCount <= 15) {
    return 150 + (flopCount - 12) * 50;
  }
  
  // 100% increments: flops 16-17 (400%, 500%)
  if (flopCount <= 17) {
    return 300 + (flopCount - 15) * 100;
  }
  
  // 250% increments: flops 18-19 (750%, 1000%)
  if (flopCount <= 19) {
    return 500 + (flopCount - 17) * 250;
  }
  
  // 500% increments: flop 20+ (1500%, 2000%, 2500%, etc.)
  return 1000 + (flopCount - 19) * 500;
}

/**
 * Apply progressive flop penalty based on flops this level
 * First flop: 0%, then progressively increases
 */
export function applyFlopPenalty(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  
  // Ensure flopsThisLevel exists
  if (newGameState.currentLevel.flopsThisLevel === undefined) {
    newGameState.currentLevel.flopsThisLevel = 0;
  }
  
  // Increment flops this level
  newGameState.currentLevel.flopsThisLevel += 1;
  
  const levelThreshold = newGameState.currentLevel.levelThreshold;
  const flopCount = newGameState.currentLevel.flopsThisLevel;
  const penaltyPercentage = calculateFlopPenaltyPercentage(flopCount);
  const penaltyAmount = levelThreshold * (penaltyPercentage / 100);
  const currentBanked = newGameState.currentLevel.pointsBanked;
  const newBanked = currentBanked - penaltyAmount;
  newGameState.currentLevel.pointsBanked = newBanked;
  
  // Debug log to verify penalty is applied
  console.log(`[FLOP PENALTY] Flop #${flopCount} this level: -${penaltyPercentage}% (${penaltyAmount.toFixed(1)} points) of threshold ${levelThreshold}. Banked points: ${currentBanked} → ${newBanked}`);
  
  return newGameState;
}

/**
 * Check if max flops per level has been exceeded and end game if so
 * Returns updated game state (may be marked as inactive if limit exceeded)
 */
export function checkMaxFlopsPerLevel(gameState: GameState): GameState {
  const difficultyConfig = getDifficultyConfig(gameState.config.difficulty);
  
  // If no max flops limit, return unchanged
  if (difficultyConfig.maxFlopsPerLevel === undefined) {
    return gameState;
  }
  
  const flopsThisLevel = gameState.currentLevel.flopsThisLevel || 0;
  
  // Check if limit exceeded
  if (flopsThisLevel > difficultyConfig.maxFlopsPerLevel) {
    const newGameState = { ...gameState };
    newGameState.isActive = false;
    newGameState.endReason = 'lost';
    return newGameState;
  }
  
  return gameState;
}

