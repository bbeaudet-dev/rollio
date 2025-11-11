# Multiplayer Specification

## Overview

This specification outlines the implementation of multiplayer functionality for Rollio, designed to be built in phases to avoid rebuilding work and ensure each component serves both multiplayer and roguelike features.

## Phase 1: Foundation

### 1.1 Web Frontend Implementation

**Priority**: High - Required for all subsequent phases

#### Core Requirements

- **React-based web interface** to replace CLI for multiplayer
- **Real-time capable** - designed for WebSocket connections
- **Responsive design** - mobile-friendly for accessibility
- **Game state visualization** - clear display of all game elements

#### Key Components

- **Game Board**: Main dice display with real-time updates
- **Player Interface**: Dice selection, scoring, banking controls
- **Game Status**: Round info, scores, turn indicators
- **Lobby System**: Room creation, joining, player list
- **Responsive Layout**: Works on desktop, tablet, mobile

#### Technical Requirements

- **TypeScript** for type safety
- **State Management**: React Context or Redux for game state
- **WebSocket Ready**: Architecture supports real-time updates
- **Progressive Enhancement**: Works offline for single-player

### 1.2 Game State Serialization

**Priority**: High - Required for multiplayer sync

#### Requirements

- **JSON-serializable game state** for network transmission
- **Delta updates** - only send changed state to reduce bandwidth
- **State validation** - ensure received state is valid
- **Version compatibility** - handle different game versions

#### Implementation

```typescript
interface SerializableGameState {
  gameId: string;
  version: string;
  players: PlayerState[];
  currentRound: RoundState;
  gameConfig: GameConfig;
  timestamp: number;
}
```

## Phase 2: Basic Multiplayer

### 2.1 Independent Play Multiplayer Core

**Priority**: Medium - Core multiplayer experience

#### Game Flow

1. **Lobby Creation**: Host creates room, gets room code
2. **Player Joining**: Players join via room code or direct link
3. **Game Start**: All players ready, game begins with 5 rounds
4. **Independent Play**: Players play simultaneously, trying to get highest score
5. **Live Tracking**: Real-time score and round updates for all players
6. **Game End**: Winner determined after 5 rounds, return to lobby

#### Advantages of Independent Play

- **Simpler Implementation**: No complex turn management
- **Better UX**: Players can play at their own pace
- **Reduced Waiting**: No waiting for other players' turns
- **Easier State Sync**: Only need to sync scores and round numbers

#### Player Management

- **Player Identification**: Username/display name system
- **Ready States**: Players indicate when ready to start
- **Disconnection Handling**: Graceful handling of player drops
- **Spectator Mode**: Allow watching without playing

#### Real-Time Features

- **Live Score Tracking**: Real-time score updates for all players
- **Round Progress**: See other players' current round number
- **Game Status**: Live updates on who's banking, rolling, etc.
- **Chat System**: Basic text chat between players (Phase 2.2)

### 2.2 Network Architecture

**Priority**: Medium - Backend infrastructure

#### WebSocket Implementation

- **Connection Management**: Handle connect/disconnect events
- **Message Protocol**: Structured message format for all game events
- **Room Management**: Create, join, leave, delete rooms
- **State Synchronization**: Keep all clients in sync

#### Message Types

```typescript
interface GameMessage {
  type:
    | "player_join"
    | "player_leave"
    | "score_update"
    | "round_update"
    | "game_end"
    | "chat";
  playerId: string;
  data: any;
  timestamp: number;
}

interface PlayerState {
  id: string;
  username: string;
  gameScore: number;
  currentRound: number;
  isActive: boolean;
  lastAction: string;
}
```

#### Server Requirements

- **Node.js/Express** backend with WebSocket support
- **Room Management**: Handle multiple concurrent games
- **State Persistence**: Temporary storage for active games
- **Error Handling**: Robust error handling and recovery

## Phase 3: Enhanced Features

### 3.1 Roguelike Integration

**Priority**: Medium - Adds depth to multiplayer

#### Multiplayer Roguelike Features

- **Shared Progression**: Players can see each other's loadouts
- **Competitive Elements**: Compare charm/consumable strategies
- **Tournament Mode**: Bracketed competitions with roguelike progression
- **Leaderboards**: Track performance across multiple games

#### Implementation

- **Loadout Display**: Show other players' charms/consumables
- **Strategy Sharing**: Players can discuss strategies in chat
- **Achievement System**: Unlock achievements in multiplayer
- **Progression Tracking**: Save multiplayer stats and progress

### 3.2 Advanced Multiplayer Features

**Priority**: Low - Polish and engagement features

#### Enhanced Social Features

- **Friend System**: Add friends, invite to games
- **Private Rooms**: Password-protected games
- **Custom Rules**: Host can modify game settings
- **Replay System**: Save and replay interesting games

#### Tournament System

- **Bracket Generation**: Automatic tournament brackets
- **Seeding System**: Rank players for fair matchups
- **Prize System**: Virtual rewards for tournament winners
- **Tournament History**: Track past tournament results

#### Spectator Features

- **Live Spectating**: Watch games without participating
- **Commentary System**: Allow spectators to comment
- **Highlight Reels**: Auto-generate highlights from games
- **Streaming Integration**: Support for streaming platforms

## Implementation Approach

### Component Reuse Strategy

**Reusable Components (90% of existing code):**

- `WebGameManager` - Core game logic and state management
- `GameBoard` - Dice display and game controls
- `GameConfigSelector` - Game setup and configuration
- All game state management, scoring logic, charms, consumables

**Components Requiring Modification:**

- `App.tsx` - Add multiplayer mode selection and routing
- `useGameState` - Add WebSocket state synchronization
- Server - Add WebSocket support and room management

**New Components Needed:**

- Multiplayer lobby/room system
- Live scoreboard component
- WebSocket connection management
- Room creation/joining interface

### Development Phases

1. **Phase 1.1**: Add multiplayer button to home page
2. **Phase 1.2**: Implement WebSocket server with socket.io
3. **Phase 1.3**: Create room management system
4. **Phase 1.4**: Add live scoreboard and state synchronization

## Technical Implementation Details

### Backend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │   Game Server   │
│                 │    │                 │    │                 │
│  React + WS     │◄──►│  React Native   │◄──►│  Node.js + WS   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Database      │
                                              │                 │
                                              │  PostgreSQL/    │
                                              │  Redis Cache    │
                                              └─────────────────┘
```

### Database Schema

```sql
-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  created_at TIMESTAMP,
  last_seen TIMESTAMP
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY,
  room_code VARCHAR(10) UNIQUE,
  status VARCHAR(20),
  created_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Game participants
CREATE TABLE game_participants (
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  position INTEGER,
  final_score INTEGER,
  PRIMARY KEY (game_id, player_id)
);
```

### Security Considerations

- **Input Validation**: Validate all client inputs
- **Rate Limiting**: Prevent spam and abuse
- **Authentication**: Optional user accounts for persistent features
- **Anti-Cheat**: Basic server-side validation of game actions

## Development Timeline

### Phase 1 (4-6 weeks)

- Week 1-2: Web frontend core implementation
- Week 3-4: Game state serialization and validation
- Week 5-6: Testing and refinement

### Phase 2 (6-8 weeks)

- Week 1-2: WebSocket server implementation
- Week 3-4: Basic multiplayer game flow
- Week 5-6: Player management and room system
- Week 7-8: Testing and bug fixes

### Phase 3 (8-12 weeks)

- Week 1-4: Roguelike integration
- Week 5-8: Advanced multiplayer features
- Week 9-12: Polish, testing, and optimization

## Success Metrics

- **Player Engagement**: Average session length, return rate
- **Technical Performance**: Latency, uptime, error rates
- **User Satisfaction**: Player feedback, feature usage
- **Scalability**: Number of concurrent games supported

## Future Considerations

- **Mobile App**: Native mobile application
- **AI Opponents**: Computer players for practice
- **Cross-Platform**: Support for different devices
- **Internationalization**: Multi-language support
- **Accessibility**: Screen reader support, keyboard navigation
