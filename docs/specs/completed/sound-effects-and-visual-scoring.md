# Sound Effects and Visual Scoring Specification

## Overview

This specification covers:

1. **Sound Effects System**: Audio feedback for game actions
2. **Visual Scoring Feedback**: Step-by-step visual breakdown of scoring process

## Current State

- No sound system exists
- Scoring process exists but not visually exposed
- Preview scoring shows only final result

## Requirements

### Sound Effects

- Dice rolling sound
- Banking points sound
- Flopping sound
- Menu navigation sounds
- Shop purchase sounds
- Victory/progress sounds
- Volume controls
- Mute option

### Visual Scoring

- Visual breakdown component showing:
  - Base combinations
  - Charm effects
  - Material effects
  - Final points
- Step-by-step animation
- Highlight affected dice
- Show scoring progression

## Implementation

### Sound System

```typescript
// Audio Manager
class AudioManager {
  playSound(sound: SoundType): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
}

// Sound Types
type SoundType =
  | "diceRoll"
  | "bank"
  | "flop"
  | "menuNav"
  | "shopPurchase"
  | "victory"
  | "levelComplete";
```

### Visual Scoring Component

```typescript
interface ScoringBreakdownProps {
  basePoints: number;
  charmBonus: number;
  materialBonus: number;
  finalPoints: number;
  affectedDice: number[];
  onComplete?: () => void;
}

function ScoringBreakdown(props: ScoringBreakdownProps): React.ReactElement;
```

## Implementation Phases

1. **Sound System Foundation**: Audio manager, sound file organization, basic sounds
2. **Visual Scoring Component**: Breakdown component, step-by-step animation
3. **Integration**: Integrate with game flow, add volume controls
4. **Polish**: Sound effects polish, animation polish, testing

## Out of Scope

- Complex audio mixing
- 3D positional audio
- Advanced animation effects
- Custom sound editor

## References

- [Web Refactor Spec](./in-progress/web-app-refactor.md)
- [Graphics Spec](./graphics-and-simple-animations.md)




Next:
- score sounds - clicking score, scoring each die, scoring each charm, scoring each material
- banking/scoring (progresive, crescendoing upwards if possible, as points are tallied? )