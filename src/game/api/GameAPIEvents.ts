import { GameState } from '../types';

/**
 * GameAPI Event Types
 * 
 * Events emitted by GameAPI for state changes and game actions.
 * All events include gameState
 */

export type GameAPIEvent =
  | 'stateChanged'
  | 'levelStarted'
  | 'roundStarted'
  | 'roundEnded'
  | 'diceRolled'
  | 'diceScored'
  | 'pointsBanked'
  | 'flopOccurred'
  | 'levelCompleted'
  | 'levelTallied'
  | 'worldSelected'
  | 'gameEnded'
  | 'error';

export interface GameAPIEventData {
  stateChanged: {
    gameState: GameState;
  };
  levelStarted: {
    levelNumber: number;
    gameState: GameState;
  };
  roundStarted: {
    roundNumber: number;
    gameState: GameState;
  };
  roundEnded: {
    roundNumber: number;
    reason: 'bank' | 'flop';
    gameState: GameState;
  };
  diceRolled: {
    rollNumber: number;
    gameState: GameState;
  };
  diceScored: {
    selectedIndices: number[];
    points: number;
    combinations: string[];
    gameState: GameState;
  };
  pointsBanked: {
    points: number;
    gameState: GameState;
  };
  flopOccurred: {
    forfeitedPoints: number;
    consecutiveFlops: number;
    gameState: GameState;
  };
  levelCompleted: {
    levelNumber: number;
    gameState: GameState;
  };
  levelTallied: {
    levelNumber: number;
    rewards: any;
    gameState: GameState;
  };
  worldSelected: {
    worldId: string;
    gameState: GameState;
  };
  gameEnded: {
    reason: string;
    gameState: GameState;
  };
  error: {
    error: Error;
    context?: any;
  };
}

