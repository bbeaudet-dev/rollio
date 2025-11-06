import { Die, ScoringCombination, GameState } from './types';

/**
 * Interface for displaying game output
 */
export interface DisplayInterface {
  log(message: string, delayBefore?: number, delayAfter?: number): Promise<void>;
  displayWelcome(): Promise<void>;
  displayRoundStart(roundNumber: number): Promise<void>;
  displayRoll(rollNumber: number, dice: Die[]): Promise<void>;
  displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, levelBankedPoints: number, consecutiveFlopPenalty: number, consecutiveFlopLimit: number): Promise<void>;
  displayHotDice(count?: number): Promise<void>;
  displayScoringResult(selectedIndices: number[], dice: Die[], combinations: ScoringCombination[], points: number): Promise<void>;
  displayRoundPoints(points: number): Promise<void>;
  displayBankedPoints(points: number): Promise<void>;
  displayGameScore(score: number): Promise<void>;
  displayBetweenRounds(gameState: GameState): Promise<void>;
  displayWinCondition(): Promise<void>;
  displayGameEnd(gameState: GameState): Promise<void>;
  displayGoodbye(): Promise<void>;
}

/**
 * Interface for getting user input
 */
export interface InputInterface {
  ask(question: string): Promise<string>;
  askForDiceSelection(dice: Die[], consumables?: any[], useCallback?: (idx: number) => Promise<void>, gameState?: any): Promise<string>;
  askForBankOrReroll(diceToReroll: number): Promise<string>;
  askForReroll(dice: Die[], rerollsRemaining: number): Promise<string>;
  askForNextRound(gameState?: any): Promise<string>;
  askForPartitioningChoice(numPartitionings: number): Promise<string>;
  askForCharmSelection(availableCharms: string[], numToSelect: number): Promise<number[]>;
  askForConsumableSelection(availableConsumables: string[], numToSelect: number): Promise<number[]>;
  askForMaterialAssignment(diceCount: number, availableMaterials: string[]): Promise<number[]>;
  askForDieSelection(dice: Die[], prompt: string): Promise<number>;
  askForShopAction(): Promise<string>;
  askForShopPurchase(shopType: 'charm' | 'consumable' | 'blessing'): Promise<string>;
}

/**
 * Interface for the complete game interface
 */
export interface GameInterface extends DisplayInterface, InputInterface {
  // Combined interface for convenience
} 