import { GameState } from '../types';
import type { ScoringBreakdown } from '../logic/scoringBreakdown';

/**
 * GameAPI-specific types
 * 
 * All results include gameState, which contains currentLevel.currentRound.
 */

export interface InitializeGameResult {
  gameState: GameState;
}

export interface RollDiceResult {
  gameState: GameState;
  rollNumber: number;
  isFlop?: boolean;
  flopShieldAvailable?: boolean;
}

export interface RerollDiceResult {
  gameState: GameState;
  isFlop: boolean;
  flopShieldAvailable: boolean;
}

export interface ScoreDiceResult {
  success: boolean;
  gameState: GameState;
  points: number;
  combinations: string[];
  hotDice: boolean;
  breakdown?: ScoringBreakdown;
}

export interface BankPointsResult {
  gameState: GameState;
  bankedPoints: number;
  levelCompleted: boolean;
}

export interface FlopResult {
  gameState: GameState;
  forfeitedPoints: number;
  consecutiveFlops: number;
}


