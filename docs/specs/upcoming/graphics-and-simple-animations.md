# Graphics and Simple Animations Specification

## Overview

This specification covers:

1. **Graphics/Sprites**: Generate or create sprites for dice, materials, charms, blessings, and consumables
2. **Simple Animations**: Basic animations for dice rolling and other game actions

## Current State

- Image directory structure exists (`public/assets/images/`)
- No actual images/sprites yet
- UI uses text and basic styling
- No rolling animations

## Requirements

### Graphics

- Sprites for all dice faces (1-6)
- Material indicators/overlays
- Charm icons
- Consumable icons
- Blessing icons
- Consistent art style
- Proper sizing (64x64px to 128x128px recommended)
- Optimized images (WebP, compressed)

### Animations

- Dice rolling animation (spinning/flipping)
- Smooth transitions
- Material effect visual feedback (optional)
- Simple, performant animations (60fps)
- Animations should be skippable/reducible

## Data Structures

```typescript
// Image Paths
interface ImagePaths {
  dice: {
    faces: Record<number, string>;
    materials: Record<DiceMaterialType, string>;
  };
  charms: Record<string, string>;
  consumables: Record<string, string>;
  blessings: Record<string, string>;
}

// Animation Config
interface AnimationConfig {
  duration: number;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  delay?: number;
  onComplete?: () => void;
}
```

## API

```typescript
// Image Utilities
function getDiceFaceImage(value: number, material: DiceMaterialType): string;
function getCharmImage(charmId: string): string;
function getConsumableImage(consumableId: string): string;
function getBlessingImage(blessingId: string): string;

// Animation Hook
function useAnimation(config: AnimationConfig): {
  start: () => void;
  stop: () => void;
  isAnimating: boolean;
  progress: number;
};

// Dice Roll Animation Component
interface DiceRollAnimationProps {
  dice: Die[];
  onComplete: () => void;
  duration?: number;
}
```

## Implementation Phases

1. **Graphics Foundation**: Image loading system, utilities, placeholders
2. **Dice Graphics**: Dice face sprites, material indicators
3. **Item Graphics**: Charm, consumable, blessing icons
4. **Animation System**: Animation utilities, hooks, components
5. **Dice Rolling Animation**: Rolling animation, integration
6. **Polish & Optimization**: Optimize images, polish animations, testing

## Edge Cases

- Missing images: Fallback to placeholder or text
- Image load failures: Handle gracefully
- Animation interruption: Handle cleanup
- Performance issues: Reduce complexity
- Accessibility: Respect reduced motion preferences

## Out of Scope

- Complex 3D animations
- Particle effects
- Advanced shader effects
- Custom animation editor

## Open Questions

1. Art style? (Pixel art, vector, hand-drawn, etc.)
2. Who creates graphics? (AI generation, artist, placeholder)
3. Animation library? (CSS animations, Framer Motion, custom)
4. Should animations be skippable?
5. How detailed should dice faces be?

## References

- [Graphics Generation Documentation](../../design/graphics-generation.md)
- [Sound Effects Spec](./sound-effects-and-visual-scoring.md)
- [Web Refactor Spec](./in-progress/web-app-refactor.md)
