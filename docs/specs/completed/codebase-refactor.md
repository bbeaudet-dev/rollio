# Codebase Refactor & Modularization Spec

## Overview

This spec outlines the next steps for refactoring, modularizing, and documenting the Rollio codebase. The goal is to improve maintainability, clarity, and extensibility as the project grows.

---

## 1. File Organization & Moves

**Move the following files to more logical locations:**

- [ ] Move `consumableEffects.ts` to `logic/consumableEffects.ts`
- [ ] Move `display.ts` to `engine/display.ts` (or `ui/` if you create one)
- [ ] Move `interfaces.ts` to `core/interfaces.ts`
- [ ] Move `nameConfig.ts` and `config.ts` to `core/` or a new `config/` folder

---

## 2. Modularization & Clean-up

- [ ] Review large files (e.g., `display.ts`, `consumableEffects.ts`) for further modularization
- [ ] Extract any multi-responsibility logic into helpers or new modules
- [ ] Ensure all managers (`GameEngine`, `RoundManager`, `SetupManager`, `RollManager`) are clean and focused

---

## 3. Documentation

- [ ] Add or update documentation for:
  - [ ] New folder structure and file responsibilities
  - [ ] Manager class responsibilities and usage
  - [ ] Formatting conventions (see `docs/agents/formatting.md`)

---

## 4. Testing

- [ ] Ensure all pure logic modules in `logic/` are covered by unit tests
- [ ] Add or update tests for any refactored or moved logic

---

## 5. Type Safety

- [ ] Tighten up types/interfaces for game state, round state, and all manager methods
- [ ] Ensure all public APIs are strongly typed

---

## 6. Performance

- [ ] Review and optimize any hot paths (e.g., scoring partitioning)
- [ ] Profile and address any slowdowns after refactor

---

## 7. Feature TODOs (Post-Refactor)

- [ ] Continue with prioritized gameplay feature list (charms, materials, UI improvements, etc.)

---

## 8. Game Core Restructure & Factory Pattern

**Goal**: Remove `game/core/` folder and consolidate state creation into a factory pattern.

### 8.1 File Moves

- [ ] Move `game/core/types.ts` → `game/types.ts`
- [ ] Move `game/core/gameInitializer.ts` → `game/utils/factories.ts`
- [ ] Move `game/consumableEffects.ts` → `game/logic/consumableEffects.ts`

### 8.2 Factory Functions

Create `game/utils/factories.ts` with the following factory functions:

- [ ] `createInitialGameState(diceSetConfig: DiceSetConfig): GameState`
- [ ] `createInitialLevelState(levelNumber: number, gameState: GameState): LevelState` - **NEW** (extracted from inline creation in `createInitialGameState` and `advanceToNextLevel`)
- [ ] `createInitialRoundState(roundNumber: number): RoundState`
- [ ] `createDiceFromConfig(diceConfig: Omit<Die, 'scored' | 'rolledValue'>[]): Die[]`
- [ ] `createInitialCombinationCounters(): CombinationCounters`
- [ ] `resetDiceScoredState(diceSet: Die[]): void`

### 8.3 Refactoring Details

**Level State Creation**:

- Currently, `LevelState` is created inline in two places:
  1. `createInitialGameState()` - creates initial level (Level 1)
  2. `advanceToNextLevel()` in `gameLogic.ts` - creates new levels
- Extract to `createInitialLevelState()` to avoid duplication
- This function should handle:
  - Level number and threshold from level config
  - Base rerolls/lives calculation (from game state + charms/blessings)
  - Level effects (boss effects, modifiers)
  - Initialization of level-specific state (consecutiveFlops, pointsBanked, shop, etc.)

**Dice Creation**:

- `createDiceFromConfig()` is currently in `gameInitializer.ts`
- Move to `factories.ts` alongside other factory functions
- This is a factory function (creates objects), so it belongs with other factories

**Shop Inventory**:

- `generateShopInventory()` stays in `game/logic/shop.ts` (shop-specific logic, not a general factory)

### 8.4 Cleanup & Redundancy Check

- [ ] Remove `game/core/` folder after moves
- [ ] Update all imports from `game/core/types` → `game/types`
- [ ] Update all imports from `game/core/gameInitializer` → `game/utils/factories`
- [ ] Check for any unused or redundant factory functions
- [ ] Verify no duplicate level creation logic remains

### 8.5 Testing

- [ ] Update tests that import from `game/core/`
- [ ] Verify `createInitialLevelState()` works correctly for both initial level and level advancement
- [ ] Ensure all factory functions maintain existing behavior

---

_This spec should be referenced and updated as you proceed with the refactor and modularization process._
