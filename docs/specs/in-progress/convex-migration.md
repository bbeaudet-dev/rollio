# Convex Migration & Game State Flattening PRD

## Overview

Two parallel architectural shifts, done together:

1. **Flatten the game state model** — Replace the deeply nested `GameState.currentWorld.currentLevel.currentRound.diceHand` ownership tree with flat collections and ID references, following patterns used by shipping turn-based games.
2. **Migrate the backend to Convex** — Replace Express + PostgreSQL with Convex's reactive database, eliminating manual serialization, autosave gaps, and the absence of real-time multiplayer infrastructure.

These two shifts reinforce each other. Convex's schema encourages normalized, relational data — which is exactly what flat game state wants to be. Doing them simultaneously avoids refactoring the data model twice.

### Why Both, Why Now

| Current Pain | Root Cause | Solution |
|---|---|---|
| "Nested game state is a nightmare" | Parent-owns-child model (world → level → round → dice) | Flat collections + ID references |
| Every immutable update cascades 4 levels deep | `{...gameState, currentWorld: {...currentWorld, currentLevel: ...}}` | Patch a single document |
| Two state layers (`GameState` + `WebGameState`) | Derived UI state stored as extra fields | Derived state as selectors/queries |
| `pendingAction` Promise living outside React | Promise-based imperative I/O model | Phase-driven reactive UI |
| Serialize/deserialize charm classes | Class-based charms with inheritance | Pure data charms + stateless hook functions |
| Autosave gaps | Manual save points in a mutable JSONB blob | Every mutation is persistent by construction |
| No real multiplayer | Socket.IO lobby with no shared state model | Convex reactive queries |
| Two systems to maintain (Express + PostgreSQL + migrations) | Self-hosted backend | Convex-managed infrastructure |

### Why Not (Trade-offs)

- **Vendor lock-in**: Data and functions live on Convex. Self-hosting exists but is less mature.
- **Execution time limits**: Convex mutations have a ~1s wall-clock limit. Complex scoring with 10+ dice and many charms must be validated early.
- **Deterministic mutations**: `Math.random()` works in Convex mutations (via recorded replay), but this needs to be validated for dice rolling, shop generation, and map generation.
- **CLI path**: The CLI (`src/cli/`) uses `GameAPI` directly; it will keep a local-only path during and after migration.
- **Refactor scope**: Doing both at once means a larger PR surface than just migrating. The flat game logic is independently shippable (see Phase 1), which bounds risk.

---

## Core Architectural Shifts

These four patterns define the target architecture. Every other design decision in this doc follows from them.

### Shift 1: Flat Collections with ID References

**From:** Parent-owns-child nested objects.

```typescript
gameState.currentWorld!.currentLevel.currentRound!.diceHand
```

**To:** Flat collections keyed by ID; "current" is just a pointer.

```typescript
const round = getCurrentRound(ctx, gameId); // looks up by game.currentRoundId
const dice = getActiveDice(ctx, gameId);
```

**Why it matters:**
- Updates don't cascade. Patching `rounds[id]` doesn't require reconstructing levels, worlds, or the top-level game.
- Convex reactive queries can target individual collections: re-render the shop panel only when shop data changes, not when dice roll.
- Mirrors database patterns (foreign keys, normalized tables) that the industry has converged on over 50 years.

### Shift 2: Pure Data Charms + Stateless Hooks

**From:** Class-based charms with inheritance and mutable per-instance state.

```typescript
class FibonacciCharm extends BaseCharm {
  rainbowTriggers = 0;
  onScoring(context) {
    this.rainbowTriggers += 1;
    return { ... };
  }
}
```

**To:** Charm data is plain records. Hooks are stateless functions keyed by `charmId`. Per-charm mutable state lives inside the data.

```typescript
// Charm is plain data
type Charm = {
  id: Id<"charms">;
  charmId: string;            // definition key, e.g. "fibonacci"
  gameId: Id<"games">;
  slot: number;
  uses?: number;
  state: Record<string, any>; // mutable state lives here
};

// Registry of pure hook functions
const charmHooks: Record<string, CharmHooks> = {
  fibonacci: {
    onScoring: (charm, context) => ({
      modifications: [/* ... */],
      stateUpdate: { rainbowTriggers: (charm.state.rainbowTriggers ?? 0) + 1 },
    }),
  },
  // ...
};
```

**Why it matters:**
- Serializes natively. No `CharmRegistry` reconstruction needed.
- No mutable manager object passed around. Hooks are pure: `(charm, context) => { modifications, stateUpdate }`.
- Testing becomes trivial — no instance setup, just call the function.
- Charm state updates are explicit and persisted atomically with the action that triggered them.

### Shift 3: Derived State as Selectors, Not Stored Fields

**From:** `WebGameState` stores derived fields like `canRoll`, `canBank`, `canReroll`, `isWaitingForReroll`.

**To:** These are computed on the fly — either as Convex query helpers or client-side selectors.

```typescript
// Server-side query returns what the player can currently do
export const getAvailableActions = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    const round = await getCurrentRound(ctx, gameId);
    const level = await getCurrentLevel(ctx, gameId);
    return {
      canRoll: canRoll(game, round, level),
      canBank: canBankPoints(round, level),
      canReroll: canReroll(round, level),
      canSelectDice: round?.isActive && !round.isFlop,
    };
  },
});
```

**Why it matters:**
- Single source of truth. No drift between `gameState.money` and `webGameState.money`.
- The two-state-shape problem disappears. There's no `WebGameState`; there's `Game` + derived queries.
- New derived values are one function away, not a new field in a new type.

### Shift 4: Phase-Driven UI, Not Imperative Promises

**From:** `ReactGameInterface` holds a `pendingActionResolve` Promise. The game "asks" for input via `askForDiceSelection()` which returns a Promise, and the UI eventually calls `resolvePendingAction(value)`.

**To:** The game's current state *is* the pending action. The UI reads `gamePhase` and shows appropriate controls. The player's action is a mutation.

```typescript
// New phases are explicit and fine-grained
type GamePhase =
  | 'worldSelection'
  | 'awaitingRoll'
  | 'awaitingDiceSelection'
  | 'awaitingReroll'
  | 'awaitingBankOrRoll'
  | 'awaitingFlopShield'
  | 'scoring'
  | 'tallying'
  | 'shop'
  | 'gameWin'
  | 'gameLoss';

// UI renders based on phase
function GameBoard() {
  const game = useQuery(api.game.getGame, { gameId });
  if (game?.phase === 'awaitingDiceSelection') return <DiceSelectionUI />;
  if (game?.phase === 'awaitingReroll') return <RerollUI />;
  // ...
}
```

**Why it matters:**
- No Promise dangling outside React's lifecycle.
- Refresh, resume, and multiplayer all work without special cases — state in Convex fully describes what should be on screen.
- Phase transitions are server-authoritative. Client can't skip phases or cheat.

---

## Current vs. Target Data Model

### Current (Nested)

```
GameState
├── currentWorld: WorldState
│   ├── levelConfigs[]
│   └── currentLevel: LevelState
│       ├── pointsBanked, rerollsRemaining, ...
│       └── currentRound: RoundState
│           ├── diceHand: Die[]
│           ├── rollHistory: RollState[]
│           └── roundPoints, hotDiceCounter, ...
├── diceSet: Die[]
├── charms: Charm[]
├── consumables: Consumable[]
├── blessings: Blessing[]
└── ...
```

### Target (Flat)

```
Game (top-level record)
├── phase: GamePhase
├── money, shopVouchers
├── charmSlots, consumableSlots
├── baseLevelRerolls, baseLevelBanks
├── currentWorldId?: Id<"worlds">
├── currentLevelId?: Id<"levels">
├── currentRoundId?: Id<"rounds">
├── currentShopId?: Id<"shops">
├── currentMapId?: Id<"maps">
├── consecutiveBanks, consecutiveFlops
├── history: { combinationCounters, charmCounters, ... }
└── settings

Worlds (collection, by gameId)
Levels (collection, by gameId, FK worldId)
Rounds (collection, by gameId, FK levelId)
Rolls (collection, by gameId, FK roundId)    ← rollHistory becomes its own table
Dice (collection, by gameId)                  ← diceSet as flat rows
Charms (collection, by gameId)
Consumables (collection, by gameId)
Blessings (collection, by gameId)
Maps (collection, by gameId)
Shops (collection, by gameId, created per shop visit)
```

Key changes from the current model:

- `currentWorld`, `currentLevel`, `currentRound` → `currentWorldId`, `currentLevelId`, `currentRoundId` (pointers, not owned objects).
- `rollHistory: RollState[]` → separate `rolls` table with `roundId` FK. This alone eliminates a big chunk of the JSONB blob size problem and enables querying individual rolls (e.g., "show me the highest-scoring roll ever").
- `diceSet: Die[]` → `dice` table with per-die rows. Die mutations (pip effects, material changes) are isolated patches.
- `charms: Charm[]` order → explicit `slot` field on each charm. Reordering is a slot number swap, not array mutation.

---

## The Flat Game Logic Contract

The pure functions in `src/game/logic/` currently accept a `GameState` as a catch-all parameter. After the refactor, each function takes exactly the slices it needs — the types it accepts become a precise specification of its actual dependencies.

### Function Signature Migration Examples

```typescript
// BEFORE
function processRoll(roundState: RoundState, diceSet: Die[]): RoundState
function isFlop(diceHand: Die[], gameState: GameState): boolean
function processBankPoints(
  gameState: GameState,
  roundState: RoundState,
  charmManager?: CharmManager
): { success, newGameState, newRoundState, bankedPoints, levelCompleted }
function advanceToNextLevel(gameState: GameState, charmManager?: CharmManager): GameState


// AFTER
function processRoll(dice: Die[]): { rolls: DieRoll[] }

function isFlop(
  diceHand: DieRoll[],
  effectContext: EffectContext,
  activeCharms: Charm[]
): boolean

type BankPointsInput = {
  round: Round;
  level: Level;
  charms: Charm[];
  blessings: Blessing[];
};
type BankPointsResult = {
  roundUpdate: Partial<Round>;
  levelUpdate: Partial<Level>;
  bankedPoints: number;
  levelCompleted: boolean;
  charmStateUpdates: Record<string, any>; // charmId → state patch
};
function processBankPoints(input: BankPointsInput): BankPointsResult

type AdvanceLevelInput = {
  game: Game;
  level: Level;
  world: World;
  charms: Charm[];
};
type AdvanceLevelResult = {
  gameUpdate: Partial<Game>;
  newLevel: Omit<Level, 'id'>;    // to be inserted
  worldComplete: boolean;
};
function advanceToNextLevel(input: AdvanceLevelInput): AdvanceLevelResult
```

### The Contract

Every game logic function follows this shape:

```typescript
type LogicInput = {
  // Only the specific entities this function needs
  // (round, level, dice, charms, blessings, etc.)
};

type LogicResult = {
  // Patches to apply, not full new entities
  roundUpdate?: Partial<Round>;
  levelUpdate?: Partial<Level>;
  gameUpdate?: Partial<Game>;
  diceUpdates?: Array<{ id: Id<"dice">, patch: Partial<Die> }>;
  charmStateUpdates?: Record<string, any>; // charmId → state patch
  newEntities?: {
    rolls?: Array<Omit<Roll, 'id'>>;
    rounds?: Array<Omit<Round, 'id'>>;
    // ...
  };
  // Derived info the caller needs
  flags?: { levelCompleted?: boolean; worldComplete?: boolean; ... };
};

function someAction(input: LogicInput): LogicResult;
```

**Why patches and not new entities?**

- Convex's `ctx.db.patch(id, updates)` is the most efficient update primitive. Returning patches aligns the logic layer with the persistence layer.
- Patches make the minimum change obvious. Reviewing a diff like `{ moneyUpdate: -5, charmsToInsert: [...] }` is clearer than reading a function that returns a whole new game tree.
- Pure tests become: given this input, did you produce this set of patches? No deep-equality nightmares.

**Why is `charmStateUpdates` a dict keyed by charmId?**

The same logic function may be affected by multiple charms, each mutating its own state. Returning a map means the mutation layer can write all state updates atomically:

```typescript
for (const [charmId, stateUpdate] of Object.entries(result.charmStateUpdates)) {
  const charm = charmsById[charmId];
  await ctx.db.patch(charm._id, {
    state: { ...charm.state, ...stateUpdate }
  });
}
```

---

## The Charm System Refactor

This is the single biggest refactor inside `src/game/logic/`. The class hierarchy goes away entirely.

### Current Structure

```
BaseCharm (abstract class)
  ├── CommonCharms/FibonacciCharm (1094 lines across file)
  ├── UncommonCharms/*
  ├── RareCharms/*
  └── LegendaryCharms/*

CharmManager (stateful, holds BaseCharm[])
  ├── addCharm, removeCharm, syncFromGameState
  ├── applyCharmEffects(context)    // iterates, calls hooks
  ├── tryPreventFlop(context)
  ├── callAllOnRoundStart(context)
  └── ...

CharmRegistry (singleton, maps charmId → class constructor)
```

### New Structure

```typescript
// === Pure data ===
type Charm = {
  _id: Id<"charms">;
  gameId: Id<"games">;
  charmId: string;                    // definition key, e.g. "fibonacci"
  slot: number;
  active: boolean;
  uses?: number;
  buyValue?: number;
  sellValue?: number;
  state: Record<string, any>;         // mutable per-charm state
};

// === Stateless hooks ===
type CharmHooks = {
  onScoring?: (charm: Charm, ctx: CharmScoringContext) => CharmScoringResult;
  onDieScored?: (charm: Charm, ctx: CharmDieScoredContext) => CharmDieScoredResult;
  onFlop?: (charm: Charm, ctx: CharmFlopContext) => CharmFlopResult;
  onBank?: (charm: Charm, ctx: CharmBankContext) => CharmBankResult;
  onRoundStart?: (charm: Charm, ctx: CharmRoundStartContext) => CharmRoundStartResult;
  tryPreventFlop?: (charm: Charm, ctx: CharmFlopContext) => { prevented: boolean; log?: string };
  filterCombinations?: (charm: Charm, ctx: CharmFilterContext) => ScoringCombination[];
};

// Every hook returns modifications + state updates (pure)
type CharmScoringResult = {
  modifications: ScoringValueModification[];
  stateUpdate?: Record<string, any>;
  log?: string;
};

// === Registry ===
const charmHooks: Record<string, CharmHooks> = {
  fibonacci: { ... },
  rabbitsFoot: { ... },
  assassin: { ... },
  // 50+ charms
};

// === Apply functions (replace CharmManager methods) ===
function applyCharmScoringEffects(
  charms: Charm[],
  ctx: CharmScoringContext
): {
  modifications: ScoringValueModification[];
  stateUpdates: Record<string, Record<string, any>>;  // keyed by charm._id
  logs: string[];
} {
  const sorted = [...charms].sort((a, b) => a.slot - b.slot);
  const mods: ScoringValueModification[] = [];
  const stateUpdates: Record<string, Record<string, any>> = {};
  const logs: string[] = [];

  for (const charm of sorted) {
    const hooks = charmHooks[charm.charmId];
    const result = hooks?.onScoring?.(charm, ctx);
    if (!result) continue;
    mods.push(...result.modifications);
    if (result.stateUpdate) stateUpdates[charm._id] = result.stateUpdate;
    if (result.log) logs.push(result.log);
  }

  return { modifications: mods, stateUpdates, logs };
}
```

### Migration Strategy for Existing Charms

Charm logic is largely isolated per-charm (inheriting from `BaseCharm` but not calling parent methods). Each charm file converts to a `CharmHooks` object in a registry.

```typescript
// BEFORE (~30 lines per charm in CommonCharms.ts)
class FibonacciCharm extends BaseCharm {
  id = 'fibonacci';
  name = 'Fibonacci';
  private rainbowTriggers = 0;

  onScoring(context) {
    // ... logic that mutates this.rainbowTriggers
    return { modifications: [...] };
  }
}

// AFTER (~20 lines per charm in charmHooks registry)
export const fibonacci: CharmHooks = {
  onScoring: (charm, ctx) => {
    const triggers = (charm.state.rainbowTriggers ?? 0) + 1;
    return {
      modifications: [/* ... */],
      stateUpdate: { rainbowTriggers: triggers },
    };
  },
};
```

---

## Convex Schema

Because the game state is flat, the Convex schema becomes the literal source of truth for the data model — no more `assembleGameState` / `decomposeGameState` bridge.

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // ─── Users ─────────────────────────────────────────────
  userProfiles: defineTable({
    authId: v.string(),              // Convex Auth user ID
    username: v.string(),
    profilePicture: v.string(),
  })
    .index("by_authId", ["authId"])
    .index("by_username", ["username"]),


  // ─── Games (top-level, flat) ──────────────────────────
  games: defineTable({
    userId: v.id("userProfiles"),
    isActive: v.boolean(),
    phase: v.string(),               // GamePhase union

    // Config (set at start)
    difficulty: v.string(),
    diceSetConfigName: v.string(),
    consecutiveFlopLimit: v.number(),

    // Progression
    money: v.number(),
    shopVouchers: v.number(),
    charmSlots: v.number(),
    consumableSlots: v.number(),
    baseLevelRerolls: v.number(),
    baseLevelBanks: v.number(),

    // Pointers (not owned objects)
    currentWorldId: v.optional(v.id("worlds")),
    currentLevelId: v.optional(v.id("levels")),
    currentRoundId: v.optional(v.id("rounds")),
    currentShopId: v.optional(v.id("shops")),
    currentMapId: v.optional(v.id("maps")),

    // Tracking
    consecutiveBanks: v.number(),
    consecutiveFlops: v.number(),
    lastConsumableUsed: v.optional(v.string()),

    // Settings
    settings: v.object({
      sortDice: v.string(),
      gameSpeed: v.union(v.string(), v.number()),
      optimizeRollScore: v.boolean(),
    }),

    // Aggregated history (counters)
    history: v.object({
      totalRerollsUsed: v.optional(v.number()),
      totalBanksUsed: v.optional(v.number()),
      combinationCounters: v.any(),
      combinationLevels: v.any(),
      consumableCounters: v.any(),
      charmCounters: v.any(),
      blessingCounters: v.any(),
      highScoreSingleRoll: v.number(),
      highScoreBank: v.number(),
    }),

    won: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_active", ["userId", "isActive"]),


  // ─── Worlds ────────────────────────────────────────────
  worlds: defineTable({
    gameId: v.id("games"),
    worldId: v.string(),             // definition key, e.g. "forest"
    worldNumber: v.number(),
    levelConfigs: v.any(),           // static, write-once
    worldEffects: v.any(),           // static, write-once
  })
    .index("by_gameId", ["gameId"]),


  // ─── Levels ───────────────────────────────────────────
  levels: defineTable({
    gameId: v.id("games"),
    worldId: v.id("worlds"),
    levelNumber: v.number(),
    levelThreshold: v.number(),
    isMiniboss: v.optional(v.boolean()),
    isMainBoss: v.optional(v.boolean()),
    levelEffects: v.optional(v.any()),
    effectContext: v.optional(v.any()),

    pointsBanked: v.number(),
    rerollsRemaining: v.optional(v.number()),
    banksRemaining: v.optional(v.number()),
    maxRerollsAfterBonuses: v.optional(v.number()),
    maxBanksAfterBonuses: v.optional(v.number()),
    flopsThisLevel: v.number(),
    banksThisLevel: v.optional(v.number()),
    flowerCounter: v.optional(v.number()),
    isFirstScoring: v.optional(v.boolean()),
    isFirstFlop: v.optional(v.boolean()),
    isFirstRoll: v.optional(v.boolean()),
    isFirstBank: v.optional(v.boolean()),

    rewards: v.optional(v.any()),    // populated at tally
    completedAt: v.optional(v.number()),
  })
    .index("by_gameId", ["gameId"])
    .index("by_worldId", ["worldId"]),


  // ─── Rounds ───────────────────────────────────────────
  rounds: defineTable({
    gameId: v.id("games"),
    levelId: v.id("levels"),
    roundNumber: v.number(),
    roundPoints: v.number(),
    hotDiceCounter: v.number(),
    forfeitedPoints: v.number(),
    scoredValuesInRound: v.optional(v.array(v.number())),
    isActive: v.boolean(),
    endReason: v.optional(v.string()),
    endedAt: v.optional(v.number()),
  })
    .index("by_gameId", ["gameId"])
    .index("by_levelId", ["levelId"])
    .index("by_gameId_active", ["gameId", "isActive"]),


  // ─── Rolls (rollHistory as its own table) ─────────────
  rolls: defineTable({
    gameId: v.id("games"),
    roundId: v.id("rounds"),
    rollNumber: v.number(),
    isReroll: v.boolean(),
    diceSnapshot: v.any(),           // snapshot of rolled dice at this moment
    selectedIndices: v.optional(v.array(v.number())),
    rollPoints: v.optional(v.number()),
    maxRollPoints: v.optional(v.number()),
    combinations: v.optional(v.any()),
    isHotDice: v.optional(v.boolean()),
    isFlop: v.optional(v.boolean()),
    scoringBreakdown: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_roundId", ["roundId"])
    .index("by_gameId", ["gameId"]),


  // ─── Dice (per game, flat rows) ──────────────────────
  dice: defineTable({
    gameId: v.id("games"),
    dieId: v.string(),               // stable ID from dice set config
    sides: v.number(),
    allowedValues: v.array(v.number()),
    material: v.string(),
    pipEffects: v.optional(v.any()),

    // Runtime (scoped to current round)
    rolledValue: v.optional(v.number()),
    scored: v.optional(v.boolean()),
    inHand: v.boolean(),             // is the die currently in the dice hand?
  })
    .index("by_gameId", ["gameId"])
    .index("by_gameId_inHand", ["gameId", "inHand"]),


  // ─── Charms (pure data, per game) ────────────────────
  charms: defineTable({
    gameId: v.id("games"),
    charmId: v.string(),             // definition key
    slot: v.number(),
    active: v.boolean(),
    uses: v.optional(v.number()),
    buyValue: v.optional(v.number()),
    sellValue: v.optional(v.number()),
    state: v.any(),                  // mutable per-charm state
  })
    .index("by_gameId", ["gameId"]),


  // ─── Consumables (per game) ──────────────────────────
  consumables: defineTable({
    gameId: v.id("games"),
    consumableId: v.string(),
    slot: v.number(),
    uses: v.number(),
  })
    .index("by_gameId", ["gameId"]),


  // ─── Blessings (per game) ────────────────────────────
  blessings: defineTable({
    gameId: v.id("games"),
    blessingId: v.string(),
    tier: v.number(),
    effect: v.any(),
  })
    .index("by_gameId", ["gameId"]),


  // ─── Maps (per game) ─────────────────────────────────
  maps: defineTable({
    gameId: v.id("games"),
    nodes: v.any(),
    connections: v.any(),
    currentNode: v.optional(v.number()),
    playerPath: v.array(v.number()),
  })
    .index("by_gameId", ["gameId"]),


  // ─── Shops (per visit, ephemeral) ────────────────────
  shops: defineTable({
    gameId: v.id("games"),
    availableCharms: v.any(),
    availableConsumables: v.any(),
    availableBlessings: v.any(),
  })
    .index("by_gameId", ["gameId"]),


  // ─── Historical: Completed Games ─────────────────────
  completedGames: defineTable({
    userId: v.id("userProfiles"),
    diceSetName: v.string(),
    difficulty: v.string(),
    endReason: v.string(),
    finalScore: v.number(),
    levelsCompleted: v.number(),
    totalRounds: v.number(),
    highSingleRoll: v.number(),
    highBank: v.number(),
    completedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_difficulty", ["userId", "difficulty"])
    .index("by_completedAt", ["completedAt"]),


  // ─── Stats & Progress ────────────────────────────────
  userStatistics: defineTable({
    userId: v.id("userProfiles"),
    gamesPlayed: v.number(),
    wins: v.number(),
    losses: v.number(),
    highScoreSingleRoll: v.number(),
    highScoreBank: v.number(),
  }).index("by_userId", ["userId"]),

  combinationUsage: defineTable({
    userId: v.id("userProfiles"),
    combinationType: v.string(),
    timesUsed: v.number(),
    firstUsedAt: v.optional(v.number()),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "combinationType"]),

  charmUsage: defineTable({
    userId: v.id("userProfiles"),
    charmId: v.string(),
    timesPurchased: v.number(),
    timesGenerated: v.number(),
    timesCopied: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_charm", ["userId", "charmId"]),

  consumableUsage: defineTable({
    userId: v.id("userProfiles"),
    consumableId: v.string(),
    timesUsed: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_consumable", ["userId", "consumableId"]),

  difficultyCompletions: defineTable({
    userId: v.id("userProfiles"),
    difficulty: v.string(),
    completedAt: v.number(),
  }).index("by_userId", ["userId"]),

  unlockedItems: defineTable({
    userId: v.id("userProfiles"),
    unlockType: v.string(),
    unlockId: v.string(),
    unlockedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "unlockType"]),


  // ─── Multiplayer Rooms (real-time lobby) ─────────────
  rooms: defineTable({
    roomCode: v.string(),
    hostUserId: v.id("userProfiles"),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_roomCode", ["roomCode"])
    .index("by_active", ["isActive"]),

  roomPlayers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("userProfiles"),
    username: v.string(),
    isActive: v.boolean(),
    status: v.string(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_userId", ["userId"]),
});
```

---

## Convex Functions Design

Functions are organized by domain. Each mutation reads only the slices it needs and writes only the patches it produces.

### Example Mutation: `rollDice`

```typescript
// convex/game/roll.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { rollDice } from "../../src/game/logic/gameActions";
import { isFlop } from "../../src/game/logic/gameLogic";
import { applyCharmRoundStartEffects } from "../../src/game/logic/charmSystem";

export const roll = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    // 1. Load only what's needed
    const game = await ctx.db.get(gameId);
    if (!game?.currentRoundId) throw new Error("No active round");
    const round = await ctx.db.get(game.currentRoundId);
    const level = await ctx.db.get(game.currentLevelId!);
    const dice = await ctx.db
      .query("dice")
      .withIndex("by_gameId_inHand", (q) =>
        q.eq("gameId", gameId).eq("inHand", true))
      .collect();
    const charms = await ctx.db
      .query("charms")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .collect();

    // 2. Run pure logic
    const rolled = rollDice(dice);
    const flopped = isFlop(rolled, level.effectContext, charms);

    // 3. Apply charm hooks (flop prevention, etc.)
    const charmResult = applyCharmRoundStartEffects(charms, { round, level });

    // 4. Persist patches
    for (const die of rolled) {
      await ctx.db.patch(die._id, { rolledValue: die.rolledValue });
    }
    await ctx.db.insert("rolls", {
      gameId,
      roundId: round._id,
      rollNumber: round.rollHistory?.length ?? 0 + 1,
      isReroll: false,
      diceSnapshot: rolled,
      isFlop: flopped,
      createdAt: Date.now(),
    });
    for (const [charmId, stateUpdate] of Object.entries(charmResult.stateUpdates)) {
      const charm = charms.find(c => c._id === charmId)!;
      await ctx.db.patch(charm._id, { state: { ...charm.state, ...stateUpdate } });
    }

    // 5. Update game phase based on result
    const newPhase = flopped ? "awaitingFlopShield" : "awaitingDiceSelection";
    await ctx.db.patch(gameId, { phase: newPhase });

    return { isFlop: flopped };
  },
});
```

### Function Organization

```
convex/
├── schema.ts
├── auth.ts                           # Convex Auth config
├── users/
│   ├── profiles.ts                   # getProfile, createProfile, updateProfile
├── game/
│   ├── create.ts                     # createGame mutation
│   ├── queries.ts                    # getGame, getAvailableActions, getAvailableDice
│   ├── roll.ts                       # roll, reroll
│   ├── score.ts                      # selectAndScoreDice
│   ├── bank.ts                       # bankPoints
│   ├── flop.ts                       # handleFlop, useFlopShield
│   ├── rounds.ts                     # startNewRound, endRound
│   ├── levels.ts                     # advanceToNextLevel, tallyLevel
│   ├── worlds.ts                     # selectWorld
│   ├── lifecycle.ts                  # endGame, deleteGame
│   └── settings.ts                   # updateSettings
├── shop/
│   ├── generate.ts                   # generateShop
│   ├── purchase.ts                   # purchaseCharm, purchaseConsumable, purchaseBlessing
│   ├── sell.ts                       # sellCharm, sellConsumable
│   ├── refresh.ts                    # refreshShop
│   └── reorder.ts                    # reorderCharm
├── consumables/
│   └── use.ts                        # useConsumable + die selection mutations
├── stats/
│   ├── user.ts                       # getUserStats
│   ├── history.ts                    # getGameHistory
│   ├── usage.ts                      # getCombinationUsage, getCharmUsage, getConsumableUsage
│   └── leaderboard.ts                # getLeaderboard
├── progress/
│   ├── unlocks.ts                    # getUnlockedItems, unlockItem
│   └── completions.ts                # getDifficultyCompletions, completeDifficulty
└── multiplayer/
    ├── rooms.ts                      # createRoom, joinRoom, leaveRoom, getRoomState
    └── session.ts                    # startGame, getRoomPlayers
```

---

## Client-Side Changes

### What Gets Deleted

- `src/server/*` — entire Express backend (~2,270 lines + 355 lines of SQL migrations)
- `src/web/services/WebGameManager.ts` (1,416 lines)
- `src/web/services/ReactGameInterface.ts` (222 lines)
- `src/web/services/api.ts` (425 lines)
- `src/game/api/*` — the event-driven GameAPI layer (~1,195 lines)

### What Gets Rewritten

**Hooks** — `useGameState.ts` becomes `useGame.ts`:

```typescript
// src/web/hooks/useGame.ts
export function useGame(gameId: Id<"games"> | null) {
  const game = useQuery(api.game.queries.getGame, gameId ? { gameId } : "skip");
  const round = useQuery(api.game.queries.getCurrentRound, gameId ? { gameId } : "skip");
  const dice = useQuery(api.game.queries.getDiceInHand, gameId ? { gameId } : "skip");
  const inventory = useQuery(api.game.queries.getInventory, gameId ? { gameId } : "skip");
  const shop = useQuery(api.shop.queries.getCurrent, gameId ? { gameId } : "skip");
  const actions = useQuery(api.game.queries.getAvailableActions, gameId ? { gameId } : "skip");

  // UI-only local state
  const [selectedDice, setSelectedDice] = useState<number[]>([]);
  const [breakdownStep, setBreakdownStep] = useState(0);

  // Mutations
  const rollDice = useMutation(api.game.roll.roll);
  const bankPoints = useMutation(api.game.bank.bank);
  const scoreDice = useMutation(api.game.score.selectAndScore);
  // ...

  return {
    game, round, dice, inventory, shop, actions,
    selectedDice, setSelectedDice,
    breakdownStep, setBreakdownStep,
    rollDice, bankPoints, scoreDice,
    // ...
  };
}
```

**Components** — UI components change their data sources but keep their structure:

```typescript
// BEFORE
const { gameState, roundState, rollActions, gameActions } = useGameState();
const dice = gameState.currentWorld?.currentLevel.currentRound?.diceHand ?? [];
gameActions.handleRollDice();

// AFTER
const { game, round, dice, rollDice } = useGame(gameId);
rollDice({ gameId });  // dice already flat; no deep navigation
```

### The CLI

Stays on local state with the existing `GameAPI`. When we flatten the game logic in Phase 1, the CLI continues to work because the pure functions still work with flat data — they just don't require a nested `GameState` to be assembled.

---

## Data Migration

### Auth

Convex Auth with built-in password provider. Existing bcrypt hashes can't be imported directly into Convex Auth, so existing users will need to reset their password on first login. Acceptable trade-off given the small user base.

### Game Data

The migration script reads from PostgreSQL and writes to Convex:

```typescript
// scripts/migrateToConvex.ts
// 1. Migrate users → userProfiles
// 2. Migrate user_statistics → userStatistics
// 3. Migrate difficulty_completions → difficultyCompletions
// 4. Migrate unlocked_items → unlockedItems
// 5. Migrate combination_usage → combinationUsage
// 6. Migrate charm_usage → charmUsage
// 7. Migrate consumable_usage → consumableUsage
// 8. Migrate completed_games → completedGames (summary only, drop JSONB blob)
// 9. Migrate active game_saves:
//    For each save:
//      a. Deserialize JSONB blob (using existing deserializeGameState)
//      b. DECOMPOSE nested GameState into flat records
//      c. Insert game, worlds, levels, rounds, dice, charms, consumables,
//         blessings, maps (and shop if in shop phase)
//      d. Set game.currentWorldId, game.currentLevelId, game.currentRoundId pointers
```

The decomposition step is the interesting one — this is where the old nested structure finally becomes flat. Each active save gets one `game` record plus one or more worlds/levels/rounds/etc.

---

## Out of Scope

- **New game content**: No new charms, consumables, dice types, materials, worlds, or game mechanics. The game should play identically before and after.
- **Full multiplayer gameplay**: Shared game state, turn-taking, and multiplayer balance are separate projects. This migration gives you the infrastructure.
- **Mobile native app**: Convex makes this easier in the future, but not now.
- **Performance optimization**: The "game gets laggy with 10+ dice" issue is game logic, not backend. Tackle separately.
- **CLI on Convex**: CLI stays local-only.
- **UI redesign**: Components keep their structure; only data sources change.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Flattening breaks existing game logic | Every game action fails | Phase 1 ships flat logic alongside the old backend; exhaustive tests before Phase 2 |
| Charm refactor misses edge cases in 50+ charms | Individual charms misbehave | Per-charm regression tests; port charms in small batches with side-by-side output comparison |
| Convex mutation time limit exceeded during scoring | Player action fails | Benchmark in Phase 0; if slow, split into action (compute) + mutation (persist) |
| `Math.random()` deterministic replay issue | Dice rolls behave unpredictably | Validate in Phase 0 proof-of-concept; fall back to Convex actions if needed |
| Reactive queries cause excessive re-renders | UI jank | Fine-grained per-table queries (already designed in); memoize derived values |
| Data migration corrupts active saves | Players lose in-progress games | Maintenance-window migration; verify with checksums; keep Postgres read-only for 30 days |
| Flat logic has more arguments per function | Boilerplate | Helper types (`BankPointsInput`, etc.) make signatures readable; actual call sites are cleaner because there's no more deep navigation |
| Convex pricing at scale | Unexpected costs | Monitor function call volume during development; free tier is generous |

---

## Open Questions

1. **Auth provider**: Convex Auth (built-in, simple) vs Clerk (polished UI, extra dep) vs Auth0?
2. **Scoring preview**: Client-side for instant feedback (ship logic to client) or server-side (consistency)? Leaning client for preview-only, server for authoritative scoring.
3. **Roll history retention**: Keep every roll forever in the `rolls` table, or prune old rolls after level completion? Affects storage but enables analysis/replay.
4. **Optimistic updates scope**: Definitely `roll` and `selectDice`. Probably not `purchase` or `bank`. Need UX calls.
5. **Static content (charm/consumable/world definitions)**: In Convex tables (live-editable) or TypeScript constants (type-safe, versioned)? Leaning constants for now.
6. **Completed game snapshots**: Summary only, or full final state snapshot? Summary is smaller; snapshot enables replay features later.
7. **Guest play**: Allow unauthenticated users to play? If so, with Convex anonymous sessions or local-only state?
8. **Charm state shape per charm**: Should each charm's `state` field be typed? Currently proposed as `Record<string, any>`. Could be a discriminated union keyed by `charmId` for type safety at the cost of boilerplate.

---

## Implementation Phases

The phasing separates independently-shippable work. Each phase is testable end-to-end.

### Phase 0: Proof of Concept (1-2 days)

**Goal**: Validate Convex works for this game's needs before committing.

- [ ] Initialize Convex project
- [ ] Create minimal schema (games, dice, rounds only)
- [ ] Implement `rollDice` mutation using existing logic (accept some rough edges)
- [ ] Verify `Math.random()` inside mutations behaves deterministically
- [ ] Benchmark scoring logic with 10+ dice + multiple charms inside a mutation
- [ ] Validate Convex Auth flow (sign up, sign in, read user)

**Deliverable**: Go/no-go decision on Convex. Document any surprises.

---

### Phase 1: Flatten the Game Logic (Still on Express) — 1-2 weeks

**Goal**: Refactor `src/game/logic/` and types to the flat contract. Ship independently — the app still runs on Express, but game logic is now flat.

- [ ] New flat types: `Game`, `World`, `Level`, `Round`, `Roll`, `Die`, `Charm`, `Consumable`, `Blessing`, `Map`, `Shop`
- [ ] Expand `GamePhase` union to include phase-per-pending-action (e.g. `awaitingDiceSelection`, `awaitingReroll`, `awaitingFlopShield`)
- [ ] Refactor pure functions in `gameActions.ts`, `gameLogic.ts`, `scoring.ts`, `shop.ts`, `tallying.ts`, `flops.ts`, `consumableEffects.ts` to take slices + return patches
- [ ] Refactor charm system:
  - [ ] Define `CharmHooks` interface + registry structure
  - [ ] Port `BaseCharm` → pure hook functions (one PR per rarity tier)
  - [ ] Delete `CharmManager` class; replace with `applyCharm*Effects` functions
  - [ ] Delete `CharmRegistry` class
- [ ] Update `GameAPI.ts` to use flat logic internally while still exposing the nested shape to the web/CLI
- [ ] Update `WebGameManager.ts` to read the flat model and derive UI state in-place
- [ ] Update `serializeGameState` / `deserializeGameState` to work with flat data (simpler — no class reconstruction)
- [ ] Migrate existing JSONB saves to flat JSON structure (server-side one-time migration)
- [ ] Full regression test pass

**Deliverable**: Game runs on Express + Postgres, but internally everything is flat. The "nested game state is a nightmare" problem is solved. Convex migration can proceed in clean steps.

**This phase alone is a significant improvement.** If Convex falls through, you've still massively upgraded the architecture.

---

### Phase 2: Convex Auth & User Profiles — 3-5 days

- [ ] Configure Convex Auth with password provider
- [ ] `userProfiles` table + CRUD mutations
- [ ] Replace `AuthContext` with Convex Auth hooks
- [ ] Update login/register UI
- [ ] Migration script: users → userProfiles
- [ ] Email/in-app communication: existing users reset password on first login

**Deliverable**: Auth runs on Convex. Express auth routes deprecated (but not yet deleted).

---

### Phase 3: Game Creation, Loading, Querying — 1 week

- [ ] Full schema deployment
- [ ] `createGame` mutation (writes to games, worlds, levels, rounds, dice, charms, consumables, blessings, maps)
- [ ] `getGame`, `getCurrentRound`, `getDiceInHand`, `getInventory`, `getAvailableActions` queries
- [ ] `deleteGame` mutation
- [ ] New `useGame` hook
- [ ] Migration script: active game_saves → Convex (JSONB → flat Convex rows)
- [ ] Main menu + game load screen use Convex queries

**Deliverable**: Games exist in Convex. Can create, load, and view state. No gameplay yet.

---

### Phase 4: Gameplay Mutations — 1-2 weeks

- [ ] `roll`, `reroll` mutations
- [ ] `selectAndScoreDice` mutation
- [ ] `bankPoints` mutation
- [ ] `handleFlop`, `useFlopShield` mutations
- [ ] `startNewRound` mutation
- [ ] `advanceToNextLevel`, `tallyLevel` mutations
- [ ] `selectWorld` mutation
- [ ] `endGame` mutation
- [ ] Wire `useGame` hook to mutations
- [ ] Optimistic updates for `roll` and dice selection
- [ ] Remove `WebGameManager`, `ReactGameInterface`, `GameAPI` from web path
- [ ] Full regression test pass

**Deliverable**: Full game loop plays via Convex. `WebGameManager` deleted from the web path (may still exist for CLI).

---

### Phase 5: Shop, Inventory, Consumables — 1 week

- [ ] `generateShop` + shop state queries
- [ ] `purchaseCharm`, `purchaseConsumable`, `purchaseBlessing` mutations
- [ ] `sellCharm`, `sellConsumable` mutations
- [ ] `refreshShop`, `reorderCharm` mutations
- [ ] `useConsumable` + consumable-specific mutations (die selection, side selection)
- [ ] Shop UI uses Convex queries/mutations

**Deliverable**: Shop and inventory fully on Convex.

---

### Phase 6: Stats, Progress & Leaderboard — 3-5 days

- [ ] `saveGameCompletion` mutation + stats update
- [ ] All stats queries (user stats, history, combination/charm/consumable usage, leaderboard)
- [ ] All progress mutations (unlockItem, completeDifficulty)
- [ ] All progress queries (unlocks, completions)
- [ ] Migration script: historical data (completed games, usage, unlocks)
- [ ] Stats/profile/leaderboard UI uses Convex queries

**Deliverable**: All read/write paths on Convex.

---

### Phase 7: Cutover & Cleanup — 2-3 days

- [ ] Run final data migration on production
- [ ] Verify data integrity (row counts, spot-check)
- [ ] Switch all frontend calls to Convex (no more Express)
- [ ] Delete `src/server/*`
- [ ] Delete `src/web/services/WebGameManager.ts`, `ReactGameInterface.ts`, `api.ts`
- [ ] Delete `src/game/api/*`
- [ ] Remove `pg`, `express`, `bcrypt`, `jsonwebtoken`, `socket.io` from `package.json`
- [ ] Update deployment (remove backend deploy; Convex handles backend)
- [ ] Keep PostgreSQL as read-only backup for 30 days

**Deliverable**: Express is gone. Convex is the sole backend.

---

### Phase 8: Multiplayer Foundation (Optional) — 1 week

- [ ] `createRoom`, `joinRoom`, `leaveRoom` mutations
- [ ] `getRoomState`, `getRoomPlayers` reactive queries
- [ ] Room UI with real-time player list
- [ ] `startGame` mutation (shared game creation — design TBD)

**Deliverable**: Multiplayer lobbies work via Convex reactivity. Shared gameplay design documented but not necessarily implemented.

---

### Total Estimate

- **Minimal path** (Phase 0-7): ~5-7 weeks focused effort.
- **With multiplayer foundation** (Phase 0-8): ~6-8 weeks.
- **Phase 1 alone** (if Convex gets postponed): ~1-2 weeks, independently valuable.

---

## Success Criteria

- Zero `gameState.currentWorld.currentLevel.currentRound.X` expressions anywhere in the codebase.
- Zero class instances stored in state; all charms are plain data.
- Zero `pendingAction` Promises; all UI decisions come from `gamePhase`.
- `WebGameState` type deleted.
- `src/server/` directory deleted.
- `WebGameManager`, `ReactGameInterface`, `GameAPI` deleted from web path.
- All game actions are Convex mutations; all reads are Convex queries.
- Save/load works without manual `serializeGameState` / `deserializeGameState`.
- Game plays identically to pre-migration (verified by regression tests + manual play-through on each difficulty).

---

## References

- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth](https://docs.convex.dev/auth)
- [Convex Schema Design](https://docs.convex.dev/database/schemas)
- [Convex Reactive Queries](https://docs.convex.dev/functions/query-functions)
- [Redux Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape) — the canonical article on why flat state wins
- [Entity-Component-System pattern](https://en.wikipedia.org/wiki/Entity_component_system) — the extreme version of flat state used in most game engines
- `docs/specs/completed/database-and-simple-auth.md` — current database spec
- `docs/architecture/game-state-structure.md` — current state architecture
- `src/game/types.ts` — current type definitions
- `src/game/logic/charms/` — current class-based charm implementation
- `src/server/utils/gameStateSerialization.ts` — current serialization (will be deleted)
