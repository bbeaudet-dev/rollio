# Game Flow Architecture

This document describes the complete game flow from initialization to game over.

## High-Level Flow

```mermaid
flowchart TD
    A[App Start] --> B[Main Menu]
    B --> C[Game Config Selector]
    C --> D[Initialize Game]
    D --> E[Level 1, Round 1]
    E --> F[Roll Dice]
    F --> G{Valid Scoring?}
    G -->|No| H[Flop]
    G -->|Yes| I[Select Dice]
    I --> J{Action?}
    J -->|Bank| K[Bank Points]
    J -->|Reroll| F
    H --> L{Lives > 0?}
    L -->|No| M[Game Over]
    L -->|Yes| N[Next Round]
    K --> O{Level Complete?}
    O -->|Yes| P[Shop]
    O -->|No| N
    P --> Q[Purchase Items]
    Q --> R[Next Level]
    R --> E
    N --> E
```

## Detailed Flow

### 1. Game Initialization

**Entry Point**: `SinglePlayerGame` component → `useGameState` hook → `WebGameManager.initializeGame()`

```typescript
// Flow:
1. User clicks "Start Adventure" in GameConfigSelector
2. handleConfigComplete() called with dice set, charms, consumables
3. game.gameActions.startNewGame() called
4. WebGameManager.initializeGame() creates initial game state
5. Initial round state created (Round 1)
6. Game board displayed with "Roll" button ready
```

**Key Functions**:

- `WebGameManager.initializeGame()` - Creates initial game state
- `createInitialGameState()` - Factory for game state
- `createInitialLevelState()` - Factory for level state
- `createInitialRoundState()` - Factory for round state

### 2. Round Flow

**Entry Point**: User clicks "Roll" button → `handleRollDice()` → `WebGameManager.rollDice()`

```typescript
// Round Flow:
1. Roll Dice
   - RollManager.rollDice() generates random values
   - Dice displayed in CasinoDiceArea
   - Preview scoring calculated

2. Select Dice (if valid scoring available)
   - User clicks dice to select
   - Preview scoring updates in real-time
   - "Score Selected Dice" button appears

3. Score Dice
   - processCompleteScoring() calculates points
   - Selected dice removed from hand
   - Round points updated
   - Hot dice check (if all dice scored)

4. Action Choice
   - Bank: End round, add points to level
   - Reroll: Continue with remaining dice
   - Hot Dice: Reset to full dice set, continue round
```

**Key Functions**:

- `WebGameManager.rollDice()` - Handles dice rolling
- `WebGameManager.scoreSelectedDice()` - Processes scoring
- `WebGameManager.bankPoints()` - Ends round and banks points
- `processCompleteScoring()` - Scoring logic
- `isFlop()` - Checks for valid scoring combinations

### 3. Flop Flow

**Trigger**: No valid scoring combinations found

```typescript
// Flop Flow:
1. Flop Detected
   - isFlop() returns true
   - Consecutive flop counter incremented
   - Flop notification displayed

2. Flop Shield Check
   - If player has Flop Shield consumable
   - Prompt to use it
   - If used, flop prevented

3. Flop Penalty
   - If 3+ consecutive flops, apply penalty
   - Subtract points from banked points

4. Life Loss
   - Lose 1 life
   - Check for game over (lives <= 0)

5. Continue
   - Create new round state
   - Ready for next roll
```

**Key Functions**:

- `isFlop()` - Detects flop condition
- `WebGameManager.handleFlopContinue()` - Processes flop
- `WebGameManager.useConsumable()` - Handles consumable usage

### 4. Level Completion Flow

**Trigger**: Points banked >= level threshold

```typescript
// Level Completion Flow:
1. Level Complete Detected
   - isLevelCompleted() returns true
   - Calculate level rewards
   - Apply blessing bonuses
   - Apply charm bonuses

2. Shop Phase
   - Generate shop inventory
   - Display shop UI
   - Player can purchase items
   - Shop discount calculated from blessings

3. Exit Shop
   - Advance to next level
   - Create new level state
   - Reset round to 1
   - Continue game
```

**Key Functions**:

- `isLevelCompleted()` - Checks level completion
- `calculateLevelRewards()` - Calculates rewards
- `applyLevelRewards()` - Applies rewards
- `generateShopInventory()` - Creates shop items
- `WebGameManager.exitShop()` - Exits shop and advances level

### 5. Game Over Flow

**Triggers**: Lives <= 0, Player quits

```typescript
// Game Over Flow:
1. Lose Condition
   - Lives reach 0
   - gameState.isActive = false
   - gameState.endReason = 'lost'
   - Game Over overlay displayed

2. Game Over Display
   - Styled overlay (like Flop message)
   - "GAME OVER" message
   - "You ran out of lives!" message
   - Game state frozen
```

**Key Functions**:

- `WebGameManager.handleFlopContinue()` - Checks lives after flop
- `WebGameManager.useConsumable()` - Checks lives after consumable use

## State Transitions

### Game State Transitions

```
Initialization → Active → Shop → Active → ... → Game Over
```

### Round State Transitions

```
Round Start → Roll → Select → Score → [Bank | Reroll] → Round End
Round Start → Roll → Flop → Continue → Round End
```

### Level State Transitions

```
Level 1 → Complete → Shop → Level 2 → Complete → Shop → ... → Game Over
```

## Component Interaction Flow

```mermaid
flowchart LR
    A[SinglePlayerGame] --> B[useGameState]
    B --> C[WebGameManager]
    C --> D[GameEngine Logic]
    D --> E[RoundManager]
    D --> F[RollManager]
    D --> G[CharmManager]

    B --> H[GameBoard]
    H --> I[GameControls]
    H --> J[CasinoDiceArea]
    H --> K[Inventory Components]
    H --> L[ShopDisplay]

    I --> C
    J --> C
    K --> C
    L --> C
```

## Data Flow

### User Action → State Update

1. **User clicks "Roll"**

   - `GameControls` → `handleRollDice()` → `useGameState`
   - `useGameState` → `WebGameManager.rollDice()`
   - `WebGameManager` updates `WebGameState`
   - `useGameState` updates React state
   - `GameBoard` re-renders with new dice

2. **User selects dice**

   - `CasinoDiceArea` → `onDiceSelect()` → `handleDiceSelect()`
   - `WebGameManager.updateDiceSelection()` updates selection
   - Preview scoring recalculated
   - UI updates to show selection and preview

3. **User banks points**
   - `GameControls` → `handleBank()` → `WebGameManager.bankPoints()`
   - Points added to level
   - Level completion checked
   - If complete: shop phase
   - If not: new round created

## Key State Management

### WebGameState

The `WebGameState` interface bridges the game engine and React UI:

```typescript
interface WebGameState {
  gameState: GameState | null;      // Core game state
  roundState: RoundState | null;     // Current round state
  selectedDice: number[];            // UI selection state
  messages: string[];                // Game log messages
  previewScoring: {...} | null;      // Real-time scoring preview
  canRoll: boolean;                  // Derived UI flags
  canBank: boolean;
  canReroll: boolean;
  isInShop: boolean;                 // Shop phase flag
  shopState: ShopState | null;       // Shop inventory
}
```

### State Updates

All state updates flow through `WebGameManager`, which:

1. Updates game engine state
2. Calculates derived UI flags
3. Returns new `WebGameState`
4. React components re-render with new state
