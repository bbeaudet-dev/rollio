# Type System Architecture

This document describes the type system and type relationships in Rollio.

## Type Hierarchy

```mermaid
graph TD
    A[GameState] --> B[WorldState]
    A --> C[GameHistory]
    A --> D[GameConfig]
    A --> E[GameMap]
    B --> F[LevelState]
    F --> G[RoundState]
    G --> H[RollState]
    A --> I[Charm]
    A --> J[Consumable]
    A --> K[Blessing]
    A --> L[Die]
    L --> M[DiceMaterial]
```

## Core Types

### GameState

**Location**: `src/game/types.ts`

**Purpose**: Root game state type

```typescript
interface GameState {
  // Game-wide state
  isActive: boolean;
  config: GameConfig;
  settings: GameSettings;
  history: GameHistory;
  won?: boolean;

  baseLevelRerolls: number;
  baseLevelBanks: number;
  charmSlots: number;
  consumableSlots: number;

  gamePhase: GamePhase;
  gameMap?: GameMap;
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

**Key Properties**:

- `isActive` - Whether game is currently active
- `gamePhase` - Current game phase (worldSelection, playing, shop, etc.)
- `gameMap` - World map structure
- `currentWorld` - Current world state (includes currentLevel)
- `history` - Cumulative game statistics

### LevelState

**Location**: `src/game/types.ts`

**Purpose**: Current level state

```typescript
interface WorldState {
  worldId: string;
  worldNumber: number;
  levelConfigs: LevelConfig[];
  worldEffects: WorldEffect[];
  currentLevel: LevelState;
}

interface LevelState {
  levelNumber: number;
  levelThreshold: number;
  isMiniboss?: boolean;
  isMainBoss?: boolean;
  levelEffects?: LevelEffect[];
  effectContext?: EffectContext;
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

**Key Properties**:

- `pointsBanked` - Points accumulated in this level
- `levelThreshold` - Points needed to complete level
- `currentRound` - Current round state (undefined if no round started)

### RoundState

**Location**: `src/game/types.ts`

**Purpose**: Current round state

```mermaid
graph TD
    A[RoundState] --> B[Round Info]
    A --> C[Status]
    A --> D[Dice & Points]
    A --> E[Tracking]
    A --> F[History]

    B --> B1[roundNumber: Round within level]

    C --> C1[isActive: Round in progress]
    C --> C2["endReason?: 'flop' | 'bank'"]

    D --> D1["diceHand: Die[]"]
    D --> D2[roundPoints: number]
    D --> D3[forfeitedPoints: number]

    E --> E1[hotDiceCounter: number]
    E --> E2[flowerCounter?: number]

    F --> F1["rollHistory: RollState[]"]
```

**Key Properties**:

- `diceHand` - Current dice in hand
- `roundPoints` - Points scored this round
- `rollHistory` - History of rolls in this round

### RollState

**Location**: `src/game/types.ts`

**Purpose**: Individual roll state

```mermaid
graph TD
    A[RollState] --> B[Roll Info]
    A --> C[Dice State]
    A --> D[Scoring]
    A --> E[Status Flags]

    B --> B1[rollNumber: Sequence number]
    B --> B2[isReroll: boolean]

    C --> C1["diceHand: Die[] snapshot"]
    C --> C2["selectedDice: Die[]"]
    C --> C3["scoringSelection: number[]"]

    D --> D1[rollPoints: number]
    D --> D2[maxRollPoints?: number]
    D --> D3["combinations: ScoringCombination[]"]
    D --> D4[scoringBreakdown?: Breakdown]

    E --> E1[isHotDice?: boolean]
    E --> E2[isFlop?: boolean]
```

**Key Properties**:

- `rollNumber` - Sequential roll number within round
- `diceHand` - Snapshot of dice values rolled
- `rollPoints` - Points scored from this roll
- `combinations` - Array of scoring combinations found

## Item Types

### Charm

**Location**: `src/game/types.ts`

**Purpose**: Passive item that provides ongoing effects

```mermaid
graph TD
    A[Charm] --> B[Basic Info]
    A --> C[Properties]
    A --> D[Effects]
    A --> E[Runtime Functions]

    B --> B1[id: string]
    B --> B2[name: string]
    B --> B3[description: string]
    B --> B4[active: boolean]
    B --> B5[rarity: CharmRarity]

    C --> C1[uses?: number]
    C --> C2[buyValue?: number]
    C --> C3[sellValue?: number]

    D --> D1[flopPreventing?: boolean]
    D --> D2[combinationFiltering?: boolean]
    D --> D3[scoreMultiplier?: number]
    D --> D4[ruleChange?: string]

    E --> E1[filterScoringCombinations?: function]
```

**Rarity Types**:

- `'common'` - White
- `'uncommon'` - Green
- `'rare'` - Blue
- `'epic'` - Purple
- `'legendary'` - Orange

### Consumable

**Location**: `src/game/types.ts`

**Purpose**: One-time use item

```mermaid
graph TD
    A[Consumable] --> B[Basic Info]
    A --> C[Usage]

    B --> B1[id: string]
    B --> B2[name: string]
    B --> B3[description: string]
    B --> B4[rarity?: string]

    C --> C1[uses: number]
```

**Examples**:

- Money Doubler
- Extra Die
- Material Enchanter
- Reroll Dice

### Blessing

**Location**: `src/game/types.ts`

**Purpose**: Permanent upgrade with tiers

```mermaid
graph TD
    A[Blessing] --> B[Basic Info]
    A --> C[Effect]

    B --> B1[id: string]
    B --> B2["tier: 1 | 2 | 3"]

    C --> C1[effect: BlessingEffect]
    C1 --> C2[type: string]
    C1 --> C3[amount/percentage: number]
```

**Blessing Effect Types**:

- `rerollValue` - Increase base rerolls
- `livesValue` - Increase base lives
- `rerollOnBank` - Gain rerolls when banking
- `rerollOnFlop` - Gain rerolls when flopping
- `rerollOnCombination` - Gain rerolls on specific combination
- `charmSlots` - Increase charm slots
- `consumableSlots` - Increase consumable slots
- `shopDiscount` - Reduce shop prices
- `flopSubversion` - Chance to prevent flops
- `moneyPerLife` - Gain money per life
- `moneyOnLevelEnd` - Gain money when level completes
- `moneyOnRerollUsed` - Gain money when reroll used

## Dice Types

### Die

**Location**: `src/game/types.ts`

**Purpose**: Individual die configuration and state

```mermaid
graph TD
    A[Die] --> B[Configuration]
    A --> C[Runtime State]

    B --> B1[id: string]
    B --> B2[sides: number]
    B --> B3["allowedValues: number[]"]
    B --> B4[material: DiceMaterialType]
    B --> B5[pipEffects?: Record]

    C --> C1[scored?: boolean]
    C --> C2[rolledValue?: number]
```

**Properties:**

- **Configuration**: id, sides, allowedValues, material, pipEffects
- **Runtime State**: scored (whether die was scored), rolledValue (current roll)

### DiceMaterial

**Location**: `src/game/types.ts`

**Purpose**: Material properties

```typescript
interface DiceMaterial {
  id: string;
  name: string;
  description: string;
  abbreviation?: string;
  color: string;
}
```

**Material Types**:

- `'plastic'` - Standard material
- `'crystal'` - Premium material
- `'wooden'` - Natural material
- `'golden'` - Luxury material
- `'volcano'` - Special material
- `'mirror'` - Special material
- `'rainbow'` - Special material

### DiceSetConfig

**Location**: `src/game/types.ts`

**Purpose**: Dice set configuration

```typescript
interface DiceSetConfig {
  name: string;
  dice: Omit<Die, "scored" | "rolledValue">[];
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
  rerollValue: number;
  livesValue: number;
  setType: DiceSetType;
}
```

## Scoring Types

### ScoringCombination

**Location**: `src/game/types.ts`

**Purpose**: Scoring combination result

```mermaid
graph TD
    A[ScoringCombination] --> B[Type]
    A --> C[Dice]
    A --> D[Points]

    B --> B1[type: string]
    C --> C1["dice: number[]"]
    D --> D1[points: number]
```

**Combination Types**:

- `'single_one'` - Single 1 (100 points)
- `'single_five'` - Single 5 (50 points)
- `'three_of_a_kind'` - Three of a kind (varies by value)
- `'four_of_a_kind'` - Four of a kind (varies by value)
- `'five_of_a_kind'` - Five of a kind (varies by value)
- `'six_of_a_kind'` - Six of a kind (varies by value)
- `'straight'` - 1-2-3-4-5-6 (1500 points)
- `'three_pairs'` - Three pairs (1500 points)
- `'two_triplets'` - Two triplets (2500 points)

### ScoringResult

**Location**: `src/game/types.ts`

**Purpose**: Complete scoring result

```typescript
interface ScoringResult {
  combinations: ScoringCombination[];
  totalPoints: number;
  selectedDice: number[];
}
```

## UI Types

### WebGameState

**Location**: `src/web/services/WebGameManager.ts`

**Purpose**: UI-specific game state

```mermaid
graph TD
    A[WebGameState] --> B[Core State]
    A --> C[UI State]
    A --> D[Derived Flags]
    A --> E[Shop State]

    B --> B1["gameState: GameState | null"]
    B --> B2["roundState: RoundState | null"]
    B --> B3["selectedDice: number[]"]
    B --> B4["messages: string[]"]
    B --> B5[pendingAction: PendingAction]

    C --> C1["previewScoring: object | null"]
    C --> C2["materialLogs: string[]"]
    C --> C3["charmLogs: string[]"]
    C --> C4[justBanked: boolean]
    C --> C5[justFlopped: boolean]
    C --> C6[isProcessing: boolean]

    D --> D1[canRoll, canBank, canReroll]
    D --> D2[canSelectDice, isWaitingForReroll]
    D --> D3[canRerollSelected, canContinueFlop]
    D --> D4[canChooseFlopShield]

    E --> E1[isInShop: boolean]
    E --> E2["shopState: ShopState | null"]
    E --> E3["levelRewards: LevelRewards | null"]
```

**Properties:**

- **Core State**: GameState, RoundState, selectedDice, messages, pendingAction
- **UI State**: Preview scoring, logs, flags for animations
- **Derived Flags**: Calculated from game state (canRoll, canBank, etc.)
- **Shop State**: Shop phase flags and state

### PendingAction

**Location**: `src/web/services/ReactGameInterface.ts`

**Purpose**: Tracks pending user actions

```mermaid
graph TD
    A[PendingAction] --> B[none]
    A --> C[flopContinue]
    A --> D[flopShieldChoice]

    B --> B1[No pending action]
    C --> C1[Waiting for flop continue]
    D --> D1[Waiting for flop shield choice]
```

**Types:**

- `none` - No pending action
- `flopContinue` - Waiting for user to continue after flop
- `flopShieldChoice` - Waiting for user to choose whether to use flop shield

## Type Relationships

### Composition

```mermaid
graph TD
    A[GameState] --> B[currentWorld: WorldState]
    A --> C["charms: Charm[]"]
    A --> D["consumables: Consumable[]"]
    A --> E["blessings: Blessing[]"]

    B --> F[currentLevel: LevelState]
    F --> G[currentRound?: RoundState]
    G --> H["diceHand: Die[]"]
    G --> I["rollHistory: RollState[]"]
```

**Nested Structure:**

- GameState contains arrays of items (charms, consumables, blessings)
- GameState contains WorldState
- WorldState contains LevelState
- LevelState contains optional RoundState
- RoundState contains Die[] and RollState[]

### Inheritance

Types use composition rather than inheritance. Related types share interfaces:

```typescript
// All items share base properties
interface BaseItem {
  id: string;
  name: string;
  description: string;
}

// Charms extend with effect properties
interface Charm extends BaseItem {
  active: boolean;
  flopPreventing?: boolean;
  // ...
}

// Consumables extend with usage properties
interface Consumable extends BaseItem {
  uses: number;
}
```

## Type Guards

### Runtime Type Checking

```typescript
// Example: Type guard for blessing effects
function isRerollValueEffect(
  effect: BlessingEffect
): effect is { type: "rerollValue"; amount: number } {
  return effect.type === "rerollValue";
}

// Usage
if (isRerollValueEffect(blessing.effect)) {
  const amount = blessing.effect.amount; // TypeScript knows this is safe
}
```

## Type Utilities

### Utility Types

```typescript
// Omit runtime properties from Die config
type DieConfig = Omit<Die, "scored" | "rolledValue">;

// Pick specific properties
type CharmPreview = Pick<Charm, "id" | "name" | "description">;

// Make properties optional
type PartialGameState = Partial<GameState>;

// Make properties required
type RequiredGameState = Required<GameState>;
```

## Type Exports

### Main Type Exports

**Location**: `src/game/types.ts`

```typescript
// Core game types
export type { GameState, LevelState, RoundState, RollState };
export type { GameEndReason, RoundEndReason };

// Item types
export type { Charm, Consumable, Blessing };
export type { CharmRarity, BlessingEffect };

// Dice types
export type { Die, DiceMaterial, DiceSetConfig, DiceMaterialType };
export type { DieValue, DiceSetType };

// Scoring types
export type { ScoringCombination, ScoringResult, CombinationCounters };

// Shop types
export type { ShopState };
```

## Type Safety Patterns

### Discriminated Unions

```mermaid
graph TD
    A[BlessingEffect] --> B[rerollValue]
    A --> C[livesValue]
    A --> D[shopDiscount]

    B --> B1[type: 'rerollValue']
    B --> B2[amount: number]

    C --> C1[type: 'livesValue']
    C --> C2[amount: number]

    D --> D1[type: 'shopDiscount']
    D --> D2[percentage: number]
```

**Type Narrowing:**

- TypeScript can narrow the type based on the `type` field
- Each variant has different properties (amount vs percentage)
- Switch statements can safely access variant-specific properties

### Branded Types

```typescript
// Example: Branded type for IDs
type CharmID = string & { readonly __brand: 'CharmID' };
type ConsumableID = string & { readonly __brand: 'ConsumableID' };

// Prevents mixing ID types
function getCharm(id: CharmID): Charm { ... }
```

## Type Documentation

### JSDoc Comments

```typescript
/**
 * Represents the complete game state.
 *
 * @property isActive - Whether the game is currently active
 * @property gamePhase - Current game phase (worldSelection, playing, shop, etc.)
 * @property gameMap - World map structure
 * @property currentWorld - Current world state (includes currentLevel)
 * @property history - Cumulative game statistics
 */
interface GameState {
  isActive: boolean;
  gamePhase: GamePhase;
  gameMap?: GameMap;
  currentWorld?: WorldState;
  history: GameHistory;
}
```
