# React App Basic Game Implementation

## Overview

This spec outlines the work needed to update the existing basic version of the React app working with the updated CLI game structure. The goal is to create a minimal, functional React interface that can play the same game as the CLI, without touching the `src/game/` folder or rewriting any game logic within the React app.

## Current State

### What the React App Has

- **WebGameManager** (`src/app/services/WebGameManager.ts`): Wraps the game engine and provides a simplified interface
- **Components**: GameBoard, DiceDisplay, GameControls, GameStatus, etc.
- **Hooks**: `useGameState` for managing game state
- **Types**: Extends game types for UI-specific needs

### What's Broken/Outdated

- **WebGameManager** doesn't handle the new roguelike progression system:
  - No reroll prompt handling
  - No level progression
  - No tallying phase
  - No shop integration
  - Doesn't use `RoundManager` (tries to manage rounds manually)
- **Types** may be out of sync with current game state structure
- **Components** may not display new features (rerolls, lives, levels, shop)

## Goals

1. **Minimum viable React app** that can play the same game as CLI
2. **Use existing game engine** - don't duplicate logic
3. **Don't touch `src/game/` folder** - work with what's there
4. **Focus on single-player** - ignore multiplayer for now

## Implementation Plan

### Phase 1: Update WebGameManager to Use RoundManager

**Problem**: `WebGameManager` currently tries to manage rounds manually, but the CLI uses `RoundManager` which handles all the complex logic (rerolls, flops, scoring, banking, etc.).

**Solution**: Instead of trying to replicate `RoundManager` logic, create a bridge that:

- Uses `RoundManager` internally
- Converts between `RoundManager`'s async interface and React's state management
- Provides a simplified interface for React components

**Changes Needed**:

- Refactor `WebGameManager` to use `RoundManager.playRound()` internally
- Handle async operations (prompts, user input) in a React-friendly way
- Map `RoundManager`'s flow to React state updates

### Phase 2: Update Types

**Problem**: React app types may be out of sync with current game state structure.

**Solution**:

- Update `src/app/types/game.ts` to match current `src/game/types.ts`
- Ensure all new fields are included (rerolls, lives, levels, shop, blessings)

**Changes Needed**:

- Review and update type definitions
- Add missing fields (rerollValue, livesValue, currentLevel structure, etc.)
- Ensure compatibility with game engine types

### Phase 3: Update Components for New Features

**Problem**: Components don't display new features (rerolls, lives, levels, shop).

**Solution**: Update components to show:

- Reroll prompts and remaining rerolls
- Lives remaining
- Level information
- Shop interface (when between levels)
- Tallying screen (when level completes)

**Changes Needed**:

- Update `GameStatus` to show rerolls and lives
- Add reroll prompt UI
- Add level display
- Add shop component integration
- Add tallying screen component

### Phase 4: Handle Game Flow

**Problem**: React app doesn't handle the full game flow (rounds → levels → shop → next level).

**Solution**: Implement proper game flow:

- Round management (using RoundManager)
- Level progression
- Tallying phase
- Shop phase
- Next level start

**Changes Needed**:

- Update `WebGameManager` to handle level transitions
- Add shop state management
- Add tallying state management
- Handle game over conditions

## Technical Approach

### Option 1: Bridge Pattern (Recommended)

Create a bridge between `RoundManager` and React:

- `WebGameManager` uses `RoundManager` internally
- Convert async prompts to React state
- Use callbacks for user input (reroll selection, scoring selection, etc.)

**Pros**:

- Reuses all existing game logic
- Minimal code duplication
- Stays in sync with CLI

**Cons**:

- More complex state management
- Need to handle async operations

### Option 2: Simplified Game Manager

Create a simplified version that only handles basic gameplay:

- Skip reroll prompts (auto-skip or simple UI)
- Skip shop (auto-advance levels)
- Skip tallying (auto-calculate and apply)

**Pros**:

- Simpler implementation
- Faster to get working

**Cons**:

- Loses features
- Diverges from CLI experience
- May need to be rewritten later

## Recommended Approach: Option 1 (Bridge Pattern)

### Architecture

```
React Components
    ↓
WebGameManager (Bridge)
    ↓
RoundManager (Game Engine)
    ↓
Game Logic (src/game/)
```

### Key Components

1. **WebGameManager**:

   - Wraps `RoundManager`
   - Converts async prompts to React state
   - Manages game flow (rounds → levels → shop)
   - Provides callbacks for user actions

2. **React State**:

   - Current game state
   - Current round state
   - UI state (waiting for reroll selection, waiting for scoring selection, etc.)
   - Shop state (when in shop)
   - Tallying state (when showing tallying screen)

3. **Components**:
   - `GameBoard`: Main game display
   - `RerollPrompt`: Handle reroll selection
   - `ScoringSelection`: Handle dice selection for scoring
   - `ShopDisplay`: Shop interface
   - `TallyingScreen`: Tallying display
   - `LevelDisplay`: Show level info

## Implementation Steps

### Step 1: Update WebGameManager Structure

- Remove manual round management
- Add `RoundManager` integration
- Create state management for async operations
- Add callbacks for user input

### Step 2: Update Types

- Sync `src/app/types/game.ts` with `src/game/types.ts`
- Add UI-specific types as needed

### Step 3: Create Reroll Prompt Component

- Display reroll prompt
- Allow dice selection
- Submit selection to `WebGameManager`

### Step 4: Update Game Flow

- Handle round → level → shop → next level flow
- Add shop state management
- Add tallying state management

### Step 5: Update Components

- Update `GameStatus` for new features
- Update `GameBoard` for new flow
- Add shop and tallying components

### Step 6: Testing

- Test basic gameplay flow
- Test reroll prompts
- Test level progression
- Test shop integration
- Test game over conditions

## Files to Modify

### Must Modify

- `src/app/services/WebGameManager.ts` - Major refactor to use RoundManager
- `src/app/types/game.ts` - Update types
- `src/app/hooks/useGameState.ts` - Update for new flow
- `src/app/components/game/GameBoard.tsx` - Update for new features
- `src/app/components/game/GameStatus.tsx` - Add rerolls/lives/level display

### May Need to Modify

- `src/app/components/game/GameControls.tsx` - Update for reroll prompts
- `src/app/components/game/DiceSelector.tsx` - May need updates
- `src/app/components/single-player/SinglePlayerGame.tsx` - Update flow

### Can Scrap/Simplify

- Multiplayer components (ignore for now)
- Complex inventory displays (simplify)
- Advanced UI features (keep minimal)

## Success Criteria

- [ ] Can start a new game
- [ ] Can roll dice
- [ ] Can see reroll prompt and select dice to reroll
- [ ] Can select dice to score
- [ ] Can bank points
- [ ] Can see level progression
- [ ] Can see shop between levels
- [ ] Can see tallying screen
- [ ] Can complete multiple levels
- [ ] Can see game over when lives run out

## Notes

- Focus on functionality over polish
- Don't worry about perfect UI/UX
- Keep it simple and working
- Can iterate and improve later
