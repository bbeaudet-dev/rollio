// DICE SET TYPES
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceMaterial {
  id: string;
  name: string;
  description: string;
  abbreviation?: string;
}

export type DiceMaterialType = 'plastic' | 'crystal' | 'flower' | 'golden' | 'volcano' | 'mirror' | 'rainbow' | 'ghost' | 'lead';

export interface Die {
  id: string;
  sides: number;
  allowedValues: number[];
  material: DiceMaterialType;
  scored?: boolean; // Set at runtime
  rolledValue?: number; // Set at runtime
}

export type DiceSetType = 'beginner' | 'advanced' | 'mayhem';

export interface DiceSetConfig {
  name: string;
  dice: Omit<Die, 'scored' | 'rolledValue'>[]; // Die config without runtime state
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
  baseLevelRerolls: number; 
  baseLevelBanks: number;
  setType: DiceSetType;
}

// SCORING TYPES
import { ScoringCombinationType } from './data/combinations';
export type CombinationCounters = Record<ScoringCombinationType, number>;

export interface ScoringCombination {
  type: string;
  dice: number[];
  points: number;
}

export interface ScoringResult {
  combinations: ScoringCombination[];
  totalPoints: number;
  selectedDice: number[];
}

// UPGRADE TYPES
export interface Charm {
  id: string;
  name: string;
  description: string;
  active: boolean;
  rarity?: CharmRarity; // For charm selection
  uses?: number; // For limited-use charms
  buyValue?: number;
  sellValue?: number;
  // Charm effect properties
  flopPreventing?: boolean;
  combinationFiltering?: boolean;
  scoreMultiplier?: number;
  ruleChange?: string;
  // Add runtime state/effects as needed
  filterScoringCombinations?: (combinations: any[], context: any) => any[];
}

export type CharmRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Consumable {
  id: string;
  name: string;
  description: string;
  uses: number;
  // Add runtime state/effects as needed
}

export interface Blessing {
  id: string;
  tier: 1 | 2 | 3;
  effect: BlessingEffect;
}

export type BlessingEffect =
  | { type: "baseLevelRerolls"; amount: number }
  | { type: "baseLevelBanks"; amount: number }
  | { type: "rerollOnBank"; amount: number }
  | { type: "rerollOnFlop"; amount: number }
  | { type: "rerollOnCombination"; combination: string; amount: number }
  | { type: "charmSlots"; amount: number }
  | { type: "consumableSlots"; amount: number }
  | { type: "shopDiscount"; percentage: number }
  | { type: "flopSubversion"; percentage: number }
  | { type: "moneyPerBank"; amount: number }
  | { type: "moneyOnLevelEnd"; amount: number }
  | { type: "moneyOnRerollUsed"; amount: number };

// GAME ENGINE TYPES

export interface RollState {
  rollNumber: number;  // Within round (1, 2, 3... - stays same for rerolls in same sequence)
  isReroll: boolean;  // false for initial roll, true for rerolls
  diceHand: Die[];  // Snapshot of dice rolled at this moment
  selectedDice: Die[];
  rollPoints?: number;
  maxRollPoints?: number;
  scoringSelection?: number[];
  combinations?: ScoringCombination[];
  isHotDice?: boolean;
  isFlop?: boolean;
}

// Flattened RoundState (no meta/core/history split)
export interface RoundState {
  roundNumber: number;  // Round number within level (1, 2, 3...)
  roundPoints: number;
  diceHand: Die[];  // Current dice available to roll (changes as you score)
  hotDiceCounter: number; 
  forfeitedPoints: number;
  crystalsScoredThisRound: number; 
  isActive: boolean;
  endReason?: RoundEndReason;

  // Roll history for this round
  rollHistory: RollState[];  // All roll attempts including rerolls

  // Completed round only (in history)
  banked?: boolean;
  flopped?: boolean;
}

// Game settings that can change during gameplay
export interface GameSettings {
  sortDice: 'unsorted' | 'ascending' | 'descending' | 'material'; // How to sort dice for display
  gameSpeed: 'low' | 'default' | 'medium' | 'high' | number; // Game animation speed
  optimizeRollScore: boolean; // Auto-select best scoring combination vs manual selection
}

// Game configuration - set at start, rarely changes
export interface GameConfig {
  diceSetConfig: DiceSetConfig;
  penalties: {
    consecutiveFlopLimit: number;
    flopPenaltyEnabled: boolean;
  };
}

// Shop state and data
export interface ShopState {
  isOpen: boolean;
  availableCharms: Charm[];
  availableConsumables: Consumable[];
  availableBlessings: Blessing[];  // One random blessing per shop
}

// LEVEL STATE (nested for hierarchy)
export interface LevelState {
  levelNumber: number;
  levelThreshold: number;
  worldId?: string;
  worldNumber?: number;
  isMiniboss?: boolean;
  isMainBoss?: boolean;

  // Current level only
  rerollsRemaining?: number;
  banksRemaining?: number;
  consecutiveFlops: number; 
  pointsBanked: number; 
  shop?: ShopState;
  currentRound?: RoundState;

  // Completed level only (in history)
  completed?: boolean;
  roundHistory?: RoundState[];
  rewards?: {
    baseReward: number;
    banksBonus: number;
    charmBonuses: number;
    blessingBonuses: number;
    total: number;
  };
}

// Game history and tracking data (consolidated here)
export interface GameHistory {
  // Cumulative statistics (calculated from nested history)
  totalScore: number;  // Renamed from gameScore - cumulative banked points
  combinationCounters: CombinationCounters;

  // Historical records (nested structure)
  levelHistory: LevelState[];  // Completed levels (excluding current)
  
  // TODO: Future game-wide statistics tracking
  // We want to track cumulative stats across the entire game/run:
  // - Total rolls across all rounds
  // - Total forfeited points across all rounds
  // - Total hot dice occurrences
  // - Other cumulative metrics
  // For now, we only track per-round stats (roundState.hotDiceCounter, roundState.forfeitedPoints)
}

// Main game state - flattened structure (no meta/core split)
export interface GameState {
  // Game-wide state (flattened - no meta/core split)
  isActive: boolean;
  endReason?: GameEndReason;
  money: number;
  diceSet: Die[];
  charms: Charm[];
  consumables: Consumable[];
  blessings: Blessing[];
  baseLevelRerolls: number;  // Base rerolls per level (persists across levels)
  baseLevelBanks: number;    // Base banks per level (persists across levels)
  charmSlots: number;
  consumableSlots: number;
  settings: GameSettings;
  config: GameConfig;

  // Current level state (nested for hierarchy)
  currentLevel: LevelState;

  // History (consolidated here - all history in one place)
  history: GameHistory;
}

// ENDGAME TYPES
export type GameEndReason = 'win' | 'quit' | 'lost';
export type RoundEndReason = 'flopped' | 'banked';
export type RollEndReason = 'flopped' | 'scored';