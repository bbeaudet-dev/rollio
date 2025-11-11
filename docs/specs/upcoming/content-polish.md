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

**Blessings**: All defined, implementation status needs verification

- All blessing effect types should be implemented in game logic

**Dice Sets**: 3 defined

- Beginner Set, High Roller Set, Low Baller Set
- Need more variety for testing

## Requirements

### Functional Requirements

- Complete Mirror material implementation
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

## References

- [Web Refactor Spec](./in-progress/web-app-refactor.md)
- [Enhanced Rules Spec](./completed/enhanced-rules.md)
- [Material System Spec](./completed/material-system-spec.md)
