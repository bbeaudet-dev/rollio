/**
 * CLI-specific game actions
 * These functions are used only by the CLI interface and return RoundActionResult
 * which is a CLI-specific format for displaying round outcomes.
 */

import { GameState, DieValue } from '../game/types';
import { DEFAULT_GAME_CONFIG } from '../game/utils/factories';
import { incrementConsecutiveFlops, resetConsecutiveFlops, advanceToNextLevel, endGame, applyFlopPenalty } from '../game/logic/gameActions';
import { isLevelCompleted } from '../game/logic/gameLogic';
import { MAX_LEVEL } from '../game/data/levels';

export interface RoundActionResult {
  roundActive: boolean;
  newHand: DieValue[];
  hotDice: boolean;
  flop: boolean;
  banked: boolean;
  pointsScored: number;
  message?: string;
}

/**
 * Processes a flop that has occurred and was not prevented (CLI-only)
 * Increments consecutive flops counter and calculates penalties
 */
export function processFlop(
  roundPoints: number,
  levelBankedPoints: number, 
  gameState: GameState
): RoundActionResult {
  // Increment consecutive flops counter
  const newGameState = incrementConsecutiveFlops(gameState);
  const consecutiveFlopCount = newGameState.currentLevel.consecutiveFlops || 0;
  
  const forfeitedPoints = roundPoints;
  const consecutiveFlopLimit = gameState.config?.penalties?.consecutiveFlopLimit ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;

  // Check if game over (3 consecutive flops = game over, handled in updateGameStateAfterRound)
  const isGameOverCheck = consecutiveFlopCount >= consecutiveFlopLimit;
  const warningMessage = consecutiveFlopCount === consecutiveFlopLimit - 1
    ? ` You flopped! Round points forfeited: ${forfeitedPoints}. Warning: One more flop and game over!`
    : `You flopped! Round points forfeited: ${forfeitedPoints}.`;

  return {
    roundActive: false,
    newHand: [],
    hotDice: false,
    flop: true,
    banked: false,
    pointsScored: 0,
    message: isGameOverCheck
      ? `You flopped! Round points forfeited: ${forfeitedPoints}. Game over - ${consecutiveFlopLimit} consecutive flops!`
      : warningMessage
  };
}

/**
 * Processes a bank action (CLI-only)
 */
export function processBankAction(
  roundPoints: number
): RoundActionResult {
  return {
    roundActive: false,
    newHand: [],
    hotDice: false,
    flop: false,
    banked: true,
    pointsScored: roundPoints,
    message: `You banked ${roundPoints} points!`
  };
}

/**
 * Updates game state after a round (CLI-only)
 * NOTE: This function mutates gameState for CLI compatibility
 */
export function updateGameStateAfterRound(
  gameState: GameState,
  roundState: any,
  roundActionResult: RoundActionResult,
  charmManager?: any
): { levelCompleted?: boolean; levelAdvanced?: boolean } {
  let levelCompleted = false;
  let levelAdvanced = false;
  
  if (roundActionResult.banked) {
    gameState.currentLevel.pointsBanked += roundActionResult.pointsScored;
    gameState.history.totalScore += roundActionResult.pointsScored;
    
    // Mark round as banked for displayBetweenRounds
    roundState.banked = true;
    
    // Reset consecutive flops on bank
    Object.assign(gameState, resetConsecutiveFlops(gameState));
    
    // Check for level completion after banking
    if (isLevelCompleted(gameState)) {
      levelCompleted = true;
      const completedLevelNumber = gameState.currentLevel.levelNumber;
      
      // Check if player won the game (completed max level)
      if (completedLevelNumber >= MAX_LEVEL) {
        Object.assign(gameState, endGame(gameState, 'win'));
      } else {
        Object.assign(gameState, advanceToNextLevel(gameState, charmManager));
        levelAdvanced = true;
      }
    }
  } else if (roundActionResult.flop) {
    // Set forfeitedPoints for display and Forfeit Recovery consumable
    roundState.forfeitedPoints = roundState.roundPoints;
    
    // Mark round as flopped for displayBetweenRounds
    roundState.flopped = true;
    
    // Apply flop penalty: reduce level threshold by 10% (can go negative)
    Object.assign(gameState, applyFlopPenalty(gameState));
        
    // Check for game over: 3 consecutive flops = game over
    const consecutiveFlopLimit = gameState.config?.penalties?.consecutiveFlopLimit ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    const charmPreventingFlop = (gameState.charms || []).some((charm: any) => charm.flopPreventing);
    
    if (gameState.currentLevel.consecutiveFlops >= consecutiveFlopLimit && !charmPreventingFlop) {
      // Game over: 3 consecutive flops
      Object.assign(gameState, endGame(gameState, 'lost'));
    }
  }
  
  return {
    levelCompleted: levelCompleted || false, 
    levelAdvanced: levelAdvanced || false 
  };
}
