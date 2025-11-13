# Web Refactor Specification

## Overview

This specification covers refactoring `src/web` (renamed from `src/app`) to be cleaner, more maintainable, and ensure we're reliably using the game engine without reinventing logic.

**Note**: Content polish has been moved to a separate spec: [Content Polish Spec](../upcoming/content-polish.md)

## Current State Analysis

### Critical Architecture Issues

**WebGameManager Problems**:

- **834 lines** - Too much responsibility, should be 100-200 lines
- **Bypasses GameEngine**: Creates `RoundManager` and `RollManager` but doesn't use them properly
- **Reimplements round logic**: Manual round flow instead of using `RoundManager.playRound()`
- **Comment on line 185**: `// Start a new round - simplified for now, will integrate RoundManager later` - Never happened
- **Only uses `rollManager.rollDice()` directly** (2 places), never calls `RoundManager.playRound()` or `GameEngine.run()`
- **Direct game logic calls**: Calls `processCompleteScoring`, `calculatePreviewScoring`, etc. directly instead of going through managers
- **Duplicated logic**: Round flow logic exists in both `RoundManager` and `WebGameManager`

**CLI vs Web Comparison**:

- **CLI (✅ Correct)**: `cli.ts` → `GameEngine.run()` → `RoundManager.playRound()` → `RollManager.rollDice()`
- **Web (❌ Problematic)**: `useGameState` → `WebGameManager` → Direct game logic calls, bypasses managers

**ReactGameInterface Analysis**:

- **What it does**: Implements `GameInterface` for React, converts async prompts to pending actions (state)
- **This is CORRECT** - it's the adapter between game engine's async interface and React's state-based UI
- **Location**: `src/web/services/ReactGameInterface.ts` - Could be `adapters/` but `services/` is fine
- **Status**: Working correctly, just needs to be used properly with GameEngine/GameAPI

### Web Structure Issues

**Problems Identified**:

- `WebGameManager` duplicates game logic instead of purely bridging UI ↔ engine
- Some UI components may bypass the game engine
- Inconsistent error handling patterns
- Mixed concerns (UI logic mixed with game logic)
- Some game logic may be reimplemented in React components
- **Structure Issues**:
  - `components/game/` contains too many responsibilities
  - `CasinoDiceArea` is doing too much (dice display, positioning, preview scoring, overlays)
  - `GameBoard` is orchestrating everything (shop, inventory, game board, controls)
  - `GameConfigSelector` is monolithic
  - `ShopDisplay` is monolithic
  - Multiplayer system exists but is likely obsolete/unused
- **Navigation Issues**:
  - Simple state-based navigation (no URL routing)
  - No shareable links
  - Browser back/forward doesn't work
  - Limited screens (only menu, single-player, multiplayer)

**Files to Audit**:

- `src/web/services/WebGameManager.ts` - Main bridge, needs major refactor (834 lines → 100-200 lines)
- `src/web/hooks/useGameState.ts` - State management hook, verify it's properly connected
- `src/web/ui/game/` - Game components (needs restructuring)
- `src/web/services/ReactGameInterface.ts` - React-specific interface (correct as-is, make more clear)
- `src/web/ui/multiplayer/` - Likely obsolete, needs review
- `src/web/App.tsx` - Navigation/routing needs upgrade

## Architecture Solution: GameAPI Layer

### The Problem

**Current State**:

- `WebGameManager` bypasses `GameEngine` and `RoundManager`
- Reimplements round logic manually
- 834 lines doing too much
- CLI uses `GameEngine` correctly, Web does not

**Root Cause**:

- `GameEngine.run()` is designed for CLI (blocking async)
- React needs event-driven, non-blocking interface
- No clean API layer between game engine and interfaces

### The Solution: GameAPI Layer

**GameAPI Location**: `src/game/api/`

**Why `src/game/api/`?**

- It's fundamentally part of the game engine
- It's the interface layer to the game engine
- Both CLI and Web can use it
- It's not a separate concern - it's part of the game layer

**Structure**:

```
src/game/
├── engine/
│   ├── GameEngine.ts        # CLI orchestrator (keep as-is)
│   ├── RoundManager.ts      # Round flow
│   └── RollManager.ts       # Dice rolling
├── api/                      # NEW: API layer
│   ├── GameAPI.ts           # Event-driven API
│   ├── GameAPIEvents.ts     # Event types
│   └── types.ts             # API-specific types
├── interfaces.ts             # GameInterface
└── types.ts                  # Core types
```

### GameAPI Design

**Purpose**: Provide event-driven API that wraps GameEngine for both CLI and Web

**Key Features**:

- Event-driven interface (better for React)
- Wraps GameEngine functionality
- Can be used by both CLI and Web
- No duplication of game logic

**Example**:

```typescript
// src/game/api/GameAPI.ts
export class GameAPI {
  private gameEngine: GameEngine;
  private eventEmitter: EventEmitter;

  constructor(interface: GameInterface) {
    this.gameEngine = new GameEngine(interface);
    this.eventEmitter = new EventEmitter();
  }

  // Event-driven methods
  async initializeGame(config: GameConfig): Promise<GameState>;
  async rollDice(gameState: GameState): Promise<RollResult>;
  async scoreDice(
    gameState: GameState,
    selectedIndices: number[]
  ): Promise<ScoreResult>;
  async bankPoints(gameState: GameState): Promise<BankResult>;
  async handleFlop(gameState: GameState): Promise<FlopResult>;

  // Event subscription
  on(event: GameAPIEvent, callback: (data: any) => void): void;
  off(event: GameAPIEvent, callback: (data: any) => void): void;
}
```

### WebGameManager Refactor

**Before (834 lines)**:

- Reimplements round logic
- Direct game logic calls
- Too much responsibility

**After (100-200 lines)**:

- Thin bridge
- Uses GameAPI
- Transforms state
- Calculates UI flags

**Example**:

```typescript
// src/web/services/WebGameManager.ts
export class WebGameManager {
  private gameAPI: GameAPI;
  private reactInterface: ReactGameInterface;

  constructor(onMessage: (message: string) => void) {
    this.reactInterface = new ReactGameInterface();
    this.gameAPI = new GameAPI(this.reactInterface);
    // Subscribe to events
    this.gameAPI.on('stateChanged', (state) => {
      // Update React state
    });
  }

  async initializeGame(...): Promise<WebGameState> {
    const gameState = await this.gameAPI.initializeGame(...);
    return this.transformToWebState(gameState);
  }

  async rollDice(state: WebGameState): Promise<WebGameState> {
    const result = await this.gameAPI.rollDice(state.gameState);
    return this.transformToWebState(result.gameState);
  }

  // ... other methods delegate to GameAPI

  private transformToWebState(gameState: GameState): WebGameState {
    // Transform GameState → WebGameState
    // Calculate UI flags
    // Extract messages from ReactGameInterface
  }
}
```

## Refactoring Plan

### Directory Structure Changes

**Current Structure**:

```
src/app/  (to be renamed to src/web/)
├── components/
│   ├── game/
│   │   ├── dice/
│   │   ├── inventory/
│   │   ├── score/
│   │   ├── shop/
│   │   └── ...
│   ├── menu/
│   ├── multiplayer/  (likely obsolete)
│   ├── single-player/
│   └── ui/
├── hooks/
├── services/
├── types/
└── utils/
```

**New Structure** (Organized by screen/route with setup folder):

```
src/
├── game/
│   ├── engine/
│   │   ├── GameEngine.ts        # CLI orchestrator (keep as-is)
│   │   ├── RoundManager.ts      # Round flow
│   │   └── RollManager.ts       # Dice rolling
│   ├── api/                      # NEW: API layer
│   │   ├── GameAPI.ts           # Event-driven API
│   │   ├── GameAPIEvents.ts     # Event types
│   │   └── types.ts             # API-specific types
│   ├── interfaces.ts             # GameInterface
│   └── types.ts                  # Core types
│
├── web/                          # Renamed from app
│   ├── ui/
│   │   ├── components/          # Small reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── InventoryItem.tsx
│   │   │   ├── ScoreText.tsx
│   │   │   ├── InfoText.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── menu/                # Menu route (/menu)
│   │   │   ├── MainMenu.tsx
│   │   │   ├── CollectionPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   ├── setup/                # Game setup (shown before game starts)
│   │   │   ├── GameSetup.tsx     # Main setup screen with tabs
│   │   │   │                      # Tabs: "Challenge Mode" | "Single Player Mode"
│   │   │   ├── ChallengeModeSelector.tsx  # Challenge mode tab content
│   │   │   ├── SinglePlayerSetup.tsx      # Single player tab content
│   │   │   │                              # Dice set selection + difficulty
│   │   │   └── components/       # Sub-components for setup screens
│   │   │       ├── GameConfigSelector.tsx  # Current setup (to be refactored)
│   │   │       ├── DiceSetSelector.tsx
│   │   │       ├── DifficultySelector.tsx  # New: Difficulty selection
│   │   │       ├── CharmSelector.tsx
│   │   │       ├── ConsumableSelector.tsx
│   │   │       └── ChallengeList.tsx       # New: Challenge selection
│   │   │
│   │   ├── game/                # Game route (/game)
│   │   │   ├── Game.tsx         # Route component (orchestrates sections)
│   │   │   ├── LevelSummary.tsx # Section: Level info, points, lives, money
│   │   │   ├── Board.tsx         # Section: Physical board container
│   │   │   ├── Inventory.tsx     # Section: Combined inventory
│   │   │   ├── Shop.tsx          # Section: Shop display
│   │   │   ├── Log.tsx           # Section: Game message log
│   │   │   ├── board/            # Sub-components for Board.tsx
│   │   │   │   ├── BoardBackground.tsx
│   │   │   │   ├── DiceDisplay.tsx
│   │   │   │   ├── DiceFace.tsx
│   │   │   │   ├── GameControls.tsx
│   │   │   │   ├── PreviewScoring.tsx
│   │   │   │   ├── GameAlerts.tsx
│   │   │   │   ├── RoundInfo.tsx
│   │   │   │   ├── RerollPrompt.tsx
│   │   │   │   ├── FlopShieldChoice.tsx
│   │   │   │   ├── ScoringIndicators.tsx
│   │   │   │   ├── DiceRollAnimation.tsx
│   │   │   │   ├── MaterialEffects.tsx
│   │   │   │   └── CharmEffects.tsx
│   │   │   ├── inventory/       # Sub-components for Inventory.tsx
│   │   │   │   ├── CharmInventory.tsx
│   │   │   │   ├── ConsumableInventory.tsx
│   │   │   │   └── BlessingInventory.tsx
│   │   │   └── shop/             # Sub-components for Shop.tsx
│   │   │       ├── ShopItem.tsx
│   │   │       └── ShopItemList.tsx
│   │   │
│   │   └── multiplayer/         # Multiplayer screens (archive)
│   │       ├── MultiplayerLobby.tsx
│   │       ├── MultiplayerRoom.tsx
│   │       ├── MultiplayerGame.tsx
│   │       └── DEPRECATED.md
│   │
│   ├── hooks/
│   │   └── useGameState.ts      # React hook (audit)
│   ├── services/
│   │   ├── WebGameManager.ts    # Thin bridge (100-200 lines, uses GameAPI)
│   │   └── ReactGameInterface.ts # Adapter (correct as-is)
│   ├── types/                    # UI-specific types (correct as-is)
│   ├── contexts/                 # React contexts (new)
│   │   ├── AppContext.tsx
│   │   └── index.ts
│   ├── utils/
│   └── App.tsx                   # Routing/navigation setup
│
└── cli/
    └── cli.ts                    # Uses GameEngine directly
```

### Component Restructuring

#### 1. Game.tsx (Top-Level Component)

**Current**: `GameBoard.tsx` orchestrates everything

**New**: `Game.tsx` becomes the top-level route component that contains sections:

- `LevelSummary.tsx` - Section: Level info, points, lives, money (top)
- `Board.tsx` - Section: Physical board container (middle)
- `Inventory.tsx` - Section: Combined inventory (bottom, always visible)
- `Shop.tsx` - Section: Shop display (replaces board when in shop)
- `Log.tsx` - Section: Game message log (side/bottom)

**Responsibilities**:

- Section layout and orchestration
- High-level state management
- Shop phase handling (shows Shop.tsx instead of Board.tsx)
- Game over handling
- Conditional rendering based on game state

**Note**: The "layers" (board, interaction, indicators) are visual z-index layers within `Board.tsx`, not separate folders. They're organized as sub-components in `game/board/`.

#### 2. Game Setup Flow (Future Expansion)

**Current State**:

- `GameConfigSelector` shows dice set, charms, and consumables selection
- Currently shown before game starts (will be refactored into setup structure)

**Planned Expansion**:

- Main menu → "Play" button → `GameSetup.tsx` (main setup screen)
- `GameSetup.tsx` has tabs at top: "Challenge Mode" | "Single Player Mode"
- **Challenge Mode Tab**:
  - Shows list of available challenges
  - User selects a challenge
  - May have additional setup screens after challenge selection
- **Single Player Mode Tab**:
  - Shows scrollable list of dice sets (like Balatro)
  - Each dice set has difficulty selector (like Balatro)
  - After dice set + difficulty selection, shows charm/consumable selection
  - May have additional setup screens

**Setup Folder Structure**:

- `setup/GameSetup.tsx` - Main setup screen with tabs
- `setup/ChallengeModeSelector.tsx` - Challenge mode tab content
- `setup/SinglePlayerSetup.tsx` - Single player mode tab content
- `setup/components/` - Reusable setup components:
  - `DiceSetSelector.tsx` - Dice set selection
  - `DifficultySelector.tsx` - Difficulty selection (new)
  - `CharmSelector.tsx` - Charm selection
  - `ConsumableSelector.tsx` - Consumable selection
  - `ChallengeList.tsx` - Challenge selection (new)

**Note**: The current `GameConfigSelector.tsx` will be refactored into the new setup structure.

#### 3. Game Screen Structure

**Game.tsx** contains sections at the same level:

- `LevelSummary.tsx` - Section: Level info, points, lives, money (top)
- `Board.tsx` - Section: Physical board container (middle)
- `Inventory.tsx` - Section: Combined inventory (bottom, always visible)
- `Shop.tsx` - Section: Shop display (replaces board when in shop)
- `Log.tsx` - Section: Game message log (side/bottom)

**Board.tsx** contains layered components (visual z-index, not folder structure):

- **Layer 1 (Physical Board)**: `BoardBackground.tsx`, `DiceDisplay.tsx`, `DiceFace.tsx`
- **Layer 2 (Interaction)**: `GameControls.tsx`, `PreviewScoring.tsx`, `GameAlerts.tsx`, `RoundInfo.tsx`, `RerollPrompt.tsx`, `FlopShieldChoice.tsx`
- **Layer 4 (Visual Indicators)**: `ScoringIndicators.tsx`, `DiceRollAnimation.tsx`, `MaterialEffects.tsx`, `CharmEffects.tsx`

#### 4. Breaking Up Large Components

**CasinoDiceArea** → Split into:

- `DiceDisplay` - Dice rendering (moved to `game/board/`)
- `PreviewScoring` - Scoring preview (moved to `game/board/`)
- Positioning logic → Move to `DiceDisplay` or utility

**GameConfigSelector** → Refactor into new setup structure:

- Current: Single screen with dice set, charms, consumables
- Future: Part of `setup/SinglePlayerSetup.tsx` with:
  - `DiceSetSelector` - Dice set selection (moved to `setup/components/`)
  - `DifficultySelector` - Difficulty selection (new, in `setup/components/`)
  - `CharmSelector` - Charm selection (moved to `setup/components/`)
  - `ConsumableSelector` - Consumable selection (moved to `setup/components/`)

**ShopDisplay** → Split into:

- `ShopItemList` - List of items (moved to `game/shop/`)
- `ShopItem` - Individual item display (moved to `game/shop/`)
- `ShopHeader` - Shop title, money display (if needed)
- `Shop.tsx` - Main shop section component (orchestrates the above)

### Obsolete Components

**Multiplayer System**:

- `src/web/ui/multiplayer/` - Entire folder likely obsolete
- Used only in `App.tsx` for `MultiplayerRoom`
- Decision: Remove or archive for future use
- **Recommendation**: Archive in `src/web/ui/multiplayer/` (commented out or marked as deprecated) for future reference

**Other Obsolete Components**:

- `DiceDisplay.tsx` (in `game/dice/`) - May be redundant with new structure
- Review all components for actual usage

## Requirements

### Functional Requirements

1. **Web Refactor**:

   - Rename `src/app` to `src/web`
   - Create `GameAPI` layer in `src/game/api/`
   - Refactor `WebGameManager` to be thin bridge (834 lines → 100-200 lines)
   - `WebGameManager` should ONLY bridge UI ↔ GameAPI, no game logic
   - All game logic must live in `src/game/` and go through GameAPI
   - UI components should not contain game logic
   - Consistent error handling throughout
   - Clear separation of concerns
   - Remove/archive obsolete components
   - Add React Router for navigation
   - Restructure components as outlined above

**Note**: Content polish requirements are in [Content Polish Spec](../upcoming/content-polish.md)

### Non-Functional Requirements

- **Maintainability**: Clear code organization, easy to extend
- **Type Safety**: Strong TypeScript typing throughout
- **Performance**: No unnecessary re-renders or calculations
- **Testability**: Code should be easy to test
- **Consistency**: Follow naming conventions and patterns

## User Stories / Scenarios

### Web Refactor

**As a developer**, I want:

- Clear separation between UI and game logic
- Easy to add new features without duplicating code
- Consistent patterns throughout the codebase
- Easy to debug issues
- Clear component hierarchy

**As a player**, I want:

- The game to work reliably
- No bugs from duplicated logic
- Smooth gameplay experience

## Data Structures / Types

### Web Refactor

No new types needed, but existing types should be used consistently:

- `WebGameState` - UI-specific state
- `GameState` - Game engine state
- `RoundState` - Round state
- `PendingAction` - Pending user actions

## API / Function Signatures

### GameAPI Layer

**GameAPI** should provide:

- Event-driven methods that wrap GameEngine
- Methods for all game actions (roll, score, bank, flop, etc.)
- Event subscription system
- NO UI concerns, pure game logic interface

**Example**:

```typescript
// src/game/api/GameAPI.ts
export class GameAPI {
  async initializeGame(config: GameConfig): Promise<GameState>;
  async rollDice(gameState: GameState): Promise<RollResult>;
  async scoreDice(
    gameState: GameState,
    selectedIndices: number[]
  ): Promise<ScoreResult>;
  async bankPoints(gameState: GameState): Promise<BankResult>;
  async handleFlop(gameState: GameState): Promise<FlopResult>;
  on(event: GameAPIEvent, callback: (data: any) => void): void;
}
```

### Web Refactor

**WebGameManager** should only have:

- State transformation methods (`GameState` → `WebGameState`)
- UI flag calculation methods
- Action handlers that delegate to GameAPI
- NO game logic methods
- Target: 100-200 lines (down from 834)

**Example**:

```typescript
// ✅ Good: Delegates to GameAPI
async rollDice(state: WebGameState): Promise<WebGameState> {
  const result = await this.gameAPI.rollDice(state.gameState);
  return this.transformToWebState(result.gameState);
}

// ❌ Bad: Contains game logic or bypasses GameAPI
rollDice(state: WebGameState): WebGameState {
  // Game logic here - should be in GameAPI
  const combinations = calculateCombinations(...);
  // ...
}
```

### Navigation / Routing

**App.tsx** should:

- Set up React Router
- Define all routes
- Provide app-level context (if needed)
- Handle global error boundaries
- NO game logic, NO UI components

**Example**:

```typescript
// src/web/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/game" element={<Game />} />
        <Route path="/multiplayer" element={<MultiplayerLobby />} />
        <Route path="/multiplayer/:roomId" element={<MultiplayerRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Edge Cases & Error Handling

### Web Refactor

- **Invalid State**: Handle gracefully, show error messages
- **Missing Dependencies**: Ensure all game engine functions are imported correctly
- **State Synchronization**: Ensure UI state matches game state
- **Component Migration**: Handle imports during refactor

## Out of Scope

- New game features (focus on polish and refactor)
- Major UI redesign (that's in another spec)
- Performance optimization (unless critical)
- New game modes
- Multiplayer implementation (archive for now)

## Open Questions

1. Should multiplayer be archived or removed? (Suggested: Archive)
2. Naming: `ui` vs `components`? (Suggested: `ui` is clearer for visual-only elements)
3. GameAPI location: `src/game/api/` vs `src/api/`? (Recommended: `src/game/api/` - it's part of the game layer)
4. Should we use React Router? (Recommended: Yes, for better UX and standard patterns)

**Note**: Content polish questions are in [Content Polish Spec](../upcoming/content-polish.md)

## Implementation Phases

### Phase 0: Create GameAPI Layer

**Goal**: Create API layer that wraps GameEngine

**Deliverables**:

- `GameAPI` class in `src/game/api/GameAPI.ts`
- Event system for state changes
- Methods for all game actions
- Test with CLI (should still work)

**Tasks**:

1. Create `src/game/api/` directory
2. Create `GameAPI.ts` with event-driven interface
3. Create `GameAPIEvents.ts` for event types
4. Wrap GameEngine functionality
5. Implement event subscription system
6. Test with CLI (verify it still works)
7. Test basic game flow

**Integration Testing**:

- Test GameAPI with CLI interface
- Test event system
- Verify no regressions in CLI
- Test basic game actions

### Phase 1: Directory Restructure

**Goal**: Rename and reorganize directories

**Deliverables**:

- Renamed `src/app` to `src/web`
- New directory structure
- Updated imports throughout codebase

**Tasks**:

1. Rename `src/app` to `src/web`
2. Create new `ui/` structure
3. Move `components/ui/` to `ui/components/`
4. Move `components/game/` to `ui/game/` and restructure:
   - Move `game/dice/` components to `game/board/`
   - Move `game/inventory/` components to `game/inventory/`
   - Move `game/score/` components to `game/board/` (scoring preview, etc.)
   - Move `game/shop/` components to `game/shop/`
5. Move `components/menu/` to `ui/menu/`
6. Create `ui/setup/` folder structure
7. Move `components/single-player/` logic into `ui/game/Game.tsx` or remove if obsolete
8. Update all imports throughout codebase
9. Test that everything still works

**Integration Testing**:

- Verify all imports work
- Test game still runs
- No broken functionality

### Phase 2: Component Restructuring - Game.tsx

**Goal**: Create new top-level `Game.tsx` component

**Deliverables**:

- New `Game.tsx` component
- `LevelSummary` component (from `GameStatus`)
- `PlayerInventory` component (combined inventory)
- `ScoringIndicators` component (new)

**Tasks**:

1. Create `ui/game/Game.tsx` (from current `GameBoard.tsx`)
2. Extract `LevelSummary.tsx` from `GameStatus`
3. Create `Inventory.tsx` that combines all inventory components
4. Create `ScoringIndicators` component (will be in `game/board/`)
5. Update `Game.tsx` to use new components
6. Update imports throughout codebase
7. Test game flow

**Integration Testing**:

- Test game flow works
- Test inventory display
- Test level summary
- Test scoring indicators

### Phase 3: Component Restructuring - GameBoard.tsx

**Goal**: Create new `GameBoard.tsx` from `CasinoDiceArea`

**Deliverables**:

- New `GameBoard.tsx` component
- `DiceDisplay` component
- `GameControls` component (enhanced)
- `GameAlerts` component
- `RoundInfo` component

**Tasks**:

1. Create `ui/game/board/DiceDisplay.tsx` (extract from `CasinoDiceArea`)
2. Create `ui/game/board/GameControls.tsx` (enhance current)
3. Create `ui/game/board/GameAlerts.tsx` (extract alerts from `GameBoard`)
4. Create `ui/game/board/RoundInfo.tsx` (extract round/roll info)
5. Create `ui/game/Board.tsx` (from `CasinoDiceArea`, using new components)
6. Update `Game.tsx` to use new `Board.tsx`
7. Remove old `CasinoDiceArea`
8. Test dice display and interactions

**Integration Testing**:

- Test dice display
- Test dice selection
- Test controls
- Test alerts
- Test round info display

### Phase 4: Breaking Up Large Components

**Goal**: Split `GameConfigSelector` and `ShopDisplay`

**Deliverables**:

- Split `GameConfigSelector` into smaller components
- Split `ShopDisplay` into smaller components
- Cleaner, more maintainable code

**Tasks**:

1. Create `ui/setup/components/CharmSelector.tsx`
2. Create `ui/setup/components/ConsumableSelector.tsx`
3. Refactor `GameConfigSelector` to use new components (will be part of setup structure)
4. Create `ui/game/shop/ShopItemList.tsx`
5. Create `ui/game/shop/ShopItem.tsx`
6. Create `ui/game/shop/ShopHeader.tsx` (if needed)
7. Refactor `Shop.tsx` to use new components
8. Test configuration flow
9. Test shop flow

**Integration Testing**:

- Test game configuration
- Test shop display
- Test shop purchases
- Test all flows work correctly

### Phase 5: Refactor WebGameManager to Use GameAPI

**Goal**: Make WebGameManager a thin bridge using GameAPI

**Deliverables**:

- Refactored `WebGameManager` (100-200 lines, down from 834)
- Uses GameAPI for all game actions
- No duplicated game logic
- Consistent error handling

**Tasks**:

1. Refactor `WebGameManager` to use `GameAPI` instead of direct game logic calls
2. Remove all duplicated round logic
3. Remove direct calls to `processCompleteScoring`, etc.
4. Use `GameAPI` methods for all actions
5. Keep only state transformation and UI flag calculation
6. Reduce to 100-200 lines
7. Test all game flows

**Integration Testing**:

- Full game flow test
- All features work correctly
- No regressions
- Verify WebGameManager is now thin bridge

### Phase 6: Audit useGameState

**Goal**: Ensure useGameState is properly connected

**Deliverables**:

- Audit report of `useGameState.ts`
- Verification that it only uses `WebGameManager`
- No game logic in hook

**Tasks**:

1. Audit `useGameState` hook
2. Verify it only uses `WebGameManager`
3. Ensure no game logic in hook
4. Verify proper separation of concerns
5. Test all actions

**Integration Testing**:

- Test all game actions through hook
- Verify no game logic in hook
- Test state updates

### Phase 7: Add React Router

**Goal**: Set up URL-based navigation

**Deliverables**:

- React Router installed and configured
- Routes defined in `App.tsx`
- Navigation updated in components
- All screens accessible via URLs

**Tasks**:

1. Install `react-router-dom`
2. Update `App.tsx` with routes
3. Update navigation in `MainMenu` and other components
4. Test all routes
5. Test browser back/forward
6. Test deep linking

**Integration Testing**:

- Test all routes work
- Test navigation between screens
- Test browser back/forward
- Test URL sharing

### Phase 8: Obsolete Component Cleanup

**Goal**: Remove or archive obsolete components

**Deliverables**:

- Removed/archived multiplayer system
- Removed other obsolete components
- Cleaner codebase

**Tasks**:

1. Review multiplayer system usage
2. Archive or remove multiplayer components
3. Remove unused imports
4. Review other components for obsolescence
5. Remove obsolete components
6. Update `App.tsx` to remove multiplayer mode

**Integration Testing**:

- Test single-player game works
- Test menu works
- No broken imports

## Key Principles

1. **Game Engine is Pure**: No React dependencies, no UI concerns
2. **GameAPI Bridges**: Adapts game engine for different interfaces (CLI, Web)
3. **Web Layer is Thin**: Only bridges UI ↔ GameAPI, no game logic
4. **Types are Shared**: Core types in game, UI types extend them
5. **Interfaces are Adapters**: ReactGameInterface adapts GameInterface for React
6. **Managers are Used**: RoundManager, RollManager are used through GameAPI, not bypassed

## Architecture Flow

**Ideal Flow**:

```
useGameState (React hook)
  → WebGameManager (thin bridge, 100-200 lines)
    → GameAPI (event-driven API)
      → GameEngine / RoundManager / RollManager
        → Game logic functions
```

**Current Flow (Problematic)**:

```
useGameState
  → WebGameManager (834 lines, bypasses managers)
    → Direct game logic calls
      → Game logic functions
```

## References

- [Architecture Documentation](../../architecture/overview.md)
- [Game Flow Documentation](../../architecture/game-flow.md)
- [Data Flow Documentation](../../architecture/data-flow.md)
- [Content Polish Spec](../upcoming/content-polish.md)
- [Enhanced Rules Spec](./completed/enhanced-rules.md)
- [Material System Spec](./completed/material-system-spec.md)
- [Balatro UI Spec](./balatro-ui-spec.md)
