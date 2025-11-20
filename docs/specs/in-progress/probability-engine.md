# Probability Engine Specification

## Overview

A comprehensive probability calculation system for analyzing scoring combinations and balancing the game. The engine uses inclusive (non-exclusive) counting, meaning a roll can count for multiple combinations simultaneously (e.g., `123456` counts as `straightOfFour`, `straightOfFive`, and `straightOfSix`, as well as a single5, single1, etc.

**Note on Inclusive Counting**: When calculating probabilities, we count each roll in every category it satisfies. For example, a roll of `123456` counts for:

- `straightOfFour` (sequences 1-4, 2-5, 3-6)
- `straightOfFive` (sequences 1-5, 2-6)
- `straightOfSix` (sequence 1-6)
- `singleOne` (the 1)
- `singleFive` (the 5)

## Phase 1: Static 6 Dice Calculations ✅

**Goal**: Accurately calculate combination probabilities for a static 6 dice configuration.

**Implementation**:

- Calculate probabilities for all combinations with 6 dice, 6 sides
- Use inclusion-exclusion principle for inclusive counting
- Return probabilities as both decimal and percentage
- Mark combinations as possible/impossible based on dice count

**Status**: Basic implementation complete. Handles common combinations (pairs, straights, N-of-a-kind, etc.) with hardcoded values from probability calculations.

**Sample Code**:

```typescript
import {
  calculateAllProbabilities,
  getCombinationProbability,
} from "./game/logic/probability";

// Calculate all probabilities for 6 dice
const config = { numDice: 6, numSides: 6 };
const probabilities = calculateAllProbabilities(config);

// Get specific combination probability
const pairProb = getCombinationProbability("nPairs", config);
console.log(`One Pair: ${pairProb.percentage.toFixed(2)}%`);
```

## Phase 2: Parametrize Number of Dice 🔄

**Goal**: Dynamically calculate probabilities for any number of dice (6, 8, 10, 20, etc.).

**Implementation**:

- Accept `numDice` as a parameter in `ProbabilityConfig`
- Update probability calculations to work with variable dice counts
- Show how probabilities change as dice count increases
- For example: `straightOfSix` becomes more likely with 8 dice vs 6 dice

**Status**: Not started. Will require refactoring probability calculations to be dynamic rather than hardcoded.

**Use Cases**:

- Balance analysis: "How does adding 2 dice affect straight probabilities?"
- Dice set comparison: "Hoarder set (8 dice) vs Basic set (6 dice)"
- Extreme scenarios: "What's possible with 20 dice?"

## Phase 3: Dynamic Combination Detection 🔄

**Goal**: Automatically detect which combinations are possible based on dice count, and only show those.

**Implementation Options**:

1. Show all combinations, but mark impossible ones as 0.0% probability
2. Filter to only show possible combinations for current dice count

**Example**: With 6 dice, `fourPairs` is impossible (requires 8 dice). With 8 dice, `fourPairs` becomes possible and should appear in the probability list.

**Status**: Not started. Requires:

- Dynamic detection of possible combinations based on dice count
- Algorithm-based probability calculations for N-of-a-kind, N-pairs, etc.
- UI considerations for displaying filtered vs. all combinations

**Use Cases**:

- Real-time probability updates as player gains/loses dice
- Tutorial explanations: "You need 8 dice to score four pairs"
- Balancing tool: "At what dice count does X combination become viable?"

## Phase 4: UI Calculator Tool 📋

**Goal**: Create a "Calculator" option in the main menu for players to experiment with probabilities.

**Features**:

- Slider/input to change number of dice
- Display probability table with all combinations
- Visual indicators for impossible combinations
- Export/import probability configurations
- Comparison mode: side-by-side probability tables

**Status**: Not started. Depends on Phases 1-3.

**Inspiration**: Similar to Balatro calculator tools that help players understand hand probabilities.

## Phase 5: Custom Dice Sides/Values 📋

**Goal**: Calculate probabilities for custom dice configurations (e.g., Low Baller set with values 1-3 only).

**Implementation**:

- Accept `allowedValues` array in `ProbabilityConfig`
- Recalculate probabilities based on available face values
- Handle edge cases: straights impossible if values don't allow it
- Example: Low Baller set `[1,2,3]` makes straights of 4+ impossible

**Status**: Not started. Advanced feature requiring:

- Dynamic probability calculations for custom value sets
- Validation: "This combination is impossible with these dice values"
- UI for selecting/editing dice value sets

**Use Cases**:

- Dice set design: "What are the probabilities for my custom dice set?"
- Challenge mode: "Calculate probabilities for a restricted value set"
- Educational: "How do probabilities change when you remove certain values?"

## Phase 6: Full Scoring Breakdown Calculator 📋

**Goal**: Complete scoring calculator that factors in charms, materials, pip effects, blessings, etc.

**Features**:

- Input: dice hand, charms, materials, pip effects, blessings
- Output: Complete scoring breakdown with all modifiers
- Show: base points, charm bonuses, material multipliers, pip effects, final score
- Comparison: "With vs. without this charm"
- Optimization: "Best scoring combination for this hand"

**Status**: Not started. Depends on:

- Complete scoring system implementation
- All charm/material/pip effects finalized
- Scoring calculation engine maturity

**Inspiration**: [Balatro Calculator](https://efhiii.github.io/balatro-calculator/) - comprehensive tool for calculating any hand with all modifiers.

**Use Cases**:

- Strategy planning: "Should I buy this charm?"
- Build optimization: "What's my maximum possible score?"
- Educational: "How do all these systems interact?"

## Implementation Notes

**File Structure**:

- `src/game/logic/probability.ts` - Core probability calculation engine
- `src/web/ui/calculator/` - UI components for calculator tool (Phase 4+)

**Key Functions**:

- `calculateAllProbabilities(config)` - Get all combination probabilities
- `getCombinationProbability(type, config)` - Get specific combination probability
- `isCombinationPossible(type, numDice)` - Check if combination is possible

**Current Limitations**:

- Phase 1 only handles 6 dice, 6 sides
- Algorithm-based combinations (nOfAKind, nPairs, etc.) return 0 for now
- No UI integration yet

**Future Enhancements**:

- Monte Carlo simulation for complex combinations
- Caching for performance
- Export probability tables to CSV/JSON
- Integration with game state for real-time probability display
