// GAME STATE
export interface GameState {
  // Game-wide state (flattened - no meta/core split)
  isActive: boolean;
  config: GameConfig;
  settings: GameSettings;
  history: GameHistory;
  won?: boolean; // true if player won (completed 25 levels), undefined if game still active or lost

  baseLevelRerolls: number;  // Base rerolls per level (persists across levels)
  baseLevelBanks: number;    // Base banks per level (persists across levels)
  charmSlots: number;
  consumableSlots: number;

  gamePhase: GamePhase; // Current phase of the game
  gameMap?: GameMap; // Map generated at game start
  shop?: ShopState;
  currentWorld?: WorldState; // Current world state (includes currentLevel)
  
  money: number;
  diceSet: Die[];
  charms: Charm[];
  consumables: Consumable[];
  blessings: Blessing[];

  lastConsumableUsed?: string;  // For consumable tracking charms - tracks last consumable used
  consecutiveBanks: number;  // Tracks consecutive rounds completed by banking (not flopping)
  consecutiveFlops: number;  // Tracks consecutive flops across the entire game
}


// WORLD STATE
export interface WorldState {
  worldId: string;
  worldNumber: number;
  levelConfigs: import('./data/levels').LevelConfig[]; // Pre-generated level configs for this world 
  worldEffects: import('./data/worlds').WorldEffect[]; // Active world effects
  currentLevel: LevelState; // Current level state (moved from GameState)
}


// LEVEL STATE 
export interface LevelState {
  levelNumber: number;
  levelThreshold: number;
  isMiniboss?: boolean;
  isMainBoss?: boolean;
  levelEffects?: LevelEffect[]; // Active boss/miniboss effects
  effectContext?: EffectContext; // Combined context for filtering
  currentRound?: RoundState;
  pointsBanked: number; 
  rerollsRemaining?: number;
  banksRemaining?: number;
  flopsThisLevel: number; // Track total flops in this level (for progressive penalty)
  banksThisLevel?: number;  // For OneSongGlory charm - tracks banks used in this level
  rewards?: {
    baseReward: number;
    banksBonus: number;
    charmBonuses: number;
    blessingBonuses: number;
    total: number;
  };
}


// ROUND STATE 
export interface RoundState {
  isActive: boolean;
  rollHistory: RollState[];  // All roll attempts including rerolls
  endReason?: 'flop' | 'bank'; 
  roundNumber: number;  // Round number within level (1, 2, 3...)
  roundPoints: number; 
  diceHand: Die[];  // Current dice available to roll (changes as you score)
  hotDiceCounter: number; 
  forfeitedPoints: number;
  flowerCounter?: number;  // tracks flower dice scored
}


// ROLL STATE
export interface RollState {
  rollNumber: number;  // Within round (1, 2, 3... - stays same for rerolls in same sequence)
  isReroll: boolean;  // false for initial roll, true for rerolls
  diceHand: Die[];  // Snapshot of dice rolled at this moment
  selectedDice: Die[];
  scoringSelection?: number[];
  rollPoints?: number;
  maxRollPoints?: number;
  combinations?: ScoringCombination[];
  isHotDice?: boolean;
  isFlop?: boolean;
  scoringBreakdown?: import('./logic/scoringBreakdown').ScoringBreakdown; // Detailed breakdown of scoring calculation
}







// DICE SET TYPES
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

// Import PipEffectType for use in Die interface
import { PipEffectType } from './data/pipEffects';
// Import effect context types (forward declarations - actual imports at usage)
import type { WorldEffectContext } from './logic/worldEffects';
import type { LevelEffect } from './data/levels';
import type { WorldEffect } from './data/worlds';
import type { GameMap } from './logic/mapGeneration';

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
  pipEffects?: Record<number, PipEffectType | 'none'>; // Maps die side value (1-6) to pip effect type
}

export type DiceSetType = 'standard' | 'cheat' | 'challenge';

export interface DiceSetConfig {
  name: string;
  dice: Omit<Die, 'scored' | 'rolledValue'>[]; // Die config without runtime state
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
  baseLevelRerolls: number; 
  baseLevelBanks: number;
  setType: DiceSetType;
  startingCharms?: string[]; 
  startingConsumables?: string[];
  startingBlessings?: string[];
}










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


export type CombinationCounters = Record<string, number>;
export type CombinationLevels = Record<string, number>; // Combination key -> level (default: 1)
export type ConsumableCounters = Record<string, number>; // consumableId -> usage count
export type CharmCounters = Record<string, number>; // charmId -> purchase count
export type BlessingCounters = Record<string, number>; // blessingId -> purchase count (calculate category/tier on-demand)




// Game settings that can change during gameplay
export interface GameSettings {
  sortDice: 'unsorted' | 'ascending' | 'descending' | 'material'; // How to sort dice for display
  gameSpeed: 'low' | 'default' | 'medium' | 'high' | number; // Game animation speed
  optimizeRollScore: boolean; // Auto-select best scoring combination vs manual selection
}

// Game configuration - set at start, rarely changes
export interface GameConfig {
  diceSetConfig: DiceSetConfig;
  difficulty: import('./logic/difficulty').DifficultyLevel;
  penalties: {
    consecutiveFlopLimit: number;
  };
}

// Shop state and data
export interface ShopState {
  availableCharms: (Charm | null)[];
  availableConsumables: (Consumable | null)[];
  availableBlessings: (Blessing | null)[];
}

// Combined effect context for filtering and scoring
export interface EffectContext {
  world: WorldEffectContext;
  level: {
    // Combination multipliers
    straightsMultiplier: number;
    pairsMultiplier: number;
    singlesMultiplier: number;
    nOfAKindMultiplier: number;
    pyramidsMultiplier: number;
    // Combination restrictions
    noStraights: boolean;
    noPairs: boolean;
    noSingles: boolean;
    noNOfAKind: boolean;
    noPyramids: boolean;
    // Dice value restrictions
    noOnes: boolean;
    noTwos: boolean;
    noThrees: boolean;
    noFours: boolean;
    noFives: boolean;
    noSixes: boolean;
    noOddValues: boolean;
    noEvenValues: boolean;
  };
}


// Game history and tracking data (consolidated here)
export interface GameHistory {
  // Usage/purchase tracking
  combinationCounters: CombinationCounters;
  combinationLevels: CombinationLevels; // Track combination upgrade levels (key -> level, default: 1)
  consumableCounters: ConsumableCounters; // Track consumable USAGE
  charmCounters: CharmCounters; // Track charm PURCHASES
  blessingCounters: BlessingCounters; // Track blessing PURCHASES
  highScoreSingleRoll: number;  // Highest single roll score in this game
  highScoreBank: number;  // Highest bank score in this game
}



// GAME PHASE TYPES
export type GamePhase = 
  | 'worldSelection'  // Player needs to select a world
  | 'playing'         // Active gameplay (rolling, scoring)
  | 'tallying'        // Level completed, showing rewards
  | 'shop'            // In shop between levels
  | 'gameWin'         // Won the game (25 levels)
  | 'gameLoss';       // Lost the game (no banks, etc.)