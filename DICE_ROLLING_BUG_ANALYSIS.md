# Dice Rolling Bug - Comprehensive Analysis & Fix Plan

## Problem

Player cannot roll dice when starting a new level sometimes.

## Root Cause Analysis

### Critical Path: New Level Start → Can Roll Check

1. **Level Initialization Flow:**

   - `exitShop()` → `advanceToNextLevel()` → creates level state with round
   - `exitShop()` → `initializeLevel()` → re-initializes level (redundant?)
   - `selectWorld()` → `initializeLevel()` → creates level state with round

2. **CanRoll Logic Chain:**

   ```
   createWebGameState()
   → isNewRound check (line 147)
   → pendingAction.type === 'none' check (line 155)
   → gameAPI.canRoll(gameState) check (line 155)
   ```

3. **gameAPI.canRoll() checks:**
   - `isActive` must be true
   - `currentWorld` must exist
   - `banksRemaining > 0` (CRITICAL - returns false if 0 or undefined)
   - If roundState exists and is active: `!hasRolled || hasRoundPoints`

### Failure Points Identified

#### 1. **pendingAction Not Reset**

- **Location:** Multiple places reset pendingAction, but timing issues
- **Issue:** If pendingAction is not 'none', canRoll is false (line 155)
- **Affected paths:**
  - `exitShop()` resets on line 878, but AFTER initializeLevel
  - `selectWorld()` resets on line 910, but AFTER initializeLevel
  - If initializeLevel triggers any async operations that set pendingAction, it might not be reset

#### 2. **banksRemaining = 0 or undefined**

- **Location:** `gameLogic.ts:101` - `if ((gameState.currentWorld.currentLevel.banksRemaining || 0) <= 0) return false;`
- **Issue:** If banksRemaining is 0 or undefined, canRoll returns false
- **Possible causes:**
  - Level effects reducing banks to 0
  - Calculation error in `calculateBanksForLevel()`
  - Level state not properly initialized

#### 3. **Round State Not Properly Initialized**

- **Location:** `createInitialLevelState()` creates round, but might not be active
- **Issue:** If roundState.isActive is false, canRoll logic might fail
- **Check:** `createInitialRoundState()` should set `isActive: true`

#### 4. **isNewRound Detection Failing**

- **Location:** `WebGameManager.ts:147`
- **Issue:** `isNewRound = roundState?.isActive && !hasRolledDice && roundState.rollHistory.length === 0`
- **Problem:** If roundState is null/undefined, isNewRound is false, falls to else branch (line 157)
- **Else branch:** `canRoll = !isProcessing && (this.gameAPI.canRoll(gameState) || justFlopped)`
- **Issue:** This doesn't check pendingAction, so might allow rolling when it shouldn't, OR might block when it should allow

#### 5. **Double Initialization in exitShop**

- **Location:** `exitShop()` lines 863-873
- **Issue:** Calls `initializeLevel()` even when level already has proper round state
- **Problem:** This might be overwriting state or causing race conditions

## Fix Plan

### Fix 1: Ensure pendingAction is Reset BEFORE canRoll Check

**Priority: CRITICAL**

- Reset pendingAction to 'none' IMMEDIATELY after initializeLevel
- Add defensive check in createWebGameState to force 'none' if roundState is new

### Fix 2: Add Defensive Checks for banksRemaining

**Priority: HIGH**

- Log warning if banksRemaining is 0 when level starts
- Add validation in createInitialLevelState to ensure banksRemaining > 0
- Add fallback: if banksRemaining is 0, set to 1 (minimum)

### Fix 3: Fix isNewRound Logic

**Priority: HIGH**

- Handle case where roundState is null/undefined
- If roundState is null but level exists, should be able to start new round
- Update canRoll logic to handle this case

### Fix 4: Simplify exitShop Logic

**Priority: MEDIUM**

- Remove redundant initializeLevel call
- advanceToNextLevel already creates level state with round
- Only call initializeLevel if level state doesn't exist

### Fix 5: Add Comprehensive Logging

**Priority: MEDIUM**

- Log all canRoll checks with full state
- Log pendingAction state
- Log banksRemaining value
- Log roundState state

### Fix 6: Add State Validation

**Priority: LOW**

- Add validation function to check game state is valid for rolling
- Call this before canRoll checks
- Return detailed error messages

## Implementation Order

1. **Fix 1** - pendingAction reset (immediate fix)
2. **Fix 3** - isNewRound logic (handles null roundState)
3. **Fix 2** - banksRemaining validation (prevents 0 banks)
4. **Fix 4** - Simplify exitShop (cleanup)
5. **Fix 5** - Add logging (debugging)
6. **Fix 6** - State validation (long-term)

## Testing Checklist

- [ ] New game → select world → can roll immediately
- [ ] Complete level → exit shop → can roll on new level
- [ ] World boundary → select world → can roll on new level
- [ ] After flop → continue → can roll on new round
- [ ] After bank → can roll on new round
- [ ] With 0 banks remaining → should not be able to roll (game over)
- [ ] With pendingAction set → should not be able to roll until resolved
