# Save/Load System, Menu Redo, Collection Page, and Unlock System Specification

## Overview

This specification covers:

1. **Save/Load System**: Persist game progress, unlocks, and settings
2. **Menu Redo**: Modern, polished main menu
3. **Collection Page**: Browse all items/features in the game (Balatro-style)
4. **Unlock System**: Track and unlock content as player progresses

## Current State

- No save/load system exists
- Basic menu exists (`MainMenu.tsx`)
- No collection page
- No unlock system

## Requirements

### Save/Load System

- Save current game state
- Save progress (unlocks, statistics)
- Save settings (volume, etc.)
- Load saved game
- Auto-save (optional)
- Export/import save data

### Menu Redo

- Modern, polished design
- Clear navigation
- Settings access
- Collection page access
- Continue game option
- New game option

### Collection Page

- Browse all game content (charms, consumables, blessings, materials, dice sets)
- Show locked/unlocked status
- Show item details (description, rarity, etc.)
- Filter by type
- Search functionality (optional)

### Unlock System

- Track unlocked content
- Unlock conditions (e.g., "Complete Level 5", "Use 10 charms")
- Progress tracking
- Unlock notifications
- Persistent unlocks across games

## Data Structures

```typescript
// Save Data
interface SaveData {
  version: string;
  timestamp: number;
  gameState?: GameState;
  progress: ProgressData;
  settings: SettingsData;
}

interface ProgressData {
  unlocks: UnlockData;
  statistics: StatisticsData;
}

interface UnlockData {
  charms: string[];
  consumables: string[];
  blessings: string[];
  materials: string[];
  diceSets: string[];
}

// Unlock System
interface UnlockCondition {
  type:
    | "levelComplete"
    | "charmUsed"
    | "consumableUsed"
    | "scoreReached"
    | "gamesPlayed";
  value: number;
  target?: string;
}

interface UnlockDefinition {
  id: string;
  name: string;
  description: string;
  condition: UnlockCondition;
  reward: UnlockReward;
}

// Collection
interface CollectionItem {
  id: string;
  name: string;
  description: string;
  rarity?: string;
  type: "charm" | "consumable" | "blessing" | "material" | "diceSet";
  unlocked: boolean;
  unlockCondition?: string;
  image?: string;
}
```

## API

```typescript
// Save Manager
class SaveManager {
  saveGame(saveData: SaveData, slot?: number): Promise<void>;
  loadGame(slot?: number): Promise<SaveData | null>;
  exportSave(slot?: number): Promise<string>;
  importSave(data: string): Promise<void>;
  autoSave(gameState: GameState): Promise<void>;
}

// Unlock Manager
class UnlockManager {
  checkUnlocks(gameState: GameState, progress: ProgressData): UnlockResult[];
  unlock(id: string): void;
  isUnlocked(id: string): boolean;
  getUnlockProgress(id: string): number;
}
```

## Implementation Phases

1. **Save/Load Foundation**: SaveManager service, localStorage implementation, React hook
2. **Progress & Settings**: Progress tracking, settings persistence
3. **Unlock System**: UnlockManager, unlock definitions, notifications
4. **Collection Page**: Collection page component, item display, filtering
5. **Menu Redo**: Redesigned menu, navigation, integration
6. **Integration & Polish**: Full integration, error handling, testing

## Edge Cases

- Corrupted save data: Validate and handle gracefully
- Storage quota: Handle quota exceeded errors
- Version mismatch: Migrate old save formats
- Multiple unlocks: Handle simultaneous unlocks
- Missing items: Handle gracefully

## Out of Scope

- Cloud save
- Multiple save slots UI
- Achievement system UI
- Social features

## Open Questions

1. Use localStorage or IndexedDB? (Suggested: localStorage for now)
2. How many save slots? (Suggested: 1 for now, expandable)
3. Auto-save frequency? (Suggested: On level complete)
4. Unlock notification style? (Toast, modal, etc.)
5. Collection page layout? (Grid, list, etc.)

## References

- [Balatro UI Spec](./balatro-ui-spec.md)
- [Web Refactor Spec](./in-progress/web-app-refactor.md)
