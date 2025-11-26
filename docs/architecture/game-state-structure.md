# GameState Structure

## Overview

The `GameState` uses a flattened structure with nested level state for hierarchy. This provides a clean, intuitive structure while maintaining logical organization.

## Structure

```typescript
interface GameState {
  // Game-wide state (flattened)
  isActive: boolean;
  config: GameConfig;
  settings: GameSettings;
  history: GameHistory;
  won?: boolean;

  baseLevelRerolls: number;
  baseLevelBanks: number;
  charmSlots: number;
  consumableSlots: number;

  gamePhase: GamePhase; // Current phase: 'worldSelection' | 'playing' | 'tallying' | 'shop' | 'gameWin' | 'gameLoss'
  gameMap?: GameMap; // World map generated at game start
  shop?: ShopState;
  currentWorld?: WorldState; // Current world state (includes currentLevel)

  money: number;
  diceSet: Die[];
  charms: Charm[];
  consumables: Consumable[];
  blessings: Blessing[];

  lastConsumableUsed?: string;
  consecutiveBanks: number;
  consecutiveFlops: number;
}
```

### Game-Wide State

Contains game-wide properties that persist across levels:

```typescript
// Game status
isActive: boolean;
endReason?: GameEndReason;

// Resources
money: number;
rerollValue: number;
livesValue: number;

// Items
charms: Charm[];
consumables: Consumable[];
blessings: Blessing[];

// Configuration
diceSet: Die[];
charmSlots: number;
consumableSlots: number;
settings: GameSettings;
config: GameConfig;
```

### GameSettings

Contains game settings that can change during gameplay:

```typescript
interface GameSettings {
  sortDice: "unsorted" | "ascending" | "descending" | "material";
  gameSpeed: "none" | "low" | "medium" | "default" | "high" | number;
  optimizeRollScore: boolean;
}
```

### WorldState

Contains world-specific state including the current level:

```typescript
interface WorldState {
  worldId: string;
  worldNumber: number;
  levelConfigs: LevelConfig[]; // Pre-generated level configs for this world
  worldEffects: WorldEffect[]; // Active world effects
  currentLevel: LevelState; // Current level state
}
```

### LevelState

Contains level-specific state that resets or changes between levels:

```typescript
interface LevelState {
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
  flopsThisLevel: number;
  banksThisLevel?: number;
  rewards?: {
    baseReward: number;
    banksBonus: number;
    charmBonuses: number;
    blessingBonuses: number;
    total: number;
  };
}
```

### GameConfig

Contains game setup and configuration that rarely changes:

```typescript
interface GameConfig {
  diceSetConfig: DiceSetConfig; // Original dice set definition
  winCondition: number; // Target score to win
  penalties: {
    consecutiveFlopLimit: number; // Max consecutive flops before penalty
    consecutiveFlopPenalty: number; // Points lost for too many flops
    flopPenaltyEnabled: boolean; // Whether flop penalty is active
  };
}
```

### ShopState

Contains shop state and available items:

```typescript
interface ShopState {
  isOpen: boolean; // Whether shop is currently open
  availableCharms: Charm[]; // Charms available for purchase
  availableConsumables: Consumable[]; // Consumables available for purchase
  playerMoney: number; // Player's money for shopping
}
```

### GameHistory

Contains game tracking, history, and counter data:

```typescript
interface GameHistory {
  combinationCounters: CombinationCounters; // Scoring combination tracking
  consumableCounters: ConsumableCounters; // Consumable usage tracking
  charmCounters: CharmCounters; // Charm purchase tracking
  blessingCounters: BlessingCounters; // Blessing purchase tracking
  highScoreSingleRoll: number; // Highest single roll score
  highScoreBank: number; // Highest bank score
}
```

## Benefits

1. **Flattened Structure**: Game-wide state is flat for easy access
2. **Nested Hierarchy**: Level state is nested for logical organization
3. **Clear Access Patterns**: `gameState.money` vs `gameState.currentWorld?.currentLevel.pointsBanked`
4. **Component-Friendly**: Components can receive specific data groups
5. **Maintainability**: Easy to find and modify related properties
6. **Type Safety**: Strong TypeScript typing throughout

## Access Patterns

### Current Structure

```typescript
// Game-wide state (flat)
gameState.isActive;
gameState.money;
gameState.charms;
gameState.consumables;
gameState.blessings;
gameState.diceSet;
gameState.settings.sortDice;
gameState.config.diceSetConfig;
gameState.gamePhase;
gameState.gameMap;

// World state (nested)
gameState.currentWorld?.worldId;
gameState.currentWorld?.worldNumber;
gameState.currentWorld?.worldEffects;

// Level state (nested within world)
gameState.currentWorld?.currentLevel.levelNumber;
gameState.currentWorld?.currentLevel.pointsBanked;
gameState.currentWorld?.currentLevel.levelThreshold;
gameState.currentWorld?.currentLevel.currentRound;

// Round state (nested within level)
gameState.currentWorld?.currentLevel.currentRound?.roundNumber;
gameState.currentWorld?.currentLevel.currentRound?.diceHand;
gameState.currentWorld?.currentLevel.currentRound?.rollHistory;

// History (nested)
gameState.history.combinationCounters;
gameState.history.highScoreSingleRoll;
gameState.history.highScoreBank;
```

## Component Usage

Components receive organized data groups from `useGameState`:

```typescript
// useGameState organizes data into logical groups
const game = useGameState();

// Components receive organized groups
<GameBoard
  board={game.board} // Dice and selection state
  gameState={game.gameState} // Full game state
  roundState={game.roundState} // Current round state
  inventory={game.inventory} // Charms, consumables, blessings
  rollActions={game.rollActions} // Dice-related actions
  gameActions={game.gameActions} // Game flow actions
  inventoryActions={game.inventoryActions} // Item usage actions
  shopActions={game.shopActions} // Shop actions
  isInShop={game.isInShop} // Shop phase flag
/>;
```

## RoundState Structure

RoundState uses a flat structure with nested roll history:

```typescript
interface RoundState {
  roundNumber: number;
  isActive: boolean;
  flopped: boolean;
  roundPoints: number;
  diceHand: Die[];
  hotDiceCounter: number;
  forfeitedPoints: number;
  rollHistory: RollState[];
}
```

## RollState Structure

RollState contains individual roll data:

```typescript
interface RollState {
  rollNumber: number;
  diceHand: Die[];
  rollPoints: number;
  combinations: ScoringCombination[];
}
```

## Access Patterns

### Game State Access

```typescript
// Game-wide state
gameState.isActive;
gameState.money;
gameState.charms;
gameState.consumables;
gameState.blessings;
gameState.gamePhase;
gameState.gameMap;

// World state
gameState.currentWorld?.worldId;
gameState.currentWorld?.worldNumber;

// Level state (nested within world)
gameState.currentWorld?.currentLevel.levelNumber;
gameState.currentWorld?.currentLevel.pointsBanked;
gameState.currentWorld?.currentLevel.levelThreshold;
gameState.currentWorld?.currentLevel.currentRound;

// Round state (nested within level)
gameState.currentWorld?.currentLevel.currentRound?.roundNumber;
gameState.currentWorld?.currentLevel.currentRound?.diceHand;
gameState.currentWorld?.currentLevel.currentRound?.rollHistory;
```

### Round State Access

```typescript
// Round properties
roundState.roundNumber;
roundState.isActive;
roundState.diceHand;
roundState.roundPoints;
roundState.rollHistory;
```

### Roll State Access

```typescript
// Roll properties
rollState.rollNumber;
rollState.diceHand;
rollState.rollPoints;
rollState.combinations;
```
