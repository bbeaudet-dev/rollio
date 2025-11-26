# GameState Structure

## Overview

The `GameState` uses a flattened structure with nested world/level state for hierarchy. This provides a clean, intuitive structure while maintaining logical organization.

## State Hierarchy

```mermaid
graph TD
    A[GameState] --> B[Game-Wide State]
    A --> C[Game Phase & Map]
    A --> D[Current World]
    A --> E[Shop State]
    A --> F[History & Tracking]

    B --> B1[Resources: money, diceSet]
    B --> B2[Items: charms, consumables, blessings]
    B --> B3[Configuration: config, settings]
    B --> B4[Slots & Limits: charmSlots, consumableSlots]
    B --> B5[Base Values: baseLevelRerolls, baseLevelBanks]

    C --> C1[gamePhase: worldSelection/playing/shop/etc]
    C --> C2[gameMap: World map structure]

    D --> D1[WorldState]
    D1 --> D2[worldId, worldNumber]
    D1 --> D3[levelConfigs: Pre-generated levels]
    D1 --> D4[worldEffects: Active world effects]
    D1 --> D5[LevelState]
    D5 --> D6[Level Info: levelNumber, threshold]
    D5 --> D7[Progress: pointsBanked, flopsThisLevel]
    D5 --> D8[Resources: rerollsRemaining, banksRemaining]
    D5 --> D9[RoundState]
    D9 --> D10[Dice: diceHand, rollHistory]
    D9 --> D11[Points: roundPoints, forfeitedPoints]

    E --> E1[Available Items]
    E --> E2[Player Money]

    F --> F1[Counters: combinations, charms, consumables]
    F --> F2[High Scores: singleRoll, bank]
```

### Game-Wide State

Contains game-wide properties that persist across levels:

**Status & Configuration**

- `isActive`: Whether the game is currently active
- `won`: Whether the player has won (completed 25 levels)
- `config`: Game configuration (dice set, difficulty)
- `settings`: Player settings (sort dice, game speed, etc.)

**Resources**

- `money`: Current money available
- `diceSet`: Current dice set (array of Die objects)
- `baseLevelRerolls`: Base rerolls per level
- `baseLevelBanks`: Base banks per level

**Items**

- `charms`: Array of active charms
- `consumables`: Array of available consumables
- `blessings`: Array of active blessings
- `charmSlots`: Maximum charm slots
- `consumableSlots`: Maximum consumable slots

**Tracking**

- `lastConsumableUsed`: ID of last consumable used
- `consecutiveBanks`: Consecutive rounds banked
- `consecutiveFlops`: Consecutive flops across game

### GameSettings

Contains game settings that can change during gameplay:

- **sortDice**: How dice are sorted in UI
  - Options: `unsorted`, `ascending`, `descending`, `material`
- **gameSpeed**: Animation speed for game actions
  - Options: `none`, `low`, `medium`, `default`, `high`, or numeric value
- **optimizeRollScore**: Whether to auto-select optimal scoring combinations

### WorldState

Contains world-specific state including the current level:

```mermaid
graph LR
    A[WorldState] --> B[World Info]
    A --> C[Level Configs]
    A --> D[World Effects]
    A --> E[Current Level]

    B --> B1[worldId: string]
    B --> B2[worldNumber: number]

    C --> C1[levelConfigs: Array of 5 pre-generated levels]

    D --> D1[worldEffects: Active world-specific effects]

    E --> E1[LevelState]
```

**Properties:**

- **worldId**: Unique identifier for the world (e.g., "desert", "forest")
- **worldNumber**: Sequential world number (1, 2, 3, etc.)
- **levelConfigs**: Array of 5 pre-generated level configurations for this world
- **worldEffects**: Array of active world-specific effects
- **currentLevel**: Current level state (see LevelState below)

### LevelState

Contains level-specific state that resets or changes between levels:

```mermaid
graph TD
    A[LevelState] --> B[Level Info]
    A --> C[Progress]
    A --> D[Resources]
    A --> E[Effects]
    A --> F[Current Round]
    A --> G[Rewards]

    B --> B1[levelNumber: 1-25]
    B --> B2[levelThreshold: Points needed]
    B --> B3[isMiniboss: Level 3, 8, 13, 18]
    B --> B4[isMainBoss: Level 5, 10, 15, 20, 25]

    C --> C1[pointsBanked: Points accumulated]
    C --> C2[flopsThisLevel: Flop count]
    C --> C3[banksThisLevel: Bank count]

    D --> D1[rerollsRemaining: Available rerolls]
    D --> D2[banksRemaining: Available banks]

    E --> E1[levelEffects: Boss/miniboss effects]
    E --> E2[effectContext: Combined filter context]

    F --> F1[currentRound: RoundState or undefined]

    G --> G1[rewards: Calculated on completion]
    G1 --> G2[baseReward, banksBonus]
    G1 --> G3[charmBonuses, blessingBonuses]
    G1 --> G4[total: Sum of all rewards]
```

**Key Properties:**

- **Level Info**: Number, threshold, boss flags
- **Progress**: Points banked, flops/banks this level
- **Resources**: Remaining rerolls and banks
- **Effects**: Boss/miniboss effects and context
- **Current Round**: Active round state (undefined if no round started)
- **Rewards**: Calculated when level completes

### GameConfig

Contains game setup and configuration that rarely changes:

```mermaid
graph LR
    A[GameConfig] --> B[Dice Set Config]
    A --> C[Difficulty]

    B --> B1[Dice definitions]
    B --> B2[Starting money]
    B --> B3[Starting slots]

    C --> C1[Difficulty level]
    C --> C2[Scaling factors]
```

**Properties:**

- **diceSetConfig**: Original dice set definition (name, dice, starting values)
- **difficulty**: Difficulty level affecting scaling and rewards

### ShopState

Contains shop state and available items:

```mermaid
graph TD
    A[ShopState] --> B[Status]
    A --> C[Available Items]
    A --> D[Player Resources]

    B --> B1[isOpen: Shop is active]

    C --> C1[availableCharms: Array of purchasable charms]
    C --> C2[availableConsumables: Array of purchasable consumables]
    C --> C3[availableBlessings: Array of purchasable blessings]

    D --> D1[playerMoney: Money available for purchases]
```

**Properties:**

- **isOpen**: Whether the shop is currently open
- **availableCharms**: Array of charms available for purchase
- **availableConsumables**: Array of consumables available for purchase
- **availableBlessings**: Array of blessings available for purchase
- **playerMoney**: Player's current money (for shopping display)

### GameHistory

Contains game tracking, history, and counter data:

```mermaid
graph TD
    A[GameHistory] --> B[Usage Counters]
    A --> C[High Scores]

    B --> B1[combinationCounters: Scoring combinations used]
    B --> B2[consumableCounters: Consumables used]
    B --> B3[charmCounters: Charms purchased]
    B --> B4[blessingCounters: Blessings purchased]

    C --> C1[highScoreSingleRoll: Best single roll]
    C --> C2[highScoreBank: Best bank score]
```

**Properties:**

- **combinationCounters**: Tracks how many times each scoring combination was used
- **consumableCounters**: Tracks consumable usage
- **charmCounters**: Tracks charm purchases
- **blessingCounters**: Tracks blessing purchases
- **highScoreSingleRoll**: Highest points from a single roll
- **highScoreBank**: Highest points banked in a single round

## Benefits

1. **Flattened Structure**: Game-wide state is flat for easy access
2. **Nested Hierarchy**: Level state is nested for logical organization
3. **Clear Access Patterns**: `gameState.money` vs `gameState.currentWorld?.currentLevel.pointsBanked`
4. **Component-Friendly**: Components can receive specific data groups
5. **Maintainability**: Easy to find and modify related properties
6. **Type Safety**: Strong TypeScript typing throughout

## Access Patterns

### Navigation Path

```mermaid
graph LR
    A[gameState] --> B[Game-Wide]
    A --> C[currentWorld?]
    A --> D[history]

    B --> B1[.isActive]
    B --> B2[.money]
    B --> B3[.charms]
    B --> B4[.gamePhase]

    C --> C1[.worldId]
    C --> C2[.currentLevel]
    C2 --> C3[.levelNumber]
    C2 --> C4[.pointsBanked]
    C2 --> C5[.currentRound?]
    C5 --> C6[.diceHand]
    C5 --> C7[.rollHistory]

    D --> D1[.combinationCounters]
    D --> D2[.highScoreSingleRoll]
```

### Common Access Patterns

**Game-Wide State (Flat Access)**

- `gameState.isActive` - Game status
- `gameState.money` - Current money
- `gameState.charms` - Active charms
- `gameState.gamePhase` - Current phase
- `gameState.settings.sortDice` - UI settings

**World State (Nested Access)**

- `gameState.currentWorld?.worldId` - Current world ID
- `gameState.currentWorld?.worldNumber` - World number
- `gameState.currentWorld?.worldEffects` - Active world effects

**Level State (Nested Within World)**

- `gameState.currentWorld?.currentLevel.levelNumber` - Current level
- `gameState.currentWorld?.currentLevel.pointsBanked` - Points in level
- `gameState.currentWorld?.currentLevel.levelThreshold` - Points needed
- `gameState.currentWorld?.currentLevel.currentRound` - Current round

**Round State (Nested Within Level)**

- `gameState.currentWorld?.currentLevel.currentRound?.roundNumber` - Round number
- `gameState.currentWorld?.currentLevel.currentRound?.diceHand` - Current dice
- `gameState.currentWorld?.currentLevel.currentRound?.rollHistory` - Roll history

**History (Nested)**

- `gameState.history.combinationCounters` - Combination usage
- `gameState.history.highScoreSingleRoll` - Best single roll
- `gameState.history.highScoreBank` - Best bank score

## Component Usage

Components receive organized data groups from `useGameState`:

```mermaid
graph TD
    A[useGameState Hook] --> B[Organized Data Groups]

    B --> C[board]
    B --> D[gameState]
    B --> E[roundState]
    B --> F[inventory]
    B --> G[rollActions]
    B --> H[gameActions]
    B --> I[inventoryActions]
    B --> J[shopActions]
    B --> K[Flags]

    C --> C1[Dice, selectedDice, canRoll, canBank]
    D --> D1[Full GameState object]
    E --> E1[Current RoundState or null]
    F --> F1[charms, consumables, blessings]
    G --> G1[handleRollDice, handleDiceSelect]
    H --> H1[handleBank, startNewGame, selectWorld]
    I --> I1[handleConsumableUse]
    J --> J1[handlePurchaseCharm, etc]
    K --> K1[isInShop, isInMapSelection]

    B --> L[GameBoard Component]
```

**Data Groups:**

- **board**: Dice display state (dice, selection, canRoll, canBank)
- **gameState**: Full game state object
- **roundState**: Current round state (or null if no active round)
- **inventory**: Items (charms, consumables, blessings)
- **rollActions**: Dice-related actions (roll, select, score)
- **gameActions**: Game flow actions (bank, start game, select world)
- **inventoryActions**: Item usage actions (use consumable)
- **shopActions**: Shop actions (purchase, sell)
- **Flags**: Phase flags (isInShop, isInMapSelection)

## RoundState Structure

RoundState uses a flat structure with nested roll history:

```mermaid
graph TD
    A[RoundState] --> B[Round Info]
    A --> C[Status]
    A --> D[Dice & Points]
    A --> E[Tracking]
    A --> F[Roll History]

    B --> B1[roundNumber: Round within level]

    C --> C1[isActive: Round is in progress]
    C --> C2[endReason: How round ended]

    D --> D1[diceHand: Current dice available]
    D --> D2[roundPoints: Points scored this round]
    D --> D3[forfeitedPoints: Points lost to flops]

    E --> E1[hotDiceCounter: Hot dice occurrences]
    E --> E2[flowerCounter: Flower dice scored]

    F --> F1[rollHistory: Array of all rolls in round]
```

**Properties:**

- **roundNumber**: Sequential round number within the level
- **isActive**: Whether the round is currently active
- **endReason**: How the round ended (`'flop'` or `'bank'`)
- **diceHand**: Current dice available to roll
- **roundPoints**: Total points scored in this round
- **forfeitedPoints**: Points lost due to flops
- **hotDiceCounter**: Number of times hot dice occurred
- **flowerCounter**: Number of flower dice scored (for tracking)
- **rollHistory**: Array of all rolls made in this round

## RollState Structure

RollState contains individual roll data:

```mermaid
graph TD
    A[RollState] --> B[Roll Info]
    A --> C[Dice State]
    A --> D[Scoring]
    A --> E[Status Flags]

    B --> B1[rollNumber: Roll sequence number]
    B --> B2[isReroll: Whether this is a reroll]

    C --> C1[diceHand: Snapshot of dice rolled]
    C --> C2[selectedDice: Dice selected for scoring]
    C --> C3[scoringSelection: Indices of selected dice]

    D --> D1[rollPoints: Points from this roll]
    D --> D2[maxRollPoints: Maximum possible points]
    D --> D3[combinations: Scoring combinations found]
    D --> D4[scoringBreakdown: Detailed breakdown]

    E --> E1[isHotDice: All dice scored]
    E --> E2[isFlop: No valid combinations]
```

**Properties:**

- **rollNumber**: Sequential roll number within the round
- **isReroll**: Whether this roll is a reroll (vs initial roll)
- **diceHand**: Snapshot of dice values rolled
- **selectedDice**: Dice objects selected for scoring
- **scoringSelection**: Indices of selected dice
- **rollPoints**: Points scored from this roll
- **maxRollPoints**: Maximum possible points (for optimization)
- **combinations**: Array of scoring combinations found
- **scoringBreakdown**: Detailed breakdown of scoring calculation
- **isHotDice**: Whether all dice were scored (hot dice)
- **isFlop**: Whether this roll was a flop (no valid combinations)
