import { GameState, GameConfig } from '../types';

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
}

export interface ScoreDiceResult {
  success: boolean;
  gameState: GameState;
  points: number;
  combinations: string[];
  hotDice: boolean;
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

