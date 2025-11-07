# Architecture Documentation

This directory contains comprehensive architecture documentation for Rollio.

## Documentation Overview

### [Architecture Overview](./overview.md)
High-level system architecture, principles, and layer descriptions.

### [Game Flow](./game-flow.md)
Complete game flow from initialization to game over, including state transitions and component interactions.

### [Data Flow](./data-flow.md)
How data flows through the system, including state management, transformations, and update patterns.

### [Types](./types.md)
Complete type system documentation, including all interfaces, type relationships, and type safety patterns.

### [Dependencies](./dependencies.md)
Module dependencies, import patterns, and dependency rules.

### [Game State Structure](./game-state-structure.md)
Detailed breakdown of the game state structure, including GameState, LevelState, RoundState, and RollState.

### [Architecture Diagrams](./architecture-diagrams.md)
Visual diagrams showing game state relationships, component interactions, and system architecture.

## Quick Reference

### State Hierarchy

```
GameState
├── Game-wide state (isActive, money, charms, etc.)
├── currentLevel: LevelState
│   ├── Level-specific state (pointsBanked, livesRemaining, etc.)
│   └── currentRound: RoundState
│       ├── Round-specific state (diceHand, roundPoints, etc.)
│       └── rollHistory: RollState[]
└── history: GameHistory
    ├── totalScore
    ├── combinationCounters
    └── levelHistory: LevelState[]
```

### Data Flow

```
User Action → Component → Hook → Service → Game Engine → State Update → Component Re-render
```

### Module Layers

1. **Presentation Layer**: React components and hooks
2. **Application Layer**: WebGameManager (bridge between UI and engine)
3. **Game Engine Layer**: Game orchestration and flow
4. **Game Logic Layer**: Game rules and mechanics
5. **Data Layer**: Type definitions and static data

## Key Concepts

### Separation of Concerns
- Presentation (React) is separate from business logic (game engine)
- Game logic has no React dependencies
- Clear interfaces between layers

### Unidirectional Data Flow
- State flows down from game engine to components
- Actions flow up from components to game engine
- Single source of truth (game engine state)

### Type Safety
- TypeScript throughout
- Strong typing for all game state
- Type guards for runtime validation

### Modularity
- Self-contained modules
- Clear interfaces
- Minimal dependencies

## Related Documentation

- [API Documentation](../API.md) - API reference
- [Design Documentation](../design/) - UI/UX design docs
- [Specifications](../specs/) - Feature specifications

