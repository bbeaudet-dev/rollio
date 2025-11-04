# Roguelike Progression System: Rerolls, Lives, Tallying, Blessings & Shop

## Overview

This spec defines the complete roguelike progression system for Rollio, including rerolls, lives, end-of-level tallying, blessings (permanent upgrades), and shop mechanics.

Each game is structured as a "run" of levels, where each level has a point threshold to reach within a limited number of lives (rounds).

## Core Concepts

### Game Structure

- **Level**: A single challenge with a point threshold and limited lives
- **Round**: One or more successive rolls; ends with either flopping (costs 1 life) or banking points
- **Run**: Consists of multiple levels until failure (lives run out)
- **Game**: The entire Rollio experience (multiple runs, meta-progression)

### Key Systems

1. **Reroll System**: Players can reroll selected dice before scoring/flop checks
2. **Lives System**: Essentially the number of rounds available per level (lose 1 on flop)
3. **Tallying Phase**: Calculate money earned between level completion and shop
4. **Blessings System**: Permanent upgrades per run (3 tiers, unlock progressively)
5. **Shop System**: Buy/sell items between levels

## Reroll System

### Core Mechanics

**Reroll Value**: Base number of rerolls (e.g., 3)

- Stored in game state as `rerollValue`
- Can be permanently modified by consumables and blessings

**Rerolls Per Level**: Actual rerolls available for the current level

- Calculated from ( `rerollValue` + bonuses ) x multipliers
- Reset at start of each level (after shop, before first roll)
- Can be temporarily modified by charms/consumables

### Reroll Flow

1. **After Dice Roll**: Before flop check or scoring selection

   - Roll dice → Create initial `RollState` with `rollNumber: 1, isReroll: false` and add to `currentRound.rollHistory`
   - Update `currentRound.diceHand` to match rolled dice
   - If `currentLevel.rerollsRemaining > 0`, prompt: "Reroll dice? (Select up to [X], or press Enter to skip)"
   - Validate selection (dice IDs exist, within reroll limit)
   - **Reroll creates a new RollState**: Reroll selected dice (keep others unchanged), create new `RollState` with `rollNumber: 1, isReroll: true` and updated `diceHand` snapshot, add to `currentRound.rollHistory`
   - Update `currentRound.diceHand` to match new roll state
   - Animate only rerolled dice
   - Decrement `currentLevel.rerollsRemaining` after reroll
   - If `currentLevel.rerollsRemaining > 0`, prompt again
   - If no rerolls remaining or user skips, proceed to flop check/scoring

2. **Reroll Refresh**: At start of each level (after shop, before first roll)
   - Calculate: `currentLevel.rerollsRemaining = calculateRerollsForLevel(rerollValue, gameState)`
   - Apply bonuses/multipliers from charms (e.g., "double rerolls at start of level")

**Important**: Each reroll creates a new `RollState` entry in the roll history. The roll history tracks every attempt at rolling dice, including rerolls. This allows us to see the progression of dice values through rerolls.

### Reroll Modifiers

**Base Value Modifiers** (affect `rerollValue`):

- Blessings: "+1 Rerolls" (permanent increase to base value)

**Level Multipliers** (affect rerolls for that level):

- Charms: "Double Rerolls" charm doubles `rerollValue` for the level
- Example: `rerollValue = 3`, charm doubles → 6 rerolls for level as long as charm is in inventory

**During-Level Bonuses** (add temporary rerolls):

- Charms/Blessings: "+1 reroll when banking points"
- Charms: "+1 reroll when playing [combination]" (changes per round/level)
- Consumables: "Gain 2 rerolls for this level" (one-time use)

### Implementation Details

**Reroll Logic**:

- After `rollManager.rollDice()` in `RoundManager.playRound()`
- Create initial `RollState` with rolled dice, `rollNumber: 1, isReroll: false`, add to `currentRound.rollHistory`
- Update `currentRound.diceHand` to match rolled dice
- Before `isFlop()` check
- Check `currentLevel.rerollsRemaining > 0` to determine if prompt should appear
- If rerolls available:
  - Prompt user for dice selection
  - Validate selection (dice IDs exist, within reroll limit)
  - Reroll selected dice (keep others unchanged)
  - **Create new RollState** with `rollNumber: 1, isReroll: true` and updated `diceHand` (snapshot of dice after reroll)
  - Add new `RollState` to `currentRound.rollHistory`
  - Update `currentRound.diceHand` to match new roll state
  - Decrement `currentLevel.rerollsRemaining`
  - Animate only rerolled dice
  - If `currentLevel.rerollsRemaining > 0`, prompt again
- If no rerolls remaining or user skips, proceed to flop check/scoring

**Reroll Animation**:

- Update `SimpleDiceAnimation.animateDiceRoll()` to support partial rerolls
- Only animate selected dice
- Keep other dice static

**RollState Tracking**:

- Each roll attempt (including rerolls) creates a new `RollState` entry
- `RollState.diceHand` is a snapshot of dice values at that moment (historical record)
- `RoundState.diceHand` is the current active dice hand (changes as you score/reroll)
- `RollState.rollNumber` stays the same for all rolls/rerolls in the same roll sequence (before scoring)
- `RollState.isReroll` is `false` for initial roll, `true` for rerolls
- `currentRound.rollHistory` tracks the progression: Roll 1 (isReroll: false) → Reroll 1 (isReroll: true) → Reroll 2 (isReroll: true) → etc.
- When scoring, the current `diceHand` is used, but the roll history preserves the progression

## Lives System

### Core Mechanics

**Lives Value**: Base number of lives per level (e.g., 3)

- Stored in game state as `livesValue`
- Can be modified by consumables and blessings

**Lives Per Level**: Actual lives available for the current level

- Calculated from `livesValue` + modifiers + bonuses
- Reset at start of each level (after shop, before first roll)
- Lose 1 life on flop (if no shields/rerolls available)

### Lives Flow

1. **Level Start**: `levelState.livesRemaining = calculateLivesForLevel(gameState.core.livesValue, gameState)`
2. **During Level**:
   - Banking points: Does NOT use a life
   - Flopping: Uses 1 life (unless prevented by flop shield or reroll) → `levelState.livesRemaining--`
3. **Level End**:
   - `levelState.livesRemaining` contributes to money bonus in tallying
   - Lives reset at start of next level (after shop)

### Lives Modifiers

**Base Value Modifiers** (affect `livesValue`):

- Blessings: "+1 Lives" (permanent increase to base value)

**Level Bonuses** (add lives for that level):

- Charms: "+2 Lives" charm adds 2 lives per level while charm is in inventory
- Example: `livesValue = 3`, charm adds 2 → 5 lives for level

### Implementation Details

**Lives Logic**:

- On flop (if not prevented): `currentLevel.livesRemaining--`
- If `currentLevel.livesRemaining <= 0`: Level failed, game over (run ends)
- Lives reset at start of each level (after shop) via `calculateLivesForLevel()` → `currentLevel.livesRemaining = calculatedValue`
- When level completes, store final `livesRemaining` in completed level history

## Tallying Phase

### Overview

Between level completion and shop entry, calculate money earned from:

1. Base level completion reward (scales with difficulty)
2. Unused lives bonus ($1 per life, can be modified by charms)
3. Charms that grant money at level end
4. Other bonuses

### Tallying Flow

1. **Level Completed**: Player reaches point threshold for banked points
2. **Tallying Screen**: Calculate and display:

   ```
   === LEVEL COMPLETE ===
   Level X Complete!

   Money Earned:
   - Level completion: $X
   - Unused lives (3): +$3
   - Charm bonuses: +$5
   - Total: $X

   Press Enter to Shop...
   ```

3. **Add Money**: Update game state money
4. **Enter Shop**: Proceed to shop interface

### Money Sources

**Level Completion Rewards**:

- Level 1-5: $2
- Level 6-10: $3
- Level 11-15: $4
- so on and so on

**Unused Lives Bonus**:

- Base: $1 per unused life
- Can be modified by charms: "+$2 per unused life" charm → $3 per unused life

**Charm Bonuses**:

- Charms that grant money at level end (e.g., "+$5 at end of level")
- Applied during tallying phase

### Implementation Details

**Tallying Function**:

```typescript
function calculateLevelRewards(
  level: number,
  levelState: LevelState,
  gameState: GameState
): {
  baseReward: number;
  livesBonus: number;
  charmBonuses: number;
  total: number;
};
```

**Display**: Use `CLIDisplayFormatter` for tallying screen
**Timing**: Between level completion and shop entry

## Blessings System

### Overview

Blessings are permanent upgrades that can only be purchased once per run. Similar to Balatro's Vouchers, they have 3 tiers that unlock progressively.

### Blessing Structure

**Tiers**:

- **Tier 1**: Base upgrade (always available, set probability to appear in shop)
- **Tier 2**: Unlocked after purchasing Tier 1
- **Tier 3**: Unlocked after purchasing Tier 2

**Purchase**:

- Each tier can only be purchased once per run
- Purchased in shop
- Apply immediately and persist for rest of run

### Blessing Types

#### 1. Reroll Blessings

- **Tier 1**: "+1 Rerolls" (increases `rerollValue` by 1)
- **Tier 2**: "+1 Rerolls" (increases `rerollValue` by 1, total +2)
- **Tier 3**: "+1 Rerolls" (increases `rerollValue` by 1, total +3)

#### 2. Lives Blessings

- **Tier 1**: "+1 Lives" (increases `livesValue` by 1)
- **Tier 2**: "+1 Lives" (increases `livesValue` by 1, total +2)
- **Tier 3**: "+1 Lives" (increases `livesValue` by 1, total +3)

#### 3. Reroll Ability Blessings

- **Tier 1**: "+1 reroll when flopping" (round effect)
- **Tier 2**: "+1 reroll when banking points" (round effect, not base value)
- **Tier 3**: "+$1 for each reroll used" (roll effect)

#### 4. Slot Blessings

- **Tier 1**: "+1 Charm Slot"
- **Tier 2**: "+1 Consumable Slot"
- **Tier 3**: "+1 Charm Slot" (total +2)"

#### 5. Shop Discount Blessings

- **Tier 1**: "Everything 5% cheaper"
- **Tier 2**: "Everything 10% cheaper" (total 15%)
- **Tier 3**: "Everything 15% cheaper" (total 30%)

#### 6. Flop Subversion Blessings

- **Tier 1**: "10% chance to subvert flops" (separate from flop shields, triggers BEFORE flop shields)
- **Tier 2**: "20% chance to subvert flops" (total 30%)
- **Tier 3**: "30% chance to subvert flops" (total 60%)

#### 7. Money Blessings

- **Tier 1**: "+$1 per unused life at end of level"
- **Tier 2**: "+$2 per unused life at end of level" (total +$3)
- **Tier 3**: "+$3 per unused life at end of level" (total +$6)

#### 8. Additional Blessings (Future)

- Dice upgrade blessings
- Material enhancement blessings
- Combination discovery blessings
- And more...

### Blessing Implementation

**Game State**:

```typescript
interface GameCore {
  // ... existing fields
  blessings: Blessing[]; // Purchased blessings for this run
}

interface Blessing {
  id: string;
  tier: 1 | 2 | 3;
  effect: BlessingEffect;
}

type BlessingEffect =
  | { type: "rerollValue"; amount: number }
  | { type: "livesValue"; amount: number }
  | { type: "rerollOnBank"; amount: number }
  | { type: "rerollOnFlop"; amount: number }
  | { type: "rerollOnCombination"; combination: string; amount: number }
  | { type: "charmSlots"; amount: number }
  | { type: "consumableSlots"; amount: number }
  | { type: "shopDiscount"; percentage: number }
  | { type: "flopSubversion"; percentage: number }
  | { type: "moneyPerLife"; amount: number }
  | { type: "moneyOnLevelEnd"; amount: number }
  | { type: "moneyOnRerollUsed"; amount: number };
```

**Blessing Definitions**:

```typescript
// src/game/content/blessings.ts
export const BLESSINGS: BlessingDefinition[] = [
  // Reroll Blessings
  {
    id: "rerollTier1",
    name: "Reroll Blessing I",
    description: "+1 Rerolls",
    tier: 1,
    effect: { type: "rerollValue", amount: 1 },
    price: 5,
    unlocks: ["rerollTier2"],
  },
  {
    id: "rerollTier2",
    name: "Reroll Blessing II",
    description: "+1 Rerolls (total +2)",
    tier: 2,
    effect: { type: "rerollValue", amount: 1 },
    price: 5,
    requires: "rerollTier1",
    unlocks: ["rerollTier3"],
  },
  {
    id: "rerollTier3",
    name: "Reroll Blessing III",
    description: "+1 Rerolls (total +3)",
    tier: 3,
    effect: { type: "rerollValue", amount: 1 },
    price: 5,
    requires: "rerollTier2",
  },

  // Lives Blessings
  {
    id: "livesTier1",
    name: "Lives Blessing I",
    description: "+1 Lives",
    tier: 1,
    effect: { type: "livesValue", amount: 1 },
    price: 5,
    unlocks: ["livesTier2"],
  },
  {
    id: "livesTier2",
    name: "Lives Blessing II",
    description: "+1 Lives (total +2)",
    tier: 2,
    effect: { type: "livesValue", amount: 1 },
    price: 5,
    requires: "livesTier1",
    unlocks: ["livesTier3"],
  },
  {
    id: "livesTier3",
    name: "Lives Blessing III",
    description: "+1 Lives (total +3)",
    tier: 3,
    effect: { type: "livesValue", amount: 1 },
    price: 5,
    requires: "livesTier2",
  },

  // Reroll Ability Blessings
  {
    id: "rerollAbilityTier1",
    name: "Reroll Ability Blessing I",
    description: "+1 reroll when flopping",
    tier: 1,
    effect: { type: "rerollOnFlop", amount: 1 },
    price: 5,
    unlocks: ["rerollAbilityTier2"],
  },
  {
    id: "rerollAbilityTier2",
    name: "Reroll Ability Blessing II",
    description: "+1 reroll when banking points",
    tier: 2,
    effect: { type: "rerollOnBank", amount: 1 },
    price: 5,
    requires: "rerollAbilityTier1",
    unlocks: ["rerollAbilityTier3"],
  },
  {
    id: "rerollAbilityTier3",
    name: "Reroll Ability Blessing III",
    description: "+$1 for each reroll used",
    tier: 3,
    effect: { type: "moneyOnRerollUsed", amount: 1 },
    price: 5,
    requires: "rerollAbilityTier2",
  },

  // Slot Blessings
  {
    id: "slotTier1",
    name: "Slot Blessing I",
    description: "+1 Charm Slot",
    tier: 1,
    effect: { type: "charmSlots", amount: 1 },
    price: 5,
    unlocks: ["slotTier2"],
  },
  {
    id: "slotTier2",
    name: "Slot Blessing II",
    description: "+1 Consumable Slot",
    tier: 2,
    effect: { type: "consumableSlots", amount: 1 },
    price: 5,
    requires: "slotTier1",
    unlocks: ["slotTier3"],
  },
  {
    id: "slotTier3",
    name: "Slot Blessing III",
    description: "+1 Charm Slot (total +2)",
    tier: 3,
    effect: { type: "charmSlots", amount: 1 },
    price: 5,
    requires: "slotTier2",
  },

  // Shop Discount Blessings
  {
    id: "discountTier1",
    name: "Discount Blessing I",
    description: "Everything 5% cheaper",
    tier: 1,
    effect: { type: "shopDiscount", percentage: 5 },
    price: 5,
    unlocks: ["discountTier2"],
  },
  {
    id: "discountTier2",
    name: "Discount Blessing II",
    description: "Everything 10% cheaper (total 15%)",
    tier: 2,
    effect: { type: "shopDiscount", percentage: 10 },
    price: 5,
    requires: "discountTier1",
    unlocks: ["discountTier3"],
  },
  {
    id: "discountTier3",
    name: "Discount Blessing III",
    description: "Everything 15% cheaper (total 30%)",
    tier: 3,
    effect: { type: "shopDiscount", percentage: 15 },
    price: 5,
    requires: "discountTier2",
  },

  // Flop Subversion Blessings
  {
    id: "flopSubversionTier1",
    name: "Flop Subversion Blessing I",
    description: "10% chance to subvert flops",
    tier: 1,
    effect: { type: "flopSubversion", percentage: 10 },
    price: 5,
    unlocks: ["flopSubversionTier2"],
  },
  {
    id: "flopSubversionTier2",
    name: "Flop Subversion Blessing II",
    description: "20% chance to subvert flops (total 30%)",
    tier: 2,
    effect: { type: "flopSubversion", percentage: 20 },
    price: 5,
    requires: "flopSubversionTier1",
    unlocks: ["flopSubversionTier3"],
  },
  {
    id: "flopSubversionTier3",
    name: "Flop Subversion Blessing III",
    description: "30% chance to subvert flops (total 60%)",
    tier: 3,
    effect: { type: "flopSubversion", percentage: 30 },
    price: 5,
    requires: "flopSubversionTier2",
  },

  // Money Blessings
  {
    id: "moneyTier1",
    name: "Money Blessing I",
    description: "+$1 per unused life at end of level",
    tier: 1,
    effect: { type: "moneyPerLife", amount: 1 },
    price: 5,
    unlocks: ["moneyTier2"],
  },
  {
    id: "moneyTier2",
    name: "Money Blessing II",
    description: "+$2 per unused life at end of level (total +$3)",
    tier: 2,
    effect: { type: "moneyPerLife", amount: 2 },
    price: 5,
    requires: "moneyTier1",
    unlocks: ["moneyTier3"],
  },
  {
    id: "moneyTier3",
    name: "Money Blessing III",
    description: "+$3 per unused life at end of level (total +$6)",
    tier: 3,
    effect: { type: "moneyPerLife", amount: 3 },
    price: 5,
    requires: "moneyTier2",
  },
];
```

**Shop Integration**:

- Blessings appear in shop in separate section, one random blessing available for purchase each shop
- Only show available tiers (unlocked by previous tier purchase)
- Display: "✅ Purchased" for already-purchased tiers
- Can only purchase each once per run
- Shop state is part of `LevelState` since shops appear between levels

## Shop System

### Shop Structure

```
=== SHOP (Level X) ===
Money: $XXX

BLESSINGS:
1. Reroll Blessing I - $50 - +1 Rerolls [AVAILABLE]
2. Empty slot

CHARMS:
1. Flop Shield (Rare) - $6 - Prevents flops (3 uses)
2. Score Multiplier (Uncommon) - $10 - 1.5x all points
3. other charm
4. Empty slot

CONSUMABLES:
1. Money Doubler (Rare) - $8 - Double money (1 use)
2. Extra Die (Uncommon) - $12 - Add die to hand (1 use)
3. Empty slot

DICE UPGRADES:
1. Crystal Die Upgrade - $30
2. Wooden Die Upgrade - $20
3. Empty slot

(b) Buy item
(s) Sell item
(i) Inventory
(n) Next level
```

### Shop Mechanics

**Buying**:

- Select item by number
- Check if sufficient money
- Apply shop discounts (from blessings)
- Add item to inventory
- Deduct money

**Selling**:

- Select owned item to sell
- Receive 50% of buy price (rounded up)
- Remove item from inventory
- Add money

**Pricing**:

- Base prices determined by rarity
- Blessing discounts applied
- Sell values: 50% of buy price

### Shop Timing

1. **After Level Completion**: Tallying phase → Enter shop
   - Shop state is in `currentLevel.shop`
   - Shop includes: charms, consumables, dice upgrades, and blessings
2. **Shop Exit**:
   - Reset rerolls (calculate `rerollsForLevel`)
   - Reset lives (calculate `livesForLevel`)
   - Start next level
   - Shop state persists in `currentLevel.shop` but is typically only active between levels

## Level Progression

### Level Structure

| Level | Lives | Point Threshold | Base Money |
| ----- | ----- | --------------- | ---------- |
| 1     | 8     | 500             | $2         |
| 2     | 7     | 1000            | $2         |
| 3     | 6     | 2000            | $2         |
| 4     | 6     | 4000            | $2         |
| 5     | 5     | 8000            | $2         |
| 6     | 5     | 15000           | $3         |
| 7     | 5     | 25000           | $3         |
| 8     | 5     | 40000           | $3         |
| 9     | 5     | 60000           | $3         |
| 10    | 5     | 85000           | $3         |
| 11+   | 5     | +25000/level    | $4+        |

### Level Completion

**Success**: Reach threshold within lives limit

- Advance to next level
- Enter tallying phase
- Visit shop
- Carry over charms, consumables, money, blessings

**Failure**: Lives run out

- Game over (run ends)
- Display final statistics
- Option to start new run

## Implementation Plan

### Phase 1: Core Systems (Rerolls & Lives)

1. **Game State Updates**

   - **Flatten structure**: Remove `meta/core/history` split from GameState, RoundState, RollState
   - Add `rerollValue`, `livesValue` to `GameState` (persist across levels)
   - Create `LevelState` interface for level-specific state
   - Add `currentLevel: LevelState` to `GameState` structure
   - Move `shop: ShopState` to `LevelState` (includes blessings)
   - Move `currentRound: RoundState` to `LevelState`
   - Consolidate all history in `GameState.history`
   - Move `gameScore` to `history.totalScore`
   - Rename `hotDiceCounterRound` to `hotDiceCounter`

2. **Reroll System**

   - Implement reroll prompt in `RoundManager`
   - Add reroll validation logic
   - **Create new RollState on each reroll**: Each reroll creates a new `RollState` entry with `isReroll: true` and same `rollNumber` in `rollHistory`
   - Update dice animation for partial rerolls
   - Add reroll calculation functions
   - Track reroll progression in roll history

3. **Lives System**
   - Implement lives tracking
   - Update flop logic to consume lives
   - Add lives calculation functions
   - Add lives reset on level start

### Phase 2: Tallying & Blessings

4. **Tallying Phase**

   - Create tallying screen/formatter
   - Implement money calculation logic
   - Add level completion rewards
   - Integrate with level transition

5. **Blessings System**

   - Create `blessings.ts` content file
   - Define blessing types and effects
   - Implement blessing application logic
   - Add blessing tracking to game state

6. **Shop Integration**
   - Add blessings section to shop
   - Implement blessing purchase logic
   - Add tier unlocking system
   - Update shop UI/UX

### Phase 3: Charms & Consumables

7. **Reroll Charms**

   - Create "Double Rerolls" charm
   - Create "+1 reroll on bank" charm
   - Create "+1 reroll on combination" charm
   - Implement charm effects

8. **Lives Charms**

   - Create "+2 Lives" charm
   - Implement charm effects

9. **Money Charms**

   - Create "+$5 at end of level" charm
   - Create "+$2 per unused life" charm
   - Implement charm effects

10. **Reroll Consumables**
    - Create "+1 Reroll Value" consumable
    - Create "Gain 2 rerolls" consumable
    - Implement consumable effects

### Phase 4: Level System

11. **Level Manager**

    - Create `LevelManager` class
    - Implement level progression
    - Add level configuration
    - Integrate with game engine

12. **Shop Manager**
    - Create `ShopManager` class
    - Implement shop inventory
    - Add buying/selling logic
    - Integrate with blessings

### Phase 5: Polish & Balance

13. **UI/UX**

    - Update CLI display for all new systems
    - Add visual indicators for rerolls/lives
    - Improve shop interface
    - Add tallying screen animations

14. **Testing & Balance**
    - Playtest reroll system
    - Balance lives per level
    - Adjust shop prices
    - Fine-tune blessing effects
    - Balance level difficulty

## Technical Components

### New Files

```
src/game/content/
  - blessings.ts              # Blessing definitions
  - blessings/
    - RerollBlessing.ts
    - LivesBlessing.ts
    - RerollAbilityBlessing.ts
    - SlotBlessing.ts
    - DiscountBlessing.ts
    - FlopSubversionBlessing.ts
    - MoneyBlessing.ts
    - index.ts

src/game/engine/
  - LevelManager.ts           # Handles level progression
  - ShopManager.ts            # Manages shop transactions
  - RerollManager.ts          # Handles reroll logic
  - LivesManager.ts           # Handles lives logic
  - TallyingManager.ts        # Calculates level rewards

src/game/logic/
  - rerollLogic.ts            # Reroll validation and calculation
  - livesLogic.ts             # Lives calculation and tracking
  - tallyingLogic.ts          # Money calculation for level end
  - blessingLogic.ts          # Blessing effect application
```

### Updated Files

```
src/game/core/types.ts        # Flatten structure, add LevelState, reroll/lives/blessings, consolidate history
src/game/engine/RoundManager.ts  # Add reroll prompt flow
src/game/engine/GameEngine.ts    # Add level system integration
src/cli/cliInterface.ts       # Add reroll prompt, shop UI
src/cli/display/cliDisplay.ts   # Add tallying display
```

## Game State Structure

### Flattened Structure (No meta/core/history split)

The game state has been flattened to remove unnecessary nesting. All history is consolidated in `GameState.history`, and all active state is at appropriate levels.

```typescript
interface GameState {
  // Game-wide state (flattened - no meta/core split)
  isActive: boolean
  endReason?: GameEndReason
  money: number
  diceSet: Die[]
  charms: Charm[]
  consumables: Consumable[]
  blessings: Blessing[]
  rerollValue: number  // Base value (persists across levels)
  livesValue: number   // Base value (persists across levels)
  charmSlots: number
  consumableSlots: number
  settings: GameSettings
  config: GameConfig

  // Current level state (nested for hierarchy)
  currentLevel: LevelState {
    levelNumber: number
    levelThreshold: number
    rerollsRemaining: number  // Current rerolls (resets each level)
    livesRemaining: number    // Current lives (resets each level)

    shop: ShopState {  // Shop state (between levels)
      isOpen: boolean
      availableCharms: Charm[]
      availableConsumables: Consumable[]
      availableBlessings: Blessing[]  // One random blessing per shop
    }

    currentRound: RoundState {
      roundNumber: number  // Round number within level (1, 2, 3...)
      roundPoints: number
      diceHand: Die[]  // Current dice available to roll (changes as you score)
      hotDiceCounter: number  // Renamed from hotDiceCounterRound
      forfeitedPoints: number
      isActive: boolean
      endReason?: RoundEndReason

      // Roll history for this round (tracks all roll attempts including rerolls)
      rollHistory: RollState[]  // Each roll/reroll creates a new entry
    }
  }

  // History (consolidated here - all history in one place)
  history: {
    // Cumulative statistics (calculated from nested history)
    totalScore: number  // Renamed from gameScore - cumulative banked points
    rollCount: number
    hotDiceCounterGlobal: number
    forfeitedPointsTotal: number
    combinationCounters: CombinationCounters

    // Historical records (nested structure)
    levelHistory: LevelState[]  // Completed levels (excluding current)
    // Each LevelState in history contains complete state when level ended:
    // - levelNumber, levelThreshold
    // - rerollsRemaining (final value when level ended)
    // - livesRemaining (final value when level ended)
    // - pointsBanked (points banked in this level)
    // - completed (true/false)
    // - roundHistory: RoundState[]  // Completed rounds in this level
    //   - Each RoundState in history contains:
    //   - roundNumber, roundPoints, banked, flopped
    //   - rollHistory: RollState[]  // All rolls/rerolls in this round
    //     - Each RollState: diceHand (snapshot), rollPoints, combinations, etc.
  }
}

// Flattened LevelState (no optional - complete state)
interface LevelState {
  levelNumber: number
  levelThreshold: number

  // Current level only
  rerollsRemaining?: number
  livesRemaining?: number
  shop?: ShopState
  currentRound?: RoundState

  // Completed level only (in history)
  pointsBanked?: number
  completed?: boolean
  roundHistory?: RoundState[]
}

// Flattened RoundState (no meta/core/history split)
interface RoundState {
  roundNumber: number
  roundPoints: number
  diceHand: Die[]  // Current dice (for active) OR snapshot (for history)
  hotDiceCounter: number  // Renamed from hotDiceCounterRound
  forfeitedPoints: number
  isActive: boolean
  endReason?: RoundEndReason

  // Roll history for this round
  rollHistory: RollState[]  // All roll attempts including rerolls

  // Completed round only (in history)
  banked?: boolean
  flopped?: boolean
}

// Flattened RollState (no core/meta split)
interface RollState {
  rollNumber: number  // Within round (1, 2, 3... - stays same for rerolls in same sequence)
  isReroll: boolean  // false for initial roll, true for rerolls
  diceHand: Die[]  // Snapshot of dice rolled at this moment
  selectedDice: Die[]
  rollPoints: number
  maxRollPoints?: number
  scoringSelection?: number[]
  combinations?: ScoringCombination[]
  isHotDice?: boolean
  isFlop?: boolean
}

interface ShopState {
  isOpen: boolean
  availableCharms: Charm[]
  availableConsumables: Consumable[]
  availableBlessings: Blessing[]
}
```

### Key Design Decisions

1. **No meta/core/history split**: All state is flattened for simpler access
2. **History consolidated**: All history in `GameState.history` (no history scattered in RoundState/LevelState)
3. **ShopState in LevelState**: Shop appears between levels, so it belongs in level state
4. **Rerolls create new RollState**: Each reroll creates a new entry in `rollHistory`, tracking the progression
5. **diceHand clarification**:
   - `RoundState.diceHand` = current dice available to roll (changes as you score)
   - `RollState.diceHand` = snapshot of dice at that specific roll moment (historical record)
6. **roundNumber**: Only in `RoundState.roundNumber` (no separate `roundNumberInLevel`)
7. **hotDiceCounter**: Renamed from `hotDiceCounterRound` (still distinct from global)
8. **totalScore**: Moved from `gameScore` to `history.totalScore` (statistics)

## TODOs

### Phase 1: Core Systems

- [ ] Flatten game state structure (remove meta/core/history split)
- [ ] Add LevelState interface with shop and currentRound
- [ ] Add reroll/lives fields to game state
- [ ] Consolidate all history in GameState.history
- [ ] Move gameScore to history.totalScore
- [ ] Implement reroll prompt in RoundManager
- [ ] Add reroll validation logic
- [ ] Update dice animation for partial rerolls
- [ ] Implement lives tracking
- [ ] Update flop logic to consume lives
- [ ] Add reroll/lives calculation functions

### Phase 2: Tallying & Blessings

- [ ] Create tallying screen/formatter
- [ ] Implement money calculation logic
- [ ] Create blessings content file
- [ ] Implement blessing system
- [ ] Add blessing tracking to game state
- [ ] Integrate blessings with shop

### Phase 3: Charms & Consumables

- [ ] Create reroll-related charms
- [ ] Create lives-related charms
- [ ] Create money-related charms
- [ ] Create reroll consumables
- [ ] Implement all charm/consumable effects

### Phase 4: Level & Shop Systems

- [ ] Create LevelManager
- [ ] Implement level progression
- [ ] Create ShopManager
- [ ] Implement shop inventory
- [ ] Integrate with game engine

### Phase 5: Polish

- [ ] Update CLI displays
- [ ] Add visual indicators
- [ ] Playtest and balance
- [ ] Fine-tune prices and effects
