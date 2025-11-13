/**
 * ReactGameInterface
 * 
 * Implements GameInterface for React app by converting async prompts to state updates.
 * Instead of blocking on user input, it stores pending actions that React can handle.
 */

import { GameInterface } from '../../cli/interfaces';
import { Die, ScoringCombination, GameState } from '../../game/types';

export type PendingAction = 
  | { type: 'none' }
  | { type: 'reroll'; dice: Die[]; rerollsRemaining: number }
  | { type: 'diceSelection'; dice: Die[]; consumables?: any[] }
  | { type: 'bankOrReroll'; diceToReroll: number }
  | { type: 'partitioningChoice'; numPartitionings: number }
  | { type: 'nextRound'; gameState: GameState }
  | { type: 'shopAction' }
  | { type: 'shopPurchase'; shopType: 'charm' | 'consumable' | 'blessing' }
  | { type: 'flopContinue'; forfeitedPoints: number; consecutiveFlops: number }
  | { type: 'flopShieldChoice'; canPrevent: boolean; log: string | null };

export class ReactGameInterface implements GameInterface {
  private pendingAction: PendingAction = { type: 'none' };
  private pendingActionResolve: ((value: string) => void) | null = null;
  private messages: string[] = [];

  // Get current pending action
  getPendingAction(): PendingAction {
    return this.pendingAction;
  }

  // Resolve a pending action with user input
  resolvePendingAction(value: string): void {
    if (this.pendingActionResolve) {
      this.pendingActionResolve(value);
      this.pendingActionResolve = null;
      this.pendingAction = { type: 'none' };
    }
  }

  // Get messages and clear them
  getMessages(): string[] {
    const msgs = [...this.messages];
    this.messages = [];
    return msgs;
  }

  // DisplayInterface methods
  async log(message: string, delayBefore?: number, delayAfter?: number): Promise<void> {
    this.messages.push(message);
  }

  async displayWelcome(): Promise<void> {
    this.messages.push('=== Welcome to Rollio! ===');
  }

  async displayRoundStart(roundNumber: number): Promise<void> {
    this.messages.push(`--- Round ${roundNumber} ---`);
  }

  async displayRoll(rollNumber: number, dice: Die[]): Promise<void> {
    const values = dice.map(d => d.rolledValue || 0).join(' ');
    this.messages.push(`Roll #${rollNumber}: ${values}`);
  }

  async displayFlopMessage(
    forfeitedPoints: number,
    consecutiveFlops: number,
    levelBankedPoints: number,
    consecutiveFlopPenalty: number,
    consecutiveFlopLimit: number
  ): Promise<void> {
    this.messages.push(`You flopped! Points forfeited: ${forfeitedPoints}`);
    if (consecutiveFlops >= consecutiveFlopLimit) {
      this.messages.push(`Consecutive flop penalty: -${consecutiveFlopPenalty} points`);
    }
  }

  async displayHotDice(count?: number): Promise<void> {
    this.messages.push(`🔥 Hot dice! ${count ? `(${count}x)` : ''}`);
  }

  async displayScoringResult(
    selectedIndices: number[],
    dice: Die[],
    combinations: ScoringCombination[],
    points: number
  ): Promise<void> {
    const comboTypes = combinations.map(c => c.type).join(', ');
    this.messages.push(`Scored ${points} points from: ${comboTypes}`);
  }

  async displayRoundPoints(points: number): Promise<void> {
    this.messages.push(`Round points: ${points}`);
  }

  async displayBankedPoints(points: number): Promise<void> {
    this.messages.push(`Banked ${points} points!`);
  }

  async displayGameScore(score: number): Promise<void> {
    this.messages.push(`Total score: ${score}`);
  }

  async displayBetweenRounds(gameState: GameState): Promise<void> {
    const roundNumber = gameState.currentLevel.currentRound?.roundNumber || 0;
    const roundState = gameState.currentLevel.currentRound;
    const isFlop = roundState?.flopped || false;
    const roundPoints = roundState?.roundPoints || 0;
    
    this.messages.push(`=== Round ${roundNumber} Complete ===`);
    const pointsLabel = isFlop ? 'Points Forfeited: -' : 'Points Scored: +';
    this.messages.push(`${pointsLabel}${roundPoints}`);
    this.messages.push(`Points: ${gameState.currentLevel.pointsBanked} / ${gameState.currentLevel.levelThreshold}`);
    this.messages.push(`Flops: ${gameState.currentLevel.consecutiveFlops}`);
    this.messages.push(`Lives: ${gameState.currentLevel.banksRemaining}`);
  }

  async displayWinCondition(): Promise<void> {
    this.messages.push('You won!');
  }

  async displayGameEnd(gameState: GameState): Promise<void> {
    this.messages.push('=== GAME OVER ===');
    this.messages.push('Thanks for playing Rollio!');
  }

  async displayGoodbye(): Promise<void> {
    this.messages.push('Goodbye!');
  }

  // InputInterface methods - these create pending actions
  async ask(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.pendingActionResolve = resolve;
      // Store the question in messages for display
      this.messages.push(question);
    });
  }

  async askForDiceSelection(
    dice: Die[],
    consumables?: any[],
    useCallback?: (idx: number) => Promise<void>,
    gameState?: any
  ): Promise<string> {
    return new Promise((resolve) => {
      this.pendingAction = { type: 'diceSelection', dice, consumables };
      this.pendingActionResolve = resolve;
    });
  }

  async askForBankOrReroll(diceToReroll: number): Promise<string> {
    return new Promise((resolve) => {
      this.pendingAction = { type: 'bankOrReroll', diceToReroll };
      this.pendingActionResolve = resolve;
    });
  }

  async askForReroll(dice: Die[], rerollsRemaining: number): Promise<string> {
    return new Promise((resolve) => {
      this.pendingAction = { type: 'reroll', dice, rerollsRemaining };
      this.pendingActionResolve = resolve;
    });
  }

  async askForNextRound(gameState?: any): Promise<string> {
    return new Promise((resolve) => {
      if (gameState) {
        this.pendingAction = { type: 'nextRound', gameState };
      }
      this.pendingActionResolve = resolve;
    });
  }

  async askForPartitioningChoice(numPartitionings: number): Promise<string> {
    return new Promise((resolve) => {
      this.pendingAction = { type: 'partitioningChoice', numPartitionings };
      this.pendingActionResolve = resolve;
    });
  }

  async askForCharmSelection(availableCharms: string[], numToSelect: number): Promise<number[]> {
    // For now, return empty array - can implement later if needed
    return [];
  }

  async askForConsumableSelection(availableConsumables: string[], numToSelect: number): Promise<number[]> {
    // For now, return empty array - can implement later if needed
    return [];
  }

  async askForMaterialAssignment(diceCount: number, availableMaterials: string[]): Promise<number[]> {
    // For now, return array of zeros - can implement later if needed
    return new Array(diceCount).fill(0);
  }

  async askForDieSelection(dice: Die[], prompt: string): Promise<number> {
    this.messages.push(prompt);
    return new Promise((resolve) => {
      // For now, return 0 - can implement later if needed
      resolve(0);
    });
  }

  async askForShopAction(): Promise<string> {
    return new Promise((resolve) => {
      this.pendingAction = { type: 'shopAction' };
      this.pendingActionResolve = resolve;
    });
  }

  async askForShopPurchase(shopType: 'charm' | 'consumable' | 'blessing'): Promise<string> {
    return new Promise((resolve) => {
      this.pendingAction = { type: 'shopPurchase', shopType };
      this.pendingActionResolve = resolve;
    });
  }
}

