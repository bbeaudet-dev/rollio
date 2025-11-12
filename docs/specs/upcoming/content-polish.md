# Content Polish Specification

## Overview

This specification covers polishing existing content (dice sets, materials, charms, blessings, consumables) and adding new items to create a complete set for testing.

## Current Content Status

**Charms**: 16 defined, 16 implemented ✅

- All charms are registered and implemented

**Consumables**: 9 defined, 9 implemented ✅

- All consumables have effects implemented

**Materials**: 7 defined, 6 fully implemented, 1 WIP

- ✅ Plastic, Crystal, Wooden, Golden, Volcano, Rainbow
- ⚠️ Mirror (WIP - placeholder implementation)

**New Material Ideas** (see Material Ideas section below):

- Ghost Die (hot dice mechanic)
- Ethereal/Void/Phasing (reroll-focused, material-based)
- Emerald (growth/prosperity themed)
- Moonstone (duality-based, needs power boost)

**Blessings**: All defined, implementation status needs verification

- All blessing effect types should be implemented in game logic

**Dice Sets**: 3 defined

- Beginner Set, High Roller Set, Low Baller Set
- Need more variety for testing

## Requirements

### Functional Requirements

- Complete Mirror material implementation (see Material Ideas section)
- Implement Ghost Die material (hot dice mechanic)
- Implement Ethereal/Void material (reroll-focused, material-based)
- Implement Emerald material (growth/prosperity themed)
- Improve Moonstone material (duality-based, needs power boost)
- Consider Steel/Lead/Obsidian materials (heavy, defensive mechanic)
- Balance Crystal material (may be overpowered)
- Verify all blessing effects are implemented
- Add more dice sets (at least 5-6 total)
- Balance existing charms/consumables
- Add new charms/consumables to reach ~20 charms, ~12 consumables
- Ensure all materials have clear, balanced effects

### Non-Functional Requirements

- **Balance**: All content should be balanced and fun
- **Variety**: Enough content for diverse gameplay
- **Clarity**: Clear descriptions and effects
- **Consistency**: Follow existing patterns and structures

## User Stories

**As a player**, I want:

- Variety in dice sets to choose from
- Interesting and balanced charms/consumables
- All materials to have meaningful effects
- A complete set of content to explore

**As a developer**, I want:

- Easy to add new content
- Clear patterns for content creation
- Balanced content for testing
- Complete content set

## Data Structures

**New Dice Sets**:

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

**New Charms/Consumables**:

- Follow existing structure
- Ensure proper rarity distribution
- Balance effects

## API / Function Signatures

**New Content Functions**:

- `createDiceSet()` - Factory for new dice sets
- `createCharm()` - Factory for new charms
- `createConsumable()` - Factory for new consumables

## Edge Cases & Error Handling

- **Balance Issues**: Test all new content for balance
- **Missing Implementations**: Ensure all defined content has implementations
- **Edge Cases**: Test unusual combinations of items

## Out of Scope

- Major content redesign
- New content types (focus on existing types)
- Content unlock system (separate spec)

## Open Questions

1. How many dice sets do we want? (Suggested: 5-6)
2. How many new charms/consumables? (Suggested: 4-5 charms, 3-4 consumables)
3. Should we add more materials? (Suggested: No, polish existing ones)
4. What's the balance target for charms/consumables? (Need to define)
5. What difficulty levels should dice sets have? (Related to setup spec)

## Implementation Phases

### Phase 1: Content Audit

**Goal**: Identify what needs polish/implementation

**Deliverables**:

- Status report of all content
- List of missing implementations
- List of items needing balance
- List of new items to add

**Tasks**:

1. Verify all charms are implemented correctly
2. Verify all consumables are implemented correctly
3. Check material implementations (especially Mirror)
4. Verify blessing effects are implemented
5. Review dice sets for variety
6. Identify gaps in content

**Integration Testing**:

- Test each charm individually
- Test each consumable individually
- Test each material effect
- Test blessing effects

### Phase 2: Content Implementation

**Goal**: Complete missing implementations and add new content

**Deliverables**:

- Complete Mirror material implementation
- Verify all blessing effects work
- New dice sets (2-3 more)
- New charms (4-5)
- New consumables (3-4)
- Balanced existing content

**Tasks**:

1. Implement Mirror material properly
2. Verify blessing effects in game logic
3. Create new dice sets
4. Create new charms with implementations
5. Create new consumables with implementations
6. Balance existing content

**Integration Testing**:

- Test Mirror material
- Test all blessing effects
- Test new dice sets
- Test new charms/consumables
- Balance testing

### Phase 3: Content Polish

**Goal**: Polish all content for testing

**Deliverables**:

- Balanced content
- Clear descriptions
- Proper rarity distribution
- Complete content set

**Tasks**:

1. Balance all charms/consumables
2. Review descriptions for clarity
3. Ensure proper rarity distribution
4. Final testing of all content

**Integration Testing**:

- Full game playthrough with all content
- Balance testing
- Edge case testing

## Material Ideas & Notes

### Mirror Die (from materials.ts notes)

**Current Status**: WIP - placeholder implementation

**Design Ideas**:

- All mirror dice in hand copy the value of a random die in hand
- If all dice are mirror dice, pick a random value
- If a mirror die copies another mirror die, move to a new die (don't recursively copy)
- Implementation challenge: Need to handle mirror dice during combination checking

**Effect**: Acts as a Wild die that can be any value when scored

### Ghost Die (New Idea)

**Concept**: Ghost dice don't need to be scored to trigger hot dice

**Effect**: "Triggers hot dice counter if only ghost dice (or no dice) remain in hand after scoring"

**Mechanic Details**:

- When scoring dice, if after removing scored dice, only ghost dice (or no dice) remain, trigger hot dice
- Example: Roll 5556 (6 is ghost), score 555 → only ghost die remains → hot dice triggered
- This creates interesting strategic decisions: do you score everything including ghosts, or leave ghosts for hot dice?

**Theme**: Ethereal, doesn't count as "real" dice for hot dice purposes

**Color**: Pale white/transparent with slight blue tint

### Ethereal/Void/Phasing Materials (Reroll-Focused)

**Concept**: Material-based dice that "leave something behind" when scored - a substance that allows you to change the substance of something else

**Design Ideas**:

1. **Ethereal**:

   - When scored, grants +1 reroll for the next round (stacks)
   - Leaves behind "ethereal essence" that persists
   - Theme: Light, airy, magical

2. **Void**:

   - When scored, "consumes" one remaining die from hand, granting its rolled value as bonus points
   - Theme: Dark, consuming, transformative
   - Creates interesting risk/reward: do you score void early to consume a low die, or wait?

3. **Phasing**:

   - When scored, transforms one remaining die into a random material (or specific material)
   - Theme: Phase-shifting, transformation
   - Could be too random, might need refinement

4. **Mist**:

   - When scored, creates a temporary "mist die" that acts as a wild for one roll
   - Theme: Ephemeral, temporary
   - Implementation: Add temporary die to hand that disappears after next roll

5. **Spectral**:
   - When scored, grants ability to reroll one specific die next round (not all dice)
   - Theme: Ghostly, selective
   - More controlled than full reroll

**Recommended**: Start with **Ethereal** (simplest, clearest effect) or **Void** (most interesting strategic depth)

### Emerald (Growth/Prosperity Themed)

**Emerald Qualities** (thematic research):

- Associated with growth, renewal, prosperity
- Healing properties (could relate to lives)
- Wisdom and foresight (could relate to preview/planning)
- Protection (could relate to flop prevention)
- Spring/growth (could relate to round progression)
- Wealth and abundance (could relate to money)

**Design Ideas**:

1. **Growth Over Time**:

   - +25 points per emerald die × current round number
   - Rewards longer rounds, synergizes with round multiplier charm
   - Theme: Growth accumulates over time

2. **Prosperity Bonus**:

   - +$3 per emerald die scored, +$15 bonus if you have $25+ when banking
   - Theme: Wealth accumulation
   - Synergy: Works with moneyMagnet charm

3. **Renewal/Healing**:

   - +1 life per emerald die scored (max 1 per round)
   - Theme: Healing properties
   - Synergy: Defensive playstyle

4. **Protection**:

   - When scored, reduces consecutive flops counter by 1 (min 0)
   - Theme: Protection from bad luck
   - Synergy: Works with flop shield charm

5. **Wisdom/Foresight**:
   - When scored, reveals the next roll's values (preview)
   - Theme: Foresight
   - Implementation: Complex, might be too powerful

**Recommended**: **Growth Over Time** (clear, thematic, interesting) or **Prosperity Bonus** (fits leprechaun theme)

### Moonstone (Duality-Based, Needs Power Boost)

**Current Idea**: +30 points per moonstone die if all scored dice are even, +30 if all are odd

**Problem**: Feels underpowered, too restrictive

**Duality Concepts**:

- Day/night, light/dark, even/odd, waxing/waning
- Could scale with round number (waxing = growing power)
- Could have different effects based on condition

**Improved Design Ideas**:

1. **Waxing/Waning Power**:

   - +50 points per moonstone die × (round number % 2) - waxing rounds get bonus
   - Alternates power each round
   - Theme: Lunar phases

2. **Duality Bonus**:

   - +40 points per moonstone die if all scored dice are even OR all are odd
   - +80 points per moonstone die if scored dice are perfectly mixed (equal evens and odds)
   - Theme: Balance between opposites
   - More interesting strategic choice

3. **Phase Shift**:

   - +60 points per moonstone die if all scored dice are even
   - +60 points per moonstone die if all scored dice are odd
   - +100 points per moonstone die if scored dice are perfectly balanced (equal evens/odds)
   - Theme: Power in both extremes and balance

4. **Lunar Cycle**:
   - +25 points per moonstone die × (round number % 4) - cycles through 0, 1, 2, 3 multiplier
   - Theme: Full lunar cycle
   - Predictable pattern

**Recommended**: **Duality Bonus** (most interesting, rewards both extremes and balance)

### Other Material Notes (from materials.ts)

**Steel/Lead/Obsidian** (Heavy Materials):

- Stays in hand after scoring (doesn't get removed)
- Trade-off: Nullifies hot dice, but impossible to flop
- Opposite of volcano (volcano wants hot dice, heavy materials prevent it)
- Interesting defensive mechanic

**Crystal**:

- Current: 1.5x per crystal already scored this round
- Note: Might be broken, consider decreasing multiplier
- Theme: Resonance, bouncing soundwaves/light beams

**Golden**:

- Current description might be incorrect
- Money dice is "kinda boring but we should probably keep it"
- Especially important for leprechaun/gold theme
- Could move money effect to emerald/copper/cauldron

## References

- [Web Refactor Spec](./in-progress/web-app-refactor.md)
- [Enhanced Rules Spec](./completed/enhanced-rules.md)
- [Material System Spec](./completed/material-system-spec.md)
- [Materials.ts Notes](../../../src/game/data/materials.ts)

## Game System Changes

### Banks vs Lives System (Proposed)

**Current Problem**: Players can get infinite points by never flopping. There's no real constraint on how many rounds they can play.

**Proposed Solution**: Replace the Lives system with a limited number of Banks.

**Design**:

- Instead of having 3 lives that get decremented on flops, players have a limited number of banks (e.g., 3-5 banks per level)
- Each time a player banks points, they consume one bank
- This incentivizes players to go for higher scoring per bank (since banks are limited)
- Higher scoring attempts = more risk of flops
- Players can't just play forever to get the "perfect hand" - they're constrained by needing to score enough points per bank

**Flop Penalty Changes**:

- Instead of "3 flops in a row = -1000 points", change to "3 flops in a row = game over"
- This creates a strategic tension:
  - Players can use flops strategically to extend their chances at getting a good hand
  - But they can't flop forever - only 2 flops before game over
  - Forces players to balance risk vs reward

**Benefits**:

- Creates meaningful constraints on gameplay
- Incentivizes higher-risk, higher-reward play
- Makes flops more strategic (you can flop once or twice to try for better hands, but not infinitely)
- Prevents infinite point accumulation
- Makes each bank decision more meaningful

**Implementation Considerations**:

- Need to track banks remaining per level
- Need to update UI to show banks instead of lives
- Need to update game over conditions
- Need to update level completion logic
- May need to adjust level thresholds if banks are limited
- Need to update shop/rewards if lives are removed

**Open Questions**:

- How many banks per level? (Suggested: 3-5, maybe varies by difficulty)
- Should banks reset each level or carry over?
- Should there be ways to earn extra banks (charms, consumables)?
- How does this interact with existing charms/consumables that affect lives?

### OTHER

Add small straight / Big straight / god straight
Two pair?
Single pair
Pyramid 444 55 6
Big pyramid
(can you write algorithm that checks for X length straight, x pairs, x triplets, x quadruplets, x Y-lets, pyramid)
Full house
