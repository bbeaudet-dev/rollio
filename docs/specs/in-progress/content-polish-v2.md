# Content Polish V2 Specification

## Overview

This specification covers future content additions, reworks, and system improvements that build upon the foundation established in the initial Content Polish specification.

**Note**: This spec was created by extracting the "Other" section from `content-polish.md` and organizing future work items. The original `content-polish.md` now focuses on completed and in-progress work, while this spec focuses on future enhancements.

## Materials / Essences

### Rename "Material" to "Essence" or "Core"

Consider renaming the material system to "Essence" or "Core" for better thematic consistency.

### Add New Essences

#### Angelic (Rerolls/Flops/Banks)

- **Effect**: Reroll/flop/bank related abilities
- **Design**: Orangey/yellow, glowing, halo
- **Alternatives**: Light
- **Considerations**:
  - 25% Flop prevention when in dice set
  - 25% for bank to not decrement banks
  - 25% for reroll to not decrement rerolls
  - Probability manipulation?
  - All of these?

#### Lunar / Moonstone (Polarity/Value-based)

- **Effect**: Scoring bonus if odd/even, single dice or all dice
- **Design**: TBD
- **Considerations**:
  - Changes requirement each level/round
  - Different triggers for scoring bonuses, like combinations played,

**Question**: Is this too many essences? Need to balance variety with complexity.

---

## Charms

### New Charms

- **New charm**: Save 50% of points lost when flopping
- **New charm**: Gain some other bonus that scales with flop penalty

- **New charms for Angelic**: Increase odds, various reroll/flop/bank bonuses
- **New charms for Lunar**: More points, different triggers
   Lunar retriggers effects realted to that die? pip effects, charms
   If this is overpowered, this could be like the blank voucher in Balatro, which then gives you Antimatter / Lunar.

- **Mime**: Retrigger held in hand abilities
- **Hanging Chad**: Retrigger scored dice
- General retrigger charm system

// play some combo in a row, gain mult
// disabling boss battles and stuff

Charm based on consumables used
Charm based on highest combination level

---

## Consumables

### Rename Consideration

- **Rename Consumables to Trinkets?**: Consider renaming for better thematic consistency

### New Consumables (Whims)

- **Selective Material/Essence**: 1 in 4 chance to give a selected die a selected material/essence
- **Point Recovery**: Turns your negative points positive (maximum? percentage of level threshold?)

---

## Levels and Worlds

- Update levels and world effects and bosses
- Make sure everything works
- Ensure proper integration with new content systems

---

## Difficulty / Challenges / Extras / Achievements

### Difficulty System Rework

- Rework/reorganize difficulties?
- We have a d6 now we could use?
- Don't want to flood the game with sooooo many difficulties
- I'd rather there be like 5-7 meaningful difficulties than have 2-3 per die size, i.e. d4,6,8,10,12,20

### Challenges

- This might coincide with dice sets, since if an idea doesn't work perfectly for a dice set, it could always become a Challenge

### Achievements

- Add achievements and tracking (gameState.history)
- Track player progress and milestones
- Unlock rewards based on achievements

---

## Combination / Scoring System

### Base Scoring Algorithms

- Finish setting base scoring algorithms
- Ensure all combinations have appropriate point values
- Balance scoring across different difficulty levels

### Combination Upgrade System

Create combination upgrade system / algorithms (e.g. level 1 straight is X points, 1x multiplier; level 2 is X+100 points and 1.1x multiplier)

**Implementation Notes**:

- Per hand, or maybe categorize like in Cryptid?
- Fits in with hand upgrade pip effect
- The pip effect will upgrade the played combination(s), while the ones that show up in the shop will be grouped

---

## Fully Custom Dice Set Loadout

### Concept

Instead of static dice sets, players have a certain number of "credits" to put towards different things.

**Inspiration**:

- Faster Than Light loadout system
- Gummi ships in Kingdom Hearts
- Fallout character creation (8 qualities/characteristics/stats with limited credits)
- Castle Crashers level-up system (add points to different combinations on level up, can reallocate?)

### Mechanics

**Starting Configuration**:

- Start with 6 standard plastic dice and 20 credits
- Adding an extra die: 5 credits (and then maybe 10 for another one?)
- Adding an essence: 3 credits (probably same cost for all essences?)
- Buying charms: 5-15 credits
- Buying consumables, blessings: Variable
- Pip effects: 1 credit each

**Difficulty Scaling**:

- Different difficulties change starting credits / available upgrades
- Any credits they don't spend lend to their starting money

**Considerations**:

- Could use more dice sets, but not sure how to balance
- Different Essences would make for the coolest looking sets, but might be overpowered
- Balatro has no decks focused on enhancements/seals, only values, discards, hands, scoring, starting items/blessings, special abilities like double Tags
- **Key Question**: Can players expect to be able to just "buy" materials/essences throughout the game, or is this a one-time loadout customization? The credits = money paradigm might be confusing then

**Design Goal**:

- Just think about the EXCITEMENT you have about choosing your FTL loadout, and unlocking new ones. I want to emulate this same excitement

---

## Combination Upgrade Consumables

These consumables will upgrade combinations in groups, allowing players to enhance their scoring potential. These are planned for future implementation.

### Consumable Ideas

1. **Upgrade All Singles**

   - Upgrades single1, single5, and any other single-value combinations
   - Effect: Increases point values or adds multipliers to single dice scoring

2. **Upgrade Beginner Combinations**

   - Upgrades pair, two pair, and other beginner-level combinations
   - Effect: Enhances scoring for basic combination types

3. **Upgrade Intermediate Combinations**

   - Upgrades 3 of a kind, small straight, and other intermediate combinations
   - Effect: Boosts scoring for mid-tier combination types

4. **Upgrade Advanced Combinations**
   - Upgrades large straight, pyramid, and other advanced combinations
   - Effect: Amplifies scoring for high-tier combination types

### Implementation Notes

- These consumables will integrate with the future combination upgrade system
- The upgrade system will track which combinations have been upgraded
- Upgrades may affect point values, multipliers, or other scoring mechanics
- These consumables can be used during the dice set customization phase (1 credit each) or found/used during gameplay

---

## Implementation Priorities

1. **High Priority**:

   - Finish base scoring algorithms
   - Fully custom dice set loadout system
   - Combination upgrade system

2. **Medium Priority**:

   - Rework/update existing charms
   - Add new consumables

3. **Low Priority / Future**:
   - Add new essences (Angelic, Lunar)
   - Update levels and world effects
   - Pip effects system
   - Rename considerations (Material → Essence, Consumables → Trinkets)
   - Add achievements and tracking





OTHER

- Better world/level display, fix level effects
- Animation for exponent to apply to multiplier, then multiplier to apply to score
- Cumulative hot dice charm


Weird bugs, singles pairs not working after volcano, value adjustment, matieral copying, flower dice, etc.
Oh and two faced probably is the culprit

Tiers of materials!!!
- Magma is tier 1, gives +100 PTS for each hot dice counter, stacks with multiple magma dice
- Volcano is tier 2, gives +0.5 MLT for each hot dice counter, stacks with multiple volcano dice
- New consumable upgrades tier 1 to tier 2
- Current consumable for random material is limited to tier 1 materials (maybe small chance for tier 2?)
- Maybe we could make Golden tier 1 and rainbow tier 2, so golden gives $ when scoring, and then Rainbow would give that same money (or more) when scoring PLUS have a chance for the effects
- Lead:
- Ghost: tier 1 same, 
- Flower: counter is based on round, then level, then world, then game
- Crystal: 
- Mirror: 