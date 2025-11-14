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
  isFlop?: boolean;
  flopShieldAvailable?: boolean;
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

export interface ScoringStep {
  type: 'findCombinations' | 'applyCharms' | 'applyMaterials' | 'removeDice' | 'addPoints' | 'incrementCrystals' | 'processHotDice' | 'updateHistory';
  gameState: GameState;
  data?: any;
}

