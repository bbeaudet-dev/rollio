# Balatro-Like UI Implementation Specification

## Overview

This specification outlines the implementation of a Balatro-like UI system for Rollio, focusing on modular animations, visual feedback, and event-driven architecture that supports individual dice scoring animations, charm/material effect animations, and shop/inventory interactions.

## Current State Analysis

### Strengths

- **Modular Architecture**: Well-separated concerns between game logic, display, and interfaces
- **Event-Driven Structure**: Existing callback patterns for consumables and charms
- **Animation Foundation**: CLI dice animation system with configurable timing
- **Component-Based UI**: React components already exist for web interface

### Areas for Improvement

- **Animation Hooks**: Limited integration points for visual feedback
- **Individual Element Tracking**: No system for tracking individual dice/charms/items
- **State Management**: Animations not tied to game state changes
- **Timing Coordination**: No centralized animation timing management

## Phase 1: Foundation (Core Animation System)

### 1.1 Event-Driven Animation System

#### `GameEvent` Interface

```typescript
interface GameEvent {
  type:
    | "dice_scored"
    | "charm_activated"
    | "material_effect"
    | "consumable_used"
    | "shop_purchase"
    | "inventory_change";
  timestamp: number;
  data: any;
  priority: "low" | "normal" | "high" | "critical";
}
```

#### `AnimationEventBus` Class

```typescript
class AnimationEventBus {
  private listeners: Map<string, Array<(event: GameEvent) => void>>;

  emit(event: GameEvent): void;
  subscribe(eventType: string, callback: (event: GameEvent) => void): void;
  unsubscribe(eventType: string, callback: (event: GameEvent) => void): void;
  clear(): void;
}
```

**Implementation Priority**: High
**Files to Modify**:

- `src/game/core/types.ts` - Add GameEvent interface
- `src/game/core/animationEventBus.ts` - New file
- `src/game/engine/GameEngine.ts` - Integrate event bus

### 1.2 Individual Dice Scoring Animations

#### `DiceScoringAnimation` Class

```typescript
class DiceScoringAnimation {
  private diceElement: HTMLElement;
  private pointsPopup: HTMLElement;

  animateScoring(die: Die, points: number, bonuses: any[]): Promise<void>;
  highlightDie(die: Die, duration: number): Promise<void>;
  showPointsPopup(
    points: number,
    position: { x: number; y: number }
  ): Promise<void>;
  animateBonus(bonus: any): Promise<void>;
}
```

**Features**:

- Individual dice highlighting during selection
- Points popup animation with bounce effect
- Bonus effect animations (charm, material, consumable)
- Smooth transitions between states

**Implementation Priority**: High
**Files to Modify**:

- `src/app/components/ui/Dice.tsx` - Add animation hooks
- `src/game/display/diceAnimation.ts` - Extend existing animation system
- `src/game/logic/scoring.ts` - Emit scoring events

### 1.3 Animation State Management

#### `AnimationStateManager` Class

```typescript
class AnimationStateManager {
  private activeAnimations: Map<string, AnimationState>;
  private queue: AnimationQueue;

  startAnimation(id: string, animation: Animation): void;
  stopAnimation(id: string): void;
  pauseAll(): void;
  resumeAll(): void;
  isAnimating(): boolean;
  getActiveAnimations(): AnimationState[];
}
```

**Implementation Priority**: Medium
**Files to Modify**:

- `src/game/core/animationStateManager.ts` - New file
- `src/game/engine/GameEngine.ts` - Integrate state manager

## Phase 2: Effects and Feedback

### 2.1 Charm and Material Effect Animations

#### `EffectAnimationManager` Class

```typescript
class EffectAnimationManager {
  private charmAnimations: Map<string, CharmAnimation>;
  private materialAnimations: Map<string, MaterialAnimation>;

  animateCharmEffect(charm: Charm, effect: any): Promise<void>;
  animateMaterialEffect(material: DiceMaterial, effect: any): Promise<void>;
  showEffectPopup(
    effect: any,
    position: { x: number; y: number }
  ): Promise<void>;
}
```

**Charm Animation Examples**:

- **Score Multiplier**: Golden sparkles around dice
- **Flop Shield**: Shield barrier animation
- **Money Magnet**: Coin collection animation
- **Volcano Amplifier**: Fire burst effect

**Material Animation Examples**:

- **Crystal**: Shimmering light effect
- **Golden**: Golden glow pulse
- **Rainbow**: Color cycling animation
- **Volcano**: Lava flow effect

**Implementation Priority**: Medium
**Files to Modify**:

- `src/game/core/charmSystem.ts` - Add animation hooks
- `src/game/content/charms/` - Add animation properties to charms
- `src/game/content/materials.ts` - Add animation properties to materials

### 2.2 Visual Feedback System

#### `VisualFeedbackManager` Class

```typescript
class VisualFeedbackManager {
  private feedbackQueue: FeedbackItem[];

  showSuccess(message: string, position?: Position): Promise<void>;
  showError(message: string, position?: Position): Promise<void>;
  showWarning(message: string, position?: Position): Promise<void>;
  showInfo(message: string, position?: Position): Promise<void>;
  shakeElement(element: HTMLElement): Promise<void>;
  pulseElement(element: HTMLElement): Promise<void>;
}
```

**Feedback Types**:

- Success/Error/Warning/Info popups
- Element shaking for invalid actions
- Pulsing for important elements
- Color transitions for state changes

**Implementation Priority**: Medium
**Files to Modify**:

- `src/app/components/GameInterface.tsx` - Add feedback manager
- `src/cli/cliInterface.ts` - Add CLI feedback methods

## Phase 3: Advanced Features

### 3.1 Shop and Inventory Animation Hooks

#### `ShopAnimationManager` Class

```typescript
class ShopAnimationManager {
  private shopAnimations: Map<string, ShopAnimation>;

  animatePurchase(item: ShopItem, cost: number): Promise<void>;
  animateSale(item: ShopItem, profit: number): Promise<void>;
  animateItemHover(item: ShopItem): Promise<void>;
  animateInventorySort(): Promise<void>;
  animateMoneyChange(oldAmount: number, newAmount: number): Promise<void>;
}
```

**Shop Animation Examples**:

- **Purchase**: Item flies to inventory with coin animation
- **Sale**: Item flies to shop with money counter
- **Hover**: Item glows and shows tooltip
- **Money Change**: Counter animation with sound

**Implementation Priority**: Low (Future shop implementation)
**Files to Modify**:

- Future shop system files
- `src/game/core/shopAnimationManager.ts` - New file

### 3.2 Modular Animation Components

#### `AnimationComponents` Class

```typescript
class AnimationComponents {
  static pointsPopup(points: number, position: Position): HTMLElement;
  static bonusEffect(bonus: any, position: Position): HTMLElement;
  static charmActivation(charm: Charm, position: Position): HTMLElement;
  static materialEffect(
    material: DiceMaterial,
    position: Position
  ): HTMLElement;
  static shopItem(item: ShopItem, position: Position): HTMLElement;
}
```

**Component Examples**:

- **Points Popup**: Bouncing number with glow effect
- **Bonus Effect**: Sparkle animation with text
- **Charm Activation**: Charm icon with activation effect
- **Material Effect**: Material-specific visual effect

**Implementation Priority**: Medium
**Files to Modify**:

- `src/app/components/ui/` - Add animation components
- `src/game/display/animationComponents.ts` - New file

### 3.3 Responsive Animation Timing

#### `AnimationTimingManager` Class

```typescript
class AnimationTimingManager {
  private baseTiming: AnimationTiming;
  private userPreferences: UserPreferences;

  getAnimationDuration(type: AnimationType): number;
  getAnimationDelay(type: AnimationType): number;
  setAnimationSpeed(speed: "slow" | "normal" | "fast"): void;
  pauseBetweenAnimations(duration: number): Promise<void>;
}
```

**Timing Features**:

- Configurable animation speeds
- Automatic timing adjustments
- Pause between sequential animations
- User preference support

**Implementation Priority**: Low
**Files to Modify**:

- `src/game/core/animationTimingManager.ts` - New file
- `src/game/config.ts` - Add timing configuration

## Implementation Strategy

### Quick Wins (Phase 1)

1. **Extract Animation Logic**: Move dice animation logic to reusable components
2. **Add Event Hooks**: Add animation events to existing game actions
3. **Create State Management**: Implement basic animation state tracking
4. **Individual Dice Highlighting**: Add visual feedback for dice selection

### Medium Term (Phase 2)

1. **Charm Animations**: Implement charm-specific visual effects
2. **Material Effects**: Add material-based animations
3. **Feedback System**: Implement comprehensive visual feedback
4. **Component Library**: Create reusable animation components

### Long Term (Phase 3)

1. **Shop Integration**: Add shop-specific animations
2. **Advanced Timing**: Implement sophisticated timing management
3. **Performance Optimization**: Optimize animation performance
4. **Accessibility**: Add animation accessibility features

## Technical Considerations

### Performance

- **Animation Batching**: Group multiple animations for efficiency
- **Frame Rate Management**: Ensure smooth 60fps animations
- **Memory Management**: Clean up completed animations
- **GPU Acceleration**: Use CSS transforms for hardware acceleration

### Accessibility

- **Animation Preferences**: Respect user's reduced motion preferences
- **Alternative Feedback**: Provide non-visual feedback options
- **Keyboard Navigation**: Ensure animations don't interfere with keyboard input
- **Screen Reader Support**: Provide appropriate ARIA labels

### Cross-Platform

- **CLI Compatibility**: Ensure animations work in terminal environment
- **Web Interface**: Optimize for browser performance
- **Mobile Support**: Consider touch interactions and smaller screens
- **Progressive Enhancement**: Graceful degradation for older systems

## File Structure

```
src/
├── game/
│   ├── core/
│   │   ├── animationEventBus.ts
│   │   ├── animationStateManager.ts
│   │   ├── animationTimingManager.ts
│   │   └── visualFeedbackManager.ts
│   ├── display/
│   │   ├── animationComponents.ts
│   │   ├── diceScoringAnimation.ts
│   │   ├── effectAnimationManager.ts
│   │   └── shopAnimationManager.ts
│   └── config/
│       └── animationConfig.ts
└── app/
    └── components/
        └── ui/
            ├── AnimationComponents.tsx
            ├── DiceAnimation.tsx
            └── FeedbackPopup.tsx
```

## Success Metrics

### User Experience

- **Animation Smoothness**: 60fps animations with no stuttering
- **Response Time**: Animations complete within 500ms
- **Visual Clarity**: Clear feedback for all game actions
- **Engagement**: Increased user engagement with visual feedback

### Technical Performance

- **Memory Usage**: <10MB additional memory for animations
- **CPU Usage**: <5% additional CPU usage during animations
- **Bundle Size**: <50KB additional bundle size
- **Load Time**: <100ms additional load time

### Code Quality

- **Modularity**: Animations can be easily added/removed
- **Testability**: All animation components are unit tested
- **Maintainability**: Clear separation of concerns
- **Documentation**: Comprehensive documentation for all animation APIs

## Conclusion

This Balatro-like UI system will transform Rollio from a functional dice game into an engaging, visually appealing experience. The modular architecture ensures that animations can be easily added, modified, or removed without affecting core game logic. The event-driven system provides clean integration points for future features like the shop system and advanced charm effects.

The phased implementation approach allows for incremental improvements while maintaining game stability. Quick wins provide immediate visual feedback, while longer-term features build toward a comprehensive animation system that rivals commercial games like Balatro.
