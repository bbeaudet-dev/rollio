# Rollio Architecture & Data Flow Diagrams

> **Note:** To update the game name everywhere (docs, code, UI), use the update-name script: `npm run update-name -- <NewName>`. All name variants are defined in `src/game/nameConfig.ts`.

## Game State Relationships

```mermaid
classDiagram
    class GameState {
        +isActive: boolean
        +won?: boolean
        +money: number
        +diceSet: Die[]
        +charms: Charm[]
        +consumables: Consumable[]
        +blessings: Blessing[]
        +baseLevelRerolls: number
        +baseLevelBanks: number
        +charmSlots: number
        +consumableSlots: number
        +settings: GameSettings
        +config: GameConfig
        +gamePhase: GamePhase
        +gameMap?: GameMap
        +currentWorld?: WorldState
        +shop?: ShopState
        +history: GameHistory
    }

    class GameSettings {
        +sortDice: string
        +gameSpeed: string
        +optimizeRollScore: boolean
    }

    class GameConfig {
        +diceSetConfig: DiceSetConfig
        +penalties: object
    }

    class WorldState {
        +worldId: string
        +worldNumber: number
        +levelConfigs: LevelConfig[]
        +worldEffects: WorldEffect[]
        +currentLevel: LevelState
    }

    class LevelState {
        +levelNumber: number
        +levelThreshold: number
        +isMiniboss?: boolean
        +isMainBoss?: boolean
        +levelEffects?: LevelEffect[]
        +pointsBanked: number
        +rerollsRemaining?: number
        +banksRemaining?: number
        +flopsThisLevel: number
        +currentRound?: RoundState
    }

    class RoundState {
        +roundNumber: number
        +isActive: boolean
        +flopped: boolean
        +roundPoints: number
        +diceHand: Die[]
        +hotDiceCounter: number
        +forfeitedPoints: number
        +rollHistory: RollState[]
    }

    class RollState {
        +rollNumber: number
        +diceHand: Die[]
        +rollPoints: number
        +combinations: ScoringCombination[]
    }

    class ShopState {
        +availableCharms: Charm[]
        +availableConsumables: Consumable[]
        +availableBlessings: Blessing[]
    }

    class GameHistory {
        +combinationCounters: CombinationCounters
        +consumableCounters: ConsumableCounters
        +charmCounters: CharmCounters
        +blessingCounters: BlessingCounters
        +highScoreSingleRoll: number
        +highScoreBank: number
    }

    class Charm {
        +id: string
        +name: string
        +description: string
        +active: boolean
        +rarity: CharmRarity
    }

    class Consumable {
        +id: string
        +name: string
        +description: string
        +uses: number
        +rarity: string
    }

    class Blessing {
        +id: string
        +tier: 1|2|3
        +effect: BlessingEffect
    }

    class Die {
        +id: string
        +sides: number
        +allowedValues: number[]
        +material: DiceMaterialType
        +rolledValue: number
    }

    GameState --> GameSettings : contains
    GameState --> GameConfig : contains
    GameState --> GameMap : contains
    GameState --> WorldState : contains
    GameState --> ShopState : contains
    GameState --> GameHistory : contains
    GameState --> Charm : has many
    GameState --> Consumable : has many
    GameState --> Blessing : has many
    GameState --> Die : has many
    WorldState --> LevelState : contains
    LevelState --> RoundState : contains
    RoundState --> RollState : has many
```

## CLI Interaction Flow

```mermaid
flowchart TD
    A[Welcome to Rollio!] --> B[Start New Game? y/n]
    B -->|n| C[Goodbye!]
    B -->|y| D[--- Round X ---]
    D --> E[Roll #Y: Display Dice Values]
    E --> F[Select dice values to score]
    F --> G{Valid Selection?}
    G -->|No| H[Invalid selection message]
    H --> F
    G -->|Yes| I[Show combinations and points]
    I --> J[Bank points or reroll?]
    J -->|Bank| K[Round ends, add to game score]
    J -->|Reroll| L[Continue with remaining dice]
    K --> M{Game Score >= 10000?}
    M -->|Yes| N[Congratulations! You win!]
    M -->|No| O[Start next round?]
    O -->|Yes| D
    O -->|No| P[Game over - final stats]
    L --> E
```

## Scoring Engine Data Flow

```mermaid
flowchart LR
    A["Dice Array [2,1,5,3,1,4]"] --> B[countDice]
    B --> C["Count Array [0,2,1,1,1,1]"]
    C --> D[getScoringCombinations]

    D --> E{Check Straight?}
    E -->|No| F{Check Three Pairs?}
    F -->|No| G{Check Two Triplets?}
    G -->|No| H{Check 6 of a Kind?}
    H -->|No| I{Check 5 of a Kind?}
    I -->|No| J{Check 4 of a Kind?}
    J -->|No| K{Check 3 of a Kind?}
    K -->|Yes| L["Add 3-of-a-kind [2,2,2] = 200 pts"]
    K -->|No| M{Check Singles?}
    M -->|Yes| N["Add single_one [1] = 100 pts"]

    L --> O[Combinations Array]
    N --> O
    O --> P[isValidScoringSelection]
    P --> Q["Total Points: 300"]
```

## State Transitions

### Game State Transitions

```mermaid
stateDiagram-v2
    [*] --> GameStart
    GameStart --> Round1: Initialize
    Round1 --> Round2: Bank Points
    Round2 --> Round3: Bank Points
    Round3 --> RoundN: Bank Points
    RoundN --> GameEnd: Win Condition
    RoundN --> GameEnd: Quit
    GameEnd --> [*]
```

### Round State Transitions

```mermaid
stateDiagram-v2
    [*] --> RoundStart: Roll all dice
    RoundStart --> RollDice: Roll
    RollDice --> FlopDetected: No scoring combinations
    RollDice --> ValidRoll: Has scoring combinations
    ValidRoll --> UserSelectsDice: Display options
    UserSelectsDice --> UserFlops: Invalid selection
    UserSelectsDice --> UserScores: Valid selection
    UserScores --> UpdateRoundPoints: Calculate points
    UpdateRoundPoints --> HotDice: All dice scored
    UpdateRoundPoints --> BankPoints: User chooses bank
    UpdateRoundPoints --> Reroll: User chooses reroll
    HotDice --> ResetHand: Full dice set
    ResetHand --> RollDice
    Reroll --> RollDice
    BankPoints --> RoundEnd: Add to game score
    FlopDetected --> RoundEnd: Forfeit points
    UserFlops --> RoundEnd: Forfeit points
    RoundEnd --> [*]
```

### Roll State Transitions

```mermaid
stateDiagram-v2
    [*] --> RollStart
    RollStart --> DisplayDice: Show current roll
    DisplayDice --> NoScoring: No combinations
    DisplayDice --> ScoringAvailable: Has combinations
    NoScoring --> Flop: Automatic flop
    ScoringAvailable --> UserInput: Prompt for selection
    UserInput --> InvalidSelection: Invalid input
    UserInput --> ValidSelection: Valid input
    InvalidSelection --> UserInput: Re-prompt
    ValidSelection --> CalculatePoints: Process selection
    CalculatePoints --> AllDiceScored: Hot dice
    CalculatePoints --> SomeDiceScored: Partial scoring
    AllDiceScored --> HotDice: Reset to full set
    SomeDiceScored --> UpdateHand: Remove scored dice
    HotDice --> Bank: User choice
    UpdateHand --> Bank: User choice
    HotDice --> Reroll: User choice
    UpdateHand --> Reroll: User choice
    Bank --> EndRound: Round complete
    Reroll --> NextRoll: Continue round
    Flop --> EndRound: Round complete
    EndRound --> [*]
```

## Hot Dice Handling

```mermaid
flowchart TD
    A[Start: 6 dice] --> B[User scores 4 dice]
    B --> C[2 dice remain]
    C --> D[Reroll: 2 dice]
    D --> E[User scores 2 dice]
    E --> F[0 dice remain]
    F --> G[HOT DICE!]
    G --> H[Reset to 6 dice]
    H --> I[Continue same round]
    I --> A
```

## Flop Detection Flow

```mermaid
flowchart TD
    A[Roll Dice] --> B[getScoringCombinations]
    B --> C{Any combinations found?}
    C -->|No| D[Automatic Flop]
    C -->|Yes| E[Continue normal flow]
    D --> F[Update consecutiveFlopCount]
    F --> G{Count >= 3?}
    G -->|Yes| H[Apply -1000 penalty]
    G -->|No| I[Continue]
    H --> J[Forfeit round points]
    I --> J
    J --> K[End round]
```

## Three-Flop Penalty System

```mermaid
flowchart TD
    A[Flop #1] --> B[Consecutive count = 1]
    B --> C[Flop #2]
    C --> D[Consecutive count = 2]
    D --> E[Warning message]
    E --> F[Flop #3]
    F --> G[Consecutive count = 3]
    G --> H[-1000 points penalty]
    H --> I{Bank points?}
    I -->|Yes| J[Reset count to 0]
    I -->|No| K[Continue with penalty]
    J --> L[Continue playing]
    K --> L
```

## File Architecture

```mermaid
graph TD
    A[src/] --> B[game/]
    A --> C[web/]
    A --> D[cli/]
    A --> E[server/]

    B --> B1[types.ts]
    B --> B2[api/GameAPI.ts]
    B --> B3[logic/scoring.ts]
    B --> B4[logic/gameActions.ts]
    B --> B5[logic/charmSystem.ts]
    B --> B6[logic/mapGeneration.ts]
    B --> B7[data/charms.ts]
    B --> B8[data/consumables.ts]

    C --> C1[ui/game/]
    C --> C2[ui/menu/]
    C --> C3[ui/single-player/]
    C --> C4[hooks/useGameState.ts]
    C --> C5[services/WebGameManager.ts]

    C1 --> C1A[Game.tsx]
    C1 --> C1B[board/Board.tsx]
    C1 --> C1C[board/dice/DiceDisplay.tsx]
    C1 --> C1D[WorldMap.tsx]

    C --> C6[ui/multiplayer/]

    D --> D1[cli.ts]
    D --> D2[cliInterface.ts]

    E --> E1[server.ts]

    F[docs/] --> F1[specs/]
    F --> F2[architecture/]
    F --> F3[agents/]

    G[Root] --> A
    G --> F
    G --> H[package.json]
    G --> I[tsconfig.json]
    G --> J[README.md]
```

## Data Organization & Access Patterns

```mermaid
flowchart TD
    A[GameState] --> B[Game-Wide State]
    A --> C[LevelState]
    A --> D[GameConfig]
    A --> E[GameHistory]

    B --> B1[isActive, endReason]
    B --> B2[money, diceSet]
    B --> B3[charms, consumables, blessings]
    B --> B4[baseLevelRerolls, baseLevelBanks]
    B --> B5[charmSlots, consumableSlots]
    B --> B6[settings: GameSettings]
    B --> B7[gamePhase, gameMap]

    C --> C1[worldId, worldNumber]
    C --> C2[levelConfigs, worldEffects]
    C --> C3[currentLevel: LevelState]

    C3 --> C4[levelNumber, pointsBanked]
    C3 --> C5[levelThreshold]
    C3 --> C6[rerollsRemaining, banksRemaining]
    C3 --> C7[currentRound?: RoundState]

    D --> D1[diceSetConfig: DiceSetConfig]
    D --> D2[difficulty]

    E --> E1[combinationCounters]
    E --> E2[consumableCounters, charmCounters]
    E --> E3[highScoreSingleRoll, highScoreBank]

    F[Access Patterns] --> G[gameState.isActive]
    F --> H[gameState.money]
    F --> I[gameState.charms]
    F --> J[gameState.currentWorld?.currentLevel.pointsBanked]
    F --> K[gameState.currentWorld?.currentLevel.currentRound]
    F --> L[gameState.settings.sortDice]
    F --> M[gameState.history.highScoreSingleRoll]
```

## Component Data Flow

```mermaid
flowchart LR
    A[useGameState Hook] --> B[Organized Data Groups]
    B --> C[board: dice, canRoll, canBank]
    B --> D[gameState: full game state]
    B --> E[roundState: current round state]
    B --> F[inventory: charms, consumables, blessings]
    B --> G[rollActions: handleRollDice, handleDiceSelect]
    B --> H[gameActions: handleBank, startNewGame, selectWorld]
    B --> I[inventoryActions: handleConsumableUse]
    B --> J[shopActions: handlePurchaseCharm, etc]

    K[Game Component] --> L[Receives Logical Groups]
    L --> M[rollActions, gameActions, inventoryActions]
    L --> N[board, gameState, roundState, inventory]
    L --> O[isInShop, shopActions]
    L --> P[isInMapSelection, gameActions.selectWorld]
```

## Data Flow Summary

```mermaid
flowchart LR
    A[Configuration] --> B[Game State]
    B --> C[Round State]
    C --> D[Roll State]

    E[User Input] --> F[Validation]
    F --> G[Scoring]
    G --> H[State Update]

    I[State Changes] --> J[Display Updates]
    J --> K[User Feedback]

    L[Game Events] --> M[Statistics Tracking]
    M --> N[Final Summary]
```

The architecture follows a clean separation of concerns with:

- **Configuration-driven** game rules
- **Type-safe** state management
- **Modular** scoring engine
- **Extensible** utility functions
- **Clear** data flow patterns
- **Organized** data structure with logical groupings
- **Component-friendly** prop interfaces
