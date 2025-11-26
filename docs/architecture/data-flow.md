# Data Flow Architecture

This document describes how data flows through the Rollio application.

## Overview

Rollio uses a unidirectional data flow pattern:

1. **Game Logic** maintains authoritative state (GameState)
2. **GameAPI** provides event-driven interface to game logic
3. **WebGameManager** bridges GameAPI and React UI
4. **React Components** display state and handle user input
5. **User Actions** flow back through managers to update state

## Data Flow Diagram

```mermaid
flowchart TD
    A[GameState] --> B[GameAPI]
    B --> C[WebGameManager]
    C --> D[WebGameState]
    D --> E[useGameState Hook]
    E --> F[React Components]
    F --> G[User Actions]
    G --> C
    C --> B
    B --> A

    H[Game Logic Modules] --> B
    I[Scoring Engine] --> H
    J[Charm System] --> H
    K[Shop System] --> H
    L[Map Generation] --> H
    M[World Effects] --> H
```

## Data Layers

### Layer 1: Game Logic & State

**Location**: `src/game/logic/`, `src/game/types.ts`

**Purpose**: Core game logic and state

**Key Types**:

- `GameState` - Main game state
- `WorldState` - Current world state
- `LevelState` - Current level state
- `RoundState` - Current round state
- `Charm`, `Consumable`, `Blessing` - Item types

**Key Modules**:

- `gameActions.ts` - Core game action processing
- `scoring.ts` - Scoring calculations
- `charmSystem.ts` - Charm management
- `shop.ts` - Shop generation
- `mapGeneration.ts` - World map generation
- `worldEffects.ts` - World-specific effects

**Characteristics**:

- Pure TypeScript (no React dependencies)
- Immutable updates (new objects created)
- Business logic only (no UI concerns)

### Layer 2: GameAPI

**Location**: `src/game/api/GameAPI.ts`

**Purpose**: Event-driven API layer for game operations

**Responsibilities**:

- Provide clean interface for game operations
- Emit events for state changes
- Coordinate game logic modules
- Handle game state updates
- Manage charm system integration

**Key Methods**:

- `initializeGame()` - Initialize new game
- `rollDice()` - Roll dice
- `scoreDice()` - Score selected dice
- `bankPoints()` - Bank points and end round
- `selectWorld()` - Select world from map
- `purchaseCharm()` - Purchase charm from shop
- `useConsumable()` - Use consumable item

**Events**:

- `stateChanged` - Game state updated
- `gameEnded` - Game ended (win/loss/quit)
- `levelCompleted` - Level completed
- `error` - Error occurred

### Layer 3: WebGameManager

**Location**: `src/web/services/WebGameManager.ts`

**Purpose**: Bridge between GameAPI and React UI

**Responsibilities**:

- Transform `GameState` → `WebGameState`
- Calculate derived UI flags (`canRoll`, `canBank`, etc.)
- Handle user actions and call GameAPI methods
- Manage preview scoring
- Coordinate shop, inventory, and game flow
- Subscribe to GameAPI events

**Key Methods**:

- `initializeGame()` - Initialize game via GameAPI
- `rollDice()` - Roll dice via GameAPI
- `scoreSelectedDice()` - Score dice via GameAPI
- `bankPoints()` - Bank points via GameAPI
- `updateDiceSelection()` - Update UI selection state
- `selectWorld()` - Select world via GameAPI

### Layer 4: React State Management

**Location**: `src/web/hooks/useGameState.ts`

**Purpose**: React-specific state management

**Responsibilities**:

- Maintain React state (`useState`)
- Provide callbacks for user actions
- Organize data into logical groups for components
- Handle async operations

**Key Exports**:

- `board` - Dice and selection state
- `gameState` - Full game state
- `roundState` - Current round state
- `inventory` - Charms, consumables, blessings
- `rollActions` - Dice-related actions
- `gameActions` - Game flow actions
- `inventoryActions` - Item usage actions

### Layer 5: React Components

**Location**: `src/web/ui/`

**Purpose**: UI display and user interaction

**Key Components**:

- `GameBoard` - Main game board orchestrator
- `CasinoDiceArea` - Dice display and selection
- `GameControls` - Action buttons
- `ShopDisplay` - Shop UI
- `CharmInventory`, `ConsumableInventory`, `BlessingInventory` - Item displays

## Data Transformation Flow

### Game State → UI State

```typescript
// 1. Game Logic State
GameState {
  currentWorld: {
    currentLevel: {
      currentRound: RoundState {
        diceHand: Die[],
        roundPoints: number
      }
    }
  }
}

// 2. GameAPI processes actions and returns updated state
GameAPI.rollDice(gameState) → {
  gameState: GameState,  // Updated state
  roundState: RoundState,
  // ... other result data
}

// 3. WebGameManager transforms to WebGameState
WebGameState {
  gameState: GameState,
  roundState: RoundState,
  selectedDice: number[],
  previewScoring: {...},
  canRoll: boolean,  // Derived from state
  canBank: boolean   // Derived from state
}

// 4. useGameState organizes into logical groups
{
  board: {
    dice: Die[],
    selectedDice: number[],
    canRoll: boolean
  },
  rollActions: {
    handleRollDice: () => void
  }
}

// 5. Components receive organized props
<GameBoard
  board={board}
  rollActions={rollActions}
/>
```

## User Action Flow

### Example: Rolling Dice

```mermaid
sequenceDiagram
    participant User
    participant GameControls
    participant useGameState
    participant WebGameManager
    participant GameAPI
    participant GameLogic
    participant React

    User->>GameControls: Click "Roll"
    GameControls->>useGameState: handleRollDice()
    useGameState->>WebGameManager: rollDice(state)
    WebGameManager->>GameAPI: rollDice(gameState)
    GameAPI->>GameLogic: processRoll(gameState)
    GameLogic->>GameLogic: Generate dice values
    GameLogic->>GameLogic: Calculate combinations
    GameLogic-->>GameAPI: Updated GameState
    GameAPI->>GameAPI: Emit 'stateChanged' event
    GameAPI-->>WebGameManager: RollDiceResult
    WebGameManager->>WebGameManager: Calculate preview scoring
    WebGameManager->>WebGameManager: Calculate UI flags
    WebGameManager-->>useGameState: New WebGameState
    useGameState->>React: setWebState(newState)
    React->>GameBoard: Re-render
    GameBoard->>DiceDisplay: Display new dice
```

### Example: Selecting Dice

```mermaid
sequenceDiagram
    participant User
    participant DiceSelector
    participant useGameState
    participant WebGameManager
    participant GameAPI
    participant ScoringLogic
    participant React

    User->>DiceSelector: Click die
    DiceSelector->>useGameState: handleDiceSelect(index)
    useGameState->>WebGameManager: updateDiceSelection(state, indices)
    WebGameManager->>GameAPI: calculatePreviewScoring(dice, indices)
    GameAPI->>ScoringLogic: calculatePreviewScoring(dice, indices)
    ScoringLogic->>ScoringLogic: Find combinations
    ScoringLogic->>ScoringLogic: Calculate points
    ScoringLogic-->>GameAPI: Preview scoring result
    GameAPI-->>WebGameManager: Preview scoring result
    WebGameManager-->>useGameState: New WebGameState with preview
    useGameState->>React: setWebState(newState)
    React->>DiceSelector: Update selection highlight
    React->>PreviewScoring: Display preview
```

## State Update Patterns

### Immutable Updates

All state updates create new objects:

```typescript
// ❌ Bad: Mutating state
gameState.currentLevel.pointsBanked += 100;

// ✅ Good: Creating new state
const newGameState = {
  ...gameState,
  currentLevel: {
    ...gameState.currentLevel,
    pointsBanked: gameState.currentLevel.pointsBanked + 100,
  },
};
```

### Derived State

UI flags are calculated from game state:

```typescript
// Derived flags in WebGameManager
const canRoll =
  !isProcessing &&
  roundState !== null &&
  roundState.diceHand.length > 0 &&
  !hasPendingAction;

const canBank =
  !isProcessing &&
  roundState !== null &&
  roundState.roundPoints > 0 &&
  !hasPendingAction;
```

## Data Dependencies

### Module Dependencies

```
src/web/
├── ui/                 # UI components (depends on hooks, types)
├── hooks/              # React hooks (depends on services)
├── services/           # Business logic bridge (depends on game/api)
└── types/              # UI-specific types

src/game/
├── api/                # GameAPI layer (depends on logic/)
├── logic/              # Game rules (depends on types)
├── data/               # Static data (depends on types)
└── types.ts            # Core types (no dependencies)
```

### Import Patterns

```typescript
// Components import from hooks and types
import { useGameState } from "../../hooks/useGameState";
import { GameBoardProps } from "../../types/game";

// Hooks import from services
import { WebGameManager } from "../services/WebGameManager";

// Services import from GameAPI
import { GameAPI } from "../../game/api";
import { GameState, RoundState } from "../../game/types";

// Game logic imports only types
import { Die, ScoringCombination } from "../types";
```

## State Synchronization

### Single Source of Truth

- **GameState** (from game logic) is the single source of truth
- **GameAPI** provides access to game state and operations
- **WebGameState** is a derived view of game state with UI flags
- **React State** is a cached copy for rendering

### State Updates

1. User action triggers component callback
2. Hook calls WebGameManager method
3. WebGameManager calls GameAPI method
4. GameAPI processes action via game logic
5. GameAPI returns updated GameState
6. GameAPI emits 'stateChanged' event
7. WebGameManager creates new WebGameState
8. Hook updates React state via `setState`
9. Components re-render with new state

### Preventing Race Conditions

- `isProcessing` flag prevents concurrent actions
- `pendingAction` tracks current operation
- State updates are synchronous (no async state mutations)

## Data Validation

### Type Safety

- TypeScript ensures type safety at compile time
- Runtime validation in critical paths
- Factory functions validate input

### State Validation

```typescript
// Example: Validating dice selection
function validateDiceSelection(
  dice: Die[],
  selectedIndices: number[]
): boolean {
  // Check indices are valid
  if (selectedIndices.some((i) => i < 0 || i >= dice.length)) {
    return false;
  }

  // Check for duplicates
  if (new Set(selectedIndices).size !== selectedIndices.length) {
    return false;
  }

  return true;
}
```

## Performance Considerations

### Memoization

- `useMemo` for expensive calculations
- `useCallback` for stable function references
- React.memo for component optimization

### State Updates

- Batch state updates when possible
- Minimize re-renders with proper dependencies
- Use derived state instead of storing redundant data

## Error Handling

### State Error Recovery

```typescript
// Example: Error handling in state updates
try {
  const newState = gameManager.rollDice(currentState);
  setWebState(newState);
} catch (error) {
  console.error("Roll failed:", error);
  addMessage("Failed to roll dice. Please try again.");
  // State remains unchanged
}
```
