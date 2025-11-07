# GameState Structure

## Overview

The `GameState` uses a flattened structure with nested level state for hierarchy. This provides a clean, intuitive structure while maintaining logical organization.

## Structure

```typescript
interface GameState {
  // Game-wide state (flattened)
  isActive: boolean;
  endReason?: GameEndReason;
  money: number;
  diceSet: Die[];
  charms: Charm[];
  consumables: Consumable[];
  blessings: Blessing[];
  rerollValue: number;
  livesValue: number;
  charmSlots: number;
  consumableSlots: number;
  settings: GameSettings;
  config: GameConfig;

  // Current level state (nested for hierarchy)
  currentLevel: LevelState;

  // History (consolidated)
  history: GameHistory;
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

### LevelState

Contains level-specific state that resets or changes between levels:

```typescript
interface LevelState {
  levelNumber: number;
  pointsBanked: number;
  levelThreshold: number;
  rerollsRemaining: number;
  livesRemaining: number;
  consecutiveFlops: number;
  currentRound: RoundState | undefined;
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
  totalScore: number; // Cumulative banked points
  combinationCounters: CombinationCounters; // Scoring combination tracking
  levelHistory: LevelState[]; // Completed levels
}
```

## Benefits

1. **Flattened Structure**: Game-wide state is flat for easy access
2. **Nested Hierarchy**: Level state is nested for logical organization
3. **Clear Access Patterns**: `gameState.money` vs `gameState.currentLevel.pointsBanked`
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

// Level state (nested)
gameState.currentLevel.levelNumber;
gameState.currentLevel.pointsBanked;
gameState.currentLevel.livesRemaining;
gameState.currentLevel.currentRound;

// History (nested)
gameState.history.totalScore;
gameState.history.combinationCounters;
gameState.history.levelHistory;
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

// Level state
gameState.currentLevel.levelNumber;
gameState.currentLevel.pointsBanked;
gameState.currentLevel.livesRemaining;
gameState.currentLevel.currentRound;

// Round state (from currentLevel)
gameState.currentLevel.currentRound?.roundNumber;
gameState.currentLevel.currentRound?.diceHand;
gameState.currentLevel.currentRound?.rollHistory;
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
