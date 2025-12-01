# Rollio CLI API Documentation

> **Note:** To update the game name everywhere (docs, code, UI), use the update-name script: `npm run update-name -- <NewName>`. All name variants are defined in `src/game/nameConfig.ts`.

## Overview

This document provides detailed information about the Rollio CLI game's API, including types, functions, and configuration options for developers who want to extend or modify the codebase.

## Core Types

### Game State Types

```typescript
interface GameState {
  roundNumber: number; // Current round number
  gameScore: number; // Total banked points
  forfeitedPointsTotal: number; // Total points lost to flops
  rollCount: number; // Cumulative rolls across game
  hotDiceTotal: number; // Total hot dice occurrences
  consecutiveFlopCount: number; // Current consecutive flop streak
  roundState: RoundState | null; // Current round state
  isActive: boolean; // Whether game is running
  endReason?: GameEndReason; // How game ended
}

interface RoundState {
  roundNumber: number; // Round number
  hand: DieValue[]; // Current dice to roll
  roundPoints: number; // Points accumulated this round
  rollHistory: RollState[]; // History of rolls in this round
  hotDiceCount: number; // Hot dice count this round
  forfeitedPoints: number; // Points forfeited if flop
  isActive: boolean; // Whether round is active
  endReason?: RoundEndReason; // How round ended
}

interface RollState {
  rollNumber: number; // Roll number within round
  dice: DieValue[]; // Dice values rolled
  maxRollPoints: number; // Maximum possible points
  rollPoints: number; // Points actually scored
  scoringSelection: number[]; // Indices of scored dice
  combinations: ScoringCombination[]; // Scoring combinations used
  isHotDice: boolean; // Whether this was hot dice
  isFlop: boolean; // Whether this was a flop
}
```

### Scoring Types

```typescript
enum ScoringCombinationType {
  SingleOne = "single_one",
  SingleFive = "single_five",
  ThreeOfAKind = "three_of_a_kind",
  FourOfAKind = "four_of_a_kind",
  FiveOfAKind = "five_of_a_kind",
  SixOfAKind = "six_of_a_kind",
  Straight = "straight",
  ThreePairs = "three_pairs",
  TwoTriplets = "two_triplets",
}

interface ScoringCombination {
  type: ScoringCombinationType;
  dice: DieValue[];
  points: number;
}

type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
```

## Configuration API

### ROLLIO_CONFIG

The main configuration object that controls all game parameters:

```typescript
export const ROLLIO_CONFIG = {
  winCondition: 10000, // Points needed to win

  cli: {
    defaultDelay: 150, // Default message delay (ms)
    messageDelay: 300, // Important message delay (ms)
    noDelay: 0, // No delay option
  },

  display: {
    showCombinations: true, // Show scoring combinations
    showRoundPoints: true, // Show round point totals
    showGameScore: true, // Show game score updates
  },

  penalties: {
    threeFlopPenalty: 1000, // Points lost after 3 flops
    consecutiveFlopWarning: 2, // Warning after N flops
  },

  // Scoring is now handled dynamically in scoring.ts
  // See getCombinationPoints() function for current scoring rules
};
```

## Core Functions

### Scoring Engine (`src/scoring.ts`)

```typescript
// Roll dice and return DieValue array
function rollDice(numDice: number): DieValue[];

// Count occurrences of each die face
function countDice(dice: number[]): number[];

// Find all possible scoring combinations
function getScoringCombinations(dice: number[]): ScoringCombination[];

// Validate user's dice selection
function isValidScoringSelection(
  selectedIndices: number[],
  dice: DieValue[]
): { valid: boolean; points: number; combinations: ScoringCombination[] };
```

### State Management (`src/gameState.ts`)

```typescript
// Create initial game state
function createInitialGameState(): GameState;

// Create initial round state
function createInitialRoundState(roundNumber: number): RoundState;
```

### Utility Functions (`src/utils.ts`)

```typescript
// Center text within specified width
function center(str: string, width: number): string;

// Format dice values for display
function formatDiceValues(dice: DieValue[]): string;

// Format scoring combinations for display
function formatCombinations(combinations: ScoringCombination[]): string;

// Format flop message with penalty info
function formatFlopMessage(
  forfeitedPoints: number,
  consecutiveFlops: number,
  gameScore: number,
  threeFlopPenalty: number
): string;

// Format game statistics
function formatGameStats(stats: {
  roundsPlayed: number;
  totalRolls: number;
  hotDiceCount: number;
  forfeitedPoints: number;
  gameScore: number;
}): string[];

// Validate user input for dice selection
// Accepts dice values (e.g., "125" for dice showing 1, 2, 5)
function validateDiceSelection(input: string, dice: DieValue[]): number[];
```

## CLI Functions (`src/cli.ts`)

### Main Game Functions

```typescript
// Display current roll with formatted dice
async function displayRoll(rollNumber: number, dice: DieValue[]): Promise<void>;

// Handle flop detection and messaging
async function handleFlop(
  gameState: GameState,
  roundState: RoundState
): Promise<boolean>;

// Handle dice scoring selection and validation
async function handleDiceScoring(dice: DieValue[]): Promise<{
  selectedIndices: number[];
  scoringResult: {
    valid: boolean;
    points: number;
    combinations: ScoringCombination[];
  };
}>;

// Handle round end (banking or continuing)
async function handleRoundEnd(
  gameState: GameState,
  roundState: RoundState,
  dice: DieValue[],
  selectedIndices: number[],
  currentRollPoints: number
): Promise<boolean>;

// Display game end statistics
async function displayGameEnd(
  gameState: GameState,
  isWin: boolean
): Promise<void>;

// Main game loop for a single round
async function playRound(gameState: GameState): Promise<void>;

// Main game function
async function main(): Promise<void>;
```

### Utility Functions

```typescript
// Ask user for input
function ask(question: string): Promise<string>;

// Sleep for specified milliseconds
function sleep(ms: number): Promise<void>;

// Log message with configurable delays
async function logWithDelay(
  message: string,
  delayBefore: number = ROLLIO_CONFIG.cli.defaultDelay,
  delayAfter: number = ROLLIO_CONFIG.cli.defaultDelay
): Promise<void>;
```

## Extending the Game

### Adding New Scoring Rules

1. **Update Scoring Types**:

   ```typescript
   // In scoring.ts
   export type ScoringCombinationType = "existingType" | "newRule";
   ```

2. **Add Base Points** (if not face-value dependent):

   ```typescript
   // In scoring.ts
   const BASE_POINTS = {
     // ... existing rules
     newRule: 500, // Add new scoring value
   } as const;
   ```

3. **Update Scoring Logic**:

   ```typescript
   // In scoring.ts
   function getScoringCombinations(diceHand: Die[], selectedIndices: number[], context: ScoringContext): ScoringCombination[] {
     // ... existing logic
     // Add detection for new rule
     if (/* new rule condition */) {
       combinations.push({
         type: 'newRule',
         dice: selectedIndices,
         points: getCombinationPoints('newRule'),
       });
     }
   }
   ```

4. **Update Detection Logic**:
   ```typescript
   // In scoring.ts
   export function hasAnyScoringCombination(diceHand: Die[]): boolean {
     // ... existing logic
     // Add detection for new rule
     if (/* new rule condition */) return true;
   }
   ```

### Adding New Game Features

1. **Update State Types**: Add new properties to `GameState`, `RoundState`, or `RollState`
2. **Update Configuration**: Add new config options to `ROLLIO_CONFIG`
3. **Update Game Logic**: Modify functions in `cli.ts` to handle new features
4. **Update Display**: Add new formatting functions in `utils.ts` if needed

### Customizing Display

1. **Modify Delays**: Adjust `cli.defaultDelay` and `cli.messageDelay`
2. **Toggle Features**: Use `display.showCombinations`, `display.showRoundPoints`, etc.
3. **Custom Formatting**: Create new utility functions in `utils.ts`

## Error Handling

The game includes robust error handling for:

- Invalid user input
- Invalid dice selections
- State inconsistencies
- Configuration errors

All functions are designed to fail gracefully and provide clear error messages.

## Performance Considerations

- **State Management**: Efficient state updates with minimal object copying
- **Scoring Engine**: Optimized combination detection algorithms
- **Memory Usage**: Minimal memory footprint with efficient data structures
- **User Experience**: Configurable delays for optimal readability

## Testing

The codebase is designed for easy testing:

- Pure functions for scoring and validation
- Clear separation of concerns
- Configurable behavior
- Type safety for catching errors

## Contributing

When contributing to the codebase:

1. Maintain type safety
2. Follow existing patterns
3. Update documentation
4. Test thoroughly
5. Consider configuration options for new features
