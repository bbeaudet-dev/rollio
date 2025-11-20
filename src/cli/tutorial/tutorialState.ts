import { Die, GameState, RoundState, DiceSetConfig, DiceMaterialType, CombinationCounters } from '../../game/types';
import { CharmManager } from '../../game/logic/charmSystem';

export interface TutorialState {
  currentLesson: string;
  step: number;
  gameState: GameState;
  roundState: RoundState;
  charmManager: CharmManager;
  completedLessons: Set<string>;
  isActive: boolean;
}

export class TutorialStateManager {
  private state: TutorialState;

  constructor() {
    this.state = this.createInitialTutorialState();
  }

  private createInitialTutorialState(): TutorialState {
    // Create a minimal game state for tutorial
    const diceSetConfig: DiceSetConfig = {
      name: 'Tutorial Set',
      dice: [
        { id: 'd1', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' as DiceMaterialType },
        { id: 'd2', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' as DiceMaterialType },
        { id: 'd3', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' as DiceMaterialType },
        { id: 'd4', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' as DiceMaterialType },
        { id: 'd5', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' as DiceMaterialType },
        { id: 'd6', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' as DiceMaterialType }
      ],
      startingMoney: 0,
      charmSlots: 0,
      consumableSlots: 0,
      baseLevelRerolls: 0,
      baseLevelBanks: 0,
      setType: 'standard'
    };

    const gameState: GameState = {
      isActive: true,
      money: 0,
      diceSet: diceSetConfig.dice.map(d => ({ ...d, scored: false, rolledValue: undefined })),
      charms: [],
      consumables: [],
      blessings: [],
      baseLevelRerolls: 0,
      baseLevelBanks: 0,
      charmSlots: 0,
      consumableSlots: 0,
      settings: {
        sortDice: 'unsorted',
        gameSpeed: 'default',
        optimizeRollScore: false
      },
      config: {
        diceSetConfig,
        penalties: {
          consecutiveFlopLimit: 3,
        }
      },
      currentLevel: {
        levelNumber: 1,
        levelThreshold: 1000,
        rerollsRemaining: 0,
        banksRemaining: 0,
        consecutiveFlops: 0,
        pointsBanked: 0,
        shop: {
          isOpen: false,
          availableCharms: [],
          availableConsumables: [],
          availableBlessings: []
        },
        currentRound: {
          roundNumber: 1,
          roundPoints: 0,
          diceHand: [],
          hotDiceCounter: 0,
          forfeitedPoints: 0,
          crystalsScoredThisRound: 0,
          isActive: true,
          rollHistory: []
        }
      },
      history: {
        totalScore: 0,
        combinationCounters: {},
        levelHistory: []
      }
    };

    const roundState: RoundState = {
      roundNumber: 1,
      roundPoints: 0,
      diceHand: [],
      hotDiceCounter: 0,
      forfeitedPoints: 0,
      crystalsScoredThisRound: 0,
      isActive: true,
      rollHistory: []
    };

    return {
      currentLesson: '',
      step: 0,
      gameState,
      roundState,
      charmManager: new CharmManager(),
      completedLessons: new Set(),
      isActive: true
    };
  }

  getState(): TutorialState {
    return this.state;
  }

  setLesson(lesson: string): void {
    this.state.currentLesson = lesson;
    this.state.step = 0;
  }

  nextStep(): void {
    this.state.step++;
  }

  completeLesson(lesson: string): void {
    this.state.completedLessons.add(lesson);
  }

  resetForNewLesson(): void {
    // Reset game state but keep completed lessons
    const completedLessons = this.state.completedLessons;
    this.state = this.createInitialTutorialState();
    this.state.completedLessons = completedLessons;
  }

  isLessonCompleted(lesson: string): boolean {
    return this.state.completedLessons.has(lesson);
  }

  getCurrentStep(): number {
    return this.state.step;
  }

  getCurrentLesson(): string {
    return this.state.currentLesson;
  }
} 