# Debug Mode System Specification

## Overview

A comprehensive debug system that provides granular visibility into every game action, state change, and system interaction. Designed to be completely optional and configurable without code changes.

## Goals

- **Full Visibility**: Log every significant action the game performs
- **Zero Performance Impact**: When disabled, no overhead
- **Granular Control**: Enable/disable specific categories of logging
- **Developer Friendly**: Easy to configure and use during development
- **Non-Intrusive**: Separate from game display and CLI messages

## Configuration System

### Config File: `debug.config.json`

```json
{
  "debug": true, // Master toggle
  "verbose": false, // Extra detailed logging
  "logActions": {
    "gameFlow": true, // Game lifecycle events
    "scoring": true, // Dice selection and point calculation
    "diceRolls": true, // Roll results and flop detection
    "charmActivation": true, // Charm triggers and effects
    "consumableUsage": true, // Consumable item usage
    "materialEffects": true, // Dice material bonuses
    "roundTransitions": true, // Round start/end, banking, rerolling
    "stateChanges": true // Game state modifications
  },
  "performance": {
    "enableTiming": false, // Track operation timing
    "logSlowOperations": true, // Highlight slow operations only
    "slowThresholdMs": 10 // What counts as "slow" (milliseconds)
  }
}
```

## Logging Categories

### 1. Game Flow (`gameFlow`)

High-level game lifecycle events:

- Game engine initialization
- Mode selection (new game, tutorial, cheat mode)
- Game setup completion
- Win/lose conditions
- Game termination

**Example Output:**

```
[ACTION 14:32:15] GameEngine initialized {"debugMode":true}
[ACTION 14:32:15] Game mode selected: new
[ACTION 14:32:15] Game setup completed {"diceSetName":"Basic Set","charmsCount":2}
[ACTION 14:32:15] Player reached win condition {"finalScore":10500,"winCondition":10000}
```

### 2. Scoring (`scoring`)

Dice selection validation and point calculation:

- Dice selection input validation
- Combination detection and scoring
- Partitioning options available
- Final score calculation

**Example Output:**

```
[ACTION 14:32:15] Validating dice selection: 1,2,3 {"diceValues":[1,2,3,4,5,6],"charmsActive":2}
[ACTION 14:32:15] Scoring result: valid {"points":300,"combinations":[{"type":"threeOfAKind","points":300}]}
[ACTION 14:32:15] Processing dice scoring {"originalDice":6,"scoredDice":3,"points":300}
```

### 3. Dice Rolls (`diceRolls`)

Roll outcomes and dice state:

- Roll results
- Flop detection
- Dice remaining after scoring
- Hot dice events

**Example Output:**

```
[ACTION 14:32:15] Flop check: FLOP {"diceValues":[2,3,4,6]}
[ACTION 14:32:15] Flop check: scoring available {"diceValues":[1,2,3,4,5,6]}
[ACTION 14:32:15] HOT DICE! All dice scored {"remainingDice":0}
[ACTION 14:32:15] Dice remaining after scoring {"remainingDice":3}
```

### 4. Charm Activation (`charmActivation`)

Charm system interactions:

- Charm trigger conditions met
- Charm effects applied
- Usage counters updated
- Charm-specific bonuses

**Example Output:**

```
[ACTION 14:32:15] Charm activated: Flop Shield {"usesRemaining":2}
[ACTION 14:32:15] Score Multiplier applied {"multiplier":1.5,"originalScore":300,"newScore":450}
[ACTION 14:32:15] Four-of-a-Kind Booster triggered {"bonus":500,"totalScore":800}
```

### 5. Consumable Usage (`consumableUsage`)

Consumable item interactions:

- Consumable selection and usage
- Effect application
- Context (in-round vs between-rounds)
- Inventory updates

**Example Output:**

```
[ACTION 14:32:15] Using consumable: Extra Die {"consumableIndex":0,"roundContext":"in-round"}
[ACTION 14:32:15] Consumable effect applied: Extra Die
[ACTION 14:32:15] Using consumable: Money Doubler {"consumableIndex":1,"roundContext":"between-rounds"}
```

### 6. Material Effects (`materialEffects`)

Dice material bonuses and calculations:

- Material effect detection
- Score modifications from materials
- Material-specific bonuses
- Cumulative effects

**Example Output:**

```
[ACTION 14:32:15] Applying material effects {"baseScore":300,"selectedDice":3,"materials":["crystal","wooden","plastic"]}
[ACTION 14:32:15] crystal effect activated {"scoreChange":150,"newScore":450}
[ACTION 14:32:15] wooden effect activated {"multiplier":1.25,"scoreChange":112,"newScore":562}
```

### 7. Round Transitions (`roundTransitions`)

Round flow and state changes:

- Round start/end
- Banking decisions
- Reroll choices
- Round progression

**Example Output:**

```
[ACTION 14:32:15] Round 3 starting {"currentScore":2500,"roundsPlayed":2}
[ACTION 14:32:15] Round confirmed, starting play
[ACTION 14:32:15] Player chose to bank {"roundPoints":750,"newGameScore":3250}
[ACTION 14:32:15] Player chose to reroll {"remainingDice":3}
```

### 8. State Changes (`stateChanges`)

Game state modifications:

- Score updates
- Counter increments
- Configuration changes
- State transitions

**Example Output:**

```
[STATE 14:32:15] Game score updated {"from":2500,"to":3250}
[STATE 14:32:15] Hot dice counter incremented {"from":0,"to":1}
[STATE 14:32:15] Round points accumulated {"from":300,"to":750}
```

## Performance Monitoring

### Timing System

- Track operation duration
- Identify performance bottlenecks
- Configurable slow operation threshold
- Optional timing for all operations

**Example Output:**

```
[DEBUG 14:32:15] ⏱️ Dice scoring calculation: 2.34ms
[DEBUG 14:32:15] ⚠️ SLOW: Material effects calculation: 15.67ms
[DEBUG 14:32:15] ⏱️ Combination detection: 1.12ms
```

## Technical Implementation

### Core Functions

```typescript
// Action logging with category filtering
debugAction(category: 'gameFlow' | 'scoring' | ..., action: string, details?: any)

// Verbose internal operations
debugVerbose(message: string, ...args: any[])

// State change tracking
debugStateChange(description: string, oldState: any, newState: any)

// Performance timing
debugTime(label: string)
debugTimeEnd(label: string)
```

### Configuration Management

- Hot-reloadable configuration
- Multiple file path resolution
- Graceful fallback to defaults
- Runtime configuration queries

### Integration Points

- Game Engine: Core game flow
- Scoring System: Point calculations
- Material System: Effect applications
- Charm System: Activation and effects
- Consumable System: Usage and effects
- Round Manager: Round transitions
- Roll Manager: Dice operations

## Usage Scenarios

### 1. Basic Game Flow Debugging

Enable only `gameFlow` and `roundTransitions` to follow high-level game progression.

### 2. Scoring Issue Investigation

Enable `scoring`, `materialEffects`, and `charmActivation` to debug point calculation problems.

### 3. Performance Analysis

Enable timing with low threshold to identify slow operations.

### 4. Full System Visibility

Enable all categories with verbose mode for complete insight into game behavior.

## Benefits

### For Development

- **Rapid Issue Identification**: See exactly what the game is doing
- **State Tracking**: Monitor how game state changes over time
- **Integration Testing**: Verify system interactions work correctly
- **Performance Optimization**: Identify bottlenecks and slow operations

### For Debugging

- **Action Replay**: See the exact sequence of actions that led to an issue
- **State Verification**: Confirm game state is correct at any point
- **Effect Validation**: Verify charms, materials, and consumables work as expected
- **Flow Understanding**: Understand complex game logic interactions

## Implementation Status

- ✅ **Specification**: Complete
- ⏳ **Implementation**: Partially complete (basic framework exists)
- ⏳ **Integration**: Needs comprehensive integration across all systems
- ⏳ **Testing**: Needs validation across all game scenarios

## Priority

**Medium** - Valuable for development and debugging, but not required for core gameplay.

## Dependencies

- Core game systems (all)
- Configuration loading system
- File system access for config file

## Future Enhancements

- Web dashboard for debug output
- Debug output filtering and search
- Debug session recording and playback
- Integration with game statistics
- Visual debug overlays for web interface
