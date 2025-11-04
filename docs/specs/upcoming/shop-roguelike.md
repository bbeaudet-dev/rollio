# Shop & Roguelike Progression System

## Overview

This spec defines the complete shop and roguelike progression system for Rollio. Each game is now structured as a "run" of levels, where each level has a point threshold to reach within a limited number of rounds, rolls, or flops. Between levels, players visit shops to upgrade their capabilities for the next challenge.

## Core Concepts

### Game Structure Redefinition

- **Level**: A single challenge with round(s) and a point threshold
- **Round**: One or more successive rolls; ends with either flopping or banking points
- **Run**: Consists of multiple levels until failure
- **Game**: The entire Rollio experience (multiple runs, meta-progression)

### Level System

Each level has:

- **Point Threshold**: Target score to advance
- **Round Limit**: Maximum rounds to achieve threshold
- **Difficulty Modifiers**: Scaling challenges and penalties
- **Rewards**: Money and items for completing the level

### Shop System

Between levels, players visit shops to:

- Buy charms, consumables, and dice upgrades
- Sell items for money
- Prepare for the next level's challenges

## Level Progression

### Level Structure

| Level | Rounds | Point Threshold | Shop Features                   |
| ----- | ------ | --------------- | ------------------------------- |
| 1     | 8      | 500             | Basic items, low prices         |
| 2     | 7      | 5000            | More variety, moderate prices   |
| 3     | 6      | 8000            | Advanced items, higher prices   |
| 4     | 6      | 12000           | Rare items, expensive           |
| 5     | 5      | 18000           | Legendary items, very expensive |
| 6+    | 5      | +6000/level     | Boss mechanics, special items   |

### Difficulty Scaling

**Point Thresholds**: Increase exponentially (3000 → 5000 → 8000 → 12000 → 18000 → 24000...)
**Round Limits**: Decrease over time (8 → 7 → 6 → 6 → 5 → 5...)
**Shop Prices**: Scale with level (base price × level multiplier)
**Flop Penalties**: Increase with level (more severe consequences)

### Level Completion

**Success**: Reach threshold within round limit

- Advance to next level
- Receive money reward (base + bonus for rounds remaining)
- Visit shop
- Carry over charms, consumables, and money

**Failure**: Don't reach threshold in time

- Game over (run ends)
- Display final statistics
- Option to start new run

## Shop System

### Shop Structure

```
=== SHOP (Level X) ===
Money: $XXX

CHARMS:
1. Flop Shield (Rare) - $150 - Prevents flops (3 uses)
2. Score Multiplier (Uncommon) - $100 - 1.5x all points
3. Four-of-a-Kind Booster (Rare) - $200 - +500 for 4-of-a-kind
4. Empty slot

CONSUMABLES:
1. Money Doubler (Rare) - $75 - Double money (1 use)
2. Extra Die (Uncommon) - $50 - Add die to hand (1 use)
3. Empty slot

DICE UPGRADES:
1. Crystal Die - $300 - Grows stronger with scoring
2. Wooden Die - $200 - Bonus for straights
3. Empty slot

(s) Select item to buy
(d) Select item to sell
(n) Next level
```

### Pricing Logic

- **Base Prices**: Determined by item rarity
- **Level Scaling**: Prices increase with level (base × level multiplier)
- **Sell Values**: Always 50% of buy price, rounded up
- **Discounts**: Charms can provide shop discounts

### Item Categories

#### Charms (Permanent Bonuses)

- **Flop Shield**: Prevents flops (limited uses)
- **Score Multiplier**: Increases all points
- **Four-of-a-Kind Booster**: Bonus for big combinations
- **Money Magnet**: Increases money rewards
- **Hot Dice Amplifier**: Enhances hot dice effects

#### Consumables (One-time Use)

- **Money Doubler**: Double current money
- **Extra Die**: Add die to hand for one round
- **Material Enchanter**: Upgrade dice materials
- **Flop Recovery**: Recover forfeited points
- **Round Extender**: Add extra round to level

#### Dice Upgrades

- **Crystal Dice**: Grow stronger with scoring
- **Wooden Dice**: Bonus for straights
- **Golden Dice**: High base values
- **Volcano Dice**: Explosive scoring potential
- **Mirror Dice**: Copy other dice values

### Shop Mechanics

#### Buying

- Select item by number
- Confirm purchase if sufficient money
- Item added to inventory
- Money deducted

#### Selling

- Select owned item to sell
- Receive 50% of buy price
- Item removed from inventory
- Money added

#### Inventory Management

- Limited charm slots (increases with level)
- Limited consumable slots (increases with level)
- Dice upgrades replace existing dice

## Boss Levels

### Boss Mechanics (Level 6+)

**Boss Challenges**:

- **Time Pressure**: Reduced round limits
- **Scoring Penalties**: Negative effects on certain combinations
- **Special Rules**: Unique level-specific mechanics
- **Rewards**: Legendary items and large money bonuses

**Boss Types**:

- **The Gambler**: Forces risky plays
- **The Perfectionist**: Requires specific combinations
- **The Speed Demon**: Very short time limits
- **The Collector**: Demands variety in scoring

## Meta-Progression

### Run Statistics

- **Levels Completed**: Highest level reached
- **Total Money Earned**: Across all runs
- **Items Discovered**: Combinations and items found
- **Best Score**: Highest single-level score

### Persistent Upgrades (Future)

- **Starting Money**: Increase base money for new runs
- **Shop Discounts**: Permanent price reductions
- **Extra Slots**: More charm/consumable slots
- **Unlockables**: New dice sets, items, mechanics

## Implementation Requirements

### Game State Updates

```typescript
interface GameState {
  // Level system
  currentLevel: number;
  roundsInLevel: number;
  maxRoundsInLevel: number;
  levelThreshold: number;

  // Shop system
  money: number;
  charms: Charm[];
  consumables: Consumable[];
  charmSlots: number;
  consumableSlots: number;

  // Progression
  levelsCompleted: number;
  totalMoneyEarned: number;
  runStatistics: RunStats;
}
```

### UI/UX Requirements

- **Level Transitions**: Clear progression between levels
- **Shop Interface**: Easy buying/selling with clear pricing
- **Inventory Display**: Show owned items and slots
- **Progress Tracking**: Visual indicators of level progress
- **Statistics**: Run and meta-progression tracking

### Technical Components

- **LevelManager**: Handles level progression and thresholds
- **ShopManager**: Manages shop inventory and transactions
- **InventoryManager**: Handles item storage and slots
- **ProgressionTracker**: Records statistics and meta-progression

## Combination Discovery System

### Balatro-Style Discovery

- Players cannot see certain advanced combinations until they have played them
- **Hidden combinations**: `sevenOfAKind`, `godStraight`, `fourPairs`, `tripleTriplets`
- **Always visible**: `singleFive`, `singleOne`, `threeOfAKind`, `fourOfAKind`, `fiveOfAKind`, `sixOfAKind`, `twoTriplets`, `straight`, `threePairs`

### Implementation Notes

- Add discovery tracking to game state
- Update combinations display command to show discovery status
- Sort combinations by points (lowest to highest)
- Show progress indicator (e.g., "8/13 combinations discovered")
- Use ✅ for discovered, ❓ for undiscovered combinations
- Display "???" for undiscovered combination names and points

### Technical Requirements

- Helper methods: `getAllPossibleCombinationTypes()`, `isCombinationDiscovered()`, `getDiscoveredCombinationsCount()`
- Integration with existing `combinationCounters` in game state
- Update `formatCombinationsDisplay()` in `CLIDisplayFormatter`

## TODOs

### Phase 1: Core Level System

- [ ] Implement level tracking in game state
- [ ] Add level completion/failure logic
- [ ] Create level transition UI
- [ ] Implement basic shop structure

### Phase 2: Shop Implementation

- [ ] Build shop inventory system
- [ ] Implement buying/selling mechanics
- [ ] Add pricing and discount logic
- [ ] Create shop UI/UX

### Phase 3: Advanced Features

- [ ] Add boss level mechanics
- [ ] Implement combination discovery system
- [ ] Create meta-progression tracking
- [ ] Add persistent upgrades

### Phase 4: Polish & Balance

- [ ] Playtest and balance difficulty scaling
- [ ] Fine-tune shop prices and rewards
- [ ] Optimize UI/UX flow
- [ ] Add sound effects and visual polish
