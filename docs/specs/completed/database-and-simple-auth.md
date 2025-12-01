# Database and Simple Authentication Specification

## Overview

This specification covers the implementation of a user profile/login system with database persistence. The MVP focuses on basic authentication and user management, with game saves and statistics tracking to be added in later phases.

## Goals

1. **Allow anonymous play**: Anyone can play without logging in
2. **User authentication**: Login/register system for saving progress
3. **Database persistence**: Store user data, game saves, and statistics
4. **Statistics tracking**: Track wins/losses, combinations, items across games
5. **Save/load games**: Resume games after closing the window

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_guest BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### Game Saves Table (Future Phase)

```sql
CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_state JSONB NOT NULL,
  dice_set_index INTEGER NOT NULL,

  -- Generated columns for fast queries (auto-synced with game_state)
  difficulty VARCHAR(20) GENERATED ALWAYS AS (game_state->'config'->>'difficulty') STORED,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_saves_user_active ON game_saves(user_id, is_active);
CREATE INDEX idx_game_saves_difficulty ON game_saves(difficulty);
```

### Completed Games Table (Future Phase)

```sql
CREATE TABLE completed_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Summary (for fast queries)
  difficulty VARCHAR(20) NOT NULL,
  dice_set_index INTEGER NOT NULL,
  end_reason VARCHAR(10) NOT NULL,
  final_score INTEGER NOT NULL,
  levels_completed INTEGER NOT NULL,
  total_rounds INTEGER NOT NULL,

  -- Full state (for detailed analysis)
  game_state JSONB NOT NULL,
  game_history JSONB NOT NULL,

  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_completed_games_user ON completed_games(user_id, completed_at DESC);
CREATE INDEX idx_completed_games_stats ON completed_games(user_id, end_reason, difficulty);
```

### User Statistics Table (Future Phase)

```sql
CREATE TABLE user_statistics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Game outcomes
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  quits INTEGER DEFAULT 0,

  -- Scores
  total_score BIGINT DEFAULT 0,
  highest_score INTEGER DEFAULT 0,

  -- Progression
  total_levels_completed INTEGER DEFAULT 0,
  highest_level_reached INTEGER DEFAULT 0,

  -- Gameplay stats
  total_rounds_played INTEGER DEFAULT 0,
  total_hot_dice_count INTEGER DEFAULT 0,

  -- Flexible JSONB for frequently-updated data
  combination_usage JSONB DEFAULT '{}',
  item_purchases JSONB DEFAULT '{}',

  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Difficulty Unlocks Table (Future Phase)

```sql
CREATE TABLE difficulty_unlocks (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dice_set_index INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, dice_set_index, difficulty)
);

CREATE INDEX idx_unlocks_user ON difficulty_unlocks(user_id);
```

## Design Decisions

### Normalization vs Denormalization

**Hybrid Approach:**

- Store full `GameState` as JSONB (single source of truth)
- Denormalize frequently-queried metadata (difficulty, is_active) for fast queries
- Use PostgreSQL generated columns where possible for automatic sync
- Store aggregated statistics for fast access, with periodic reconciliation

**Rationale:**

- Fast queries on metadata without parsing JSON
- Single source of truth in GameState
- Automatic sync via generated columns
- Balance between query performance and data integrity

### Statistics: Stored vs Calculated

**Stored (Denormalized):**

- Frequently accessed: wins, losses, total_score, highest_score
- Updated immediately after game completion
- Fast reads for profile/leaderboard display

**Calculated (Normalized):**

- Detailed statistics: average score, win rate by difficulty
- Calculated on-demand from `completed_games` table
- Always accurate, no sync issues

**Reconciliation:**

- Nightly job recalculates aggregated stats from raw data
- Prevents drift from failed updates

### Table Structure Efficiency

**JSONB for Flexible Data:**

- `combination_usage`: JSONB column in `user_statistics`
- `item_purchases`: JSONB column in `user_statistics`
- Efficient for small, frequently-updated datasets
- Easy to add new combinations/items without schema changes

**Separate Tables for Complex Queries:**

- `difficulty_unlocks`: Separate table for complex unlock queries
- Better for queries like "users who unlocked diamond on set X"

## Authentication

### Approach: Email/Password (MVP)

- Simple email/password authentication
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens for session management
- 7-day token expiration

**Future:** Can add OAuth (Google, GitHub) later

### Security

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- HTTPS required in production
- Input validation and sanitization
- Rate limiting on auth endpoints (future)

## Game State Serialization

### Challenge

`GameState` contains:

- Data (serializable): numbers, strings, arrays, objects
- Functions (non-serializable): charm filter functions, CharmManager instances

### Solution

**Serialization:**

- Strip functions from charms before saving
- Store only data fields (id, name, description, etc.)
- Serialize entire GameState to JSONB

**Deserialization:**

- Load JSON data
- Reconstruct CharmManager from charm data
- Rebuild charm instances with their functions

**Pattern:**

```typescript
// Serialize: Remove functions
function serializeGameState(state: GameState): string {
  const serializable = {
    ...state,
    charms: state.charms.map((c) => ({
      id: c.id,
      name: c.name,
      // ... data only, no functions
    })),
  };
  return JSON.stringify(serializable);
}

// Deserialize: Rebuild functions
function deserializeGameState(
  json: string,
  charmManager: CharmManager
): GameState {
  const data = JSON.parse(json);
  data.charms = data.charms.map((charmData) => {
    const charmClass = charmManager.getCharmClass(charmData.id);
    return new charmClass(charmData);
  });
  return data as GameState;
}
```

## MVP Scope

### Phase 1: Database & Authentication (Current)

**Database:**

- ✅ Neon PostgreSQL connection
- ✅ Users table
- ✅ Migration system

**Authentication:**

- ✅ User registration
- ✅ User login
- ✅ JWT token generation
- ✅ Protected routes (get current user)
- ✅ Password hashing

**API Endpoints:**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Phase 1.5: Frontend Integration (Next)

**Auth Context & State Management:**

- React context for global auth state
- Token storage in localStorage
- Auto-refresh token on app load
- Auth state persistence across page refreshes

**UI Components:**

- Login modal/page component
- Register modal/page component
- User profile display component
- Logout functionality
- Auth status indicator (logged in/out)

**API Service Layer:**

- Centralized API client with base URL
- Automatic token injection in request headers
- Error handling for auth failures (401, 403)
- Token refresh logic

**Protected Routes:**

- Route guards for authenticated pages
- Redirect to login if not authenticated
- Optional: Guest mode (play without login)

**User Experience:**

- Smooth login/register flow
- Error message display
- Loading states during auth operations
- Remember me functionality (optional)

### Phase 2: Game Saves (Future)

- Game saves table
- Save game endpoint
- Load game endpoint
- Auto-save on level complete
- Frontend save/load UI

### Phase 3: Statistics Tracking (Future)

- Completed games table
- Statistics aggregation
- Statistics query endpoints
- Statistics display UI

### Phase 4: Unlock System (Future)

- Difficulty unlocks table
- Unlock checking logic
- Unlock display in UI

## Technical Stack

### Backend

- **Database**: Neon PostgreSQL (serverless)
- **ORM/Client**: `pg` (node-postgres)
- **Authentication**:
  - `bcrypt` for password hashing
  - `jsonwebtoken` for JWT tokens
- **Server**: Express.js (existing)
- **Validation**: Manual validation (can add `zod` later)

### Frontend

**Phase 1.5 (Current):**

- React context for auth state (`AuthContext`)
- Custom hooks (`useAuth`, `useApi`)
- Local storage for JWT token
- API service layer with token injection
- Login/Register UI components
- Protected route guards

**Future Phases:**

- React hooks for save/load (`useGameSave`, `useGameLoad`)
- Statistics display components
- Unlock system UI

## Database Connection

**Connection String:**

```
postgresql://neondb_owner:npg_H3Tb2GuMKifC@ep-long-recipe-advm1vpl-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environment Variables:**

- `DATABASE_URL` - Full connection string
- `JWT_SECRET` - Secret key for JWT signing (change in production!)
- `PORT` - Server port (default: 5173)
- `NODE_ENV` - Environment (development/production)

## File Structure

```
src/server/
  ├── db.ts                    # Database connection pool
  ├── migrations/
  │   ├── 001_create_users_table.sql
  │   └── runMigrations.ts     # Migration runner
  ├── auth/
  │   └── authUtils.ts         # Password hashing, JWT utilities
  ├── routes/
  │   └── auth.ts              # Authentication routes
  └── server.ts                # Main server file (updated)
```

## API Specifications

### POST /api/auth/register

**Request:**

```json
{
  "username": "testuser",
  "email": "test@example.com", // Optional
  "password": "password123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token-here"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Username already exists"
}
```

**Validation:**

- Username: 3-50 characters, required
- Email: Valid email format, optional
- Password: Minimum 6 characters, required

### POST /api/auth/login

**Request:**

```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "jwt-token-here"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

### GET /api/auth/me

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-01T00:00:00Z"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

## Implementation Steps

### Phase 1: Backend (✅ Complete)

1. **Install Dependencies**

   - `pg`, `@types/pg`
   - `bcrypt`, `@types/bcrypt`
   - `jsonwebtoken`, `@types/jsonwebtoken`
   - `dotenv`

2. **Database Setup**

   - Create `db.ts` with connection pool
   - Create migration system
   - Create users table migration

3. **Authentication Utilities**

   - Password hashing functions
   - JWT token generation/verification

4. **Authentication Routes**

   - Register endpoint
   - Login endpoint
   - Get current user endpoint

5. **Server Integration**

   - Update server.ts to use database
   - Run migrations on startup
   - Add auth routes

6. **Environment Configuration**
   - Create `.env` file
   - Add `.env.example` template
   - Update `.gitignore`

### Phase 1.5: Frontend Integration (Next)

1. **API Service Layer**

   - Create `src/web/services/api.ts` with base API client
   - Add token injection middleware
   - Handle 401 errors (auto-logout on token expiry)

2. **Auth Context**

   - Create `src/web/contexts/AuthContext.tsx`
   - Manage auth state (user, token, isAuthenticated)
   - Provide login, register, logout functions
   - Auto-load token from localStorage on mount

3. **Auth Hooks**

   - Create `src/web/hooks/useAuth.ts` (wrapper around AuthContext)
   - Create `src/web/hooks/useApi.ts` (API calls with auth)

4. **UI Components**

   - Create `src/web/ui/auth/LoginModal.tsx`
   - Create `src/web/ui/auth/RegisterModal.tsx`
   - Create `src/web/ui/auth/UserProfile.tsx` (optional)
   - Add auth buttons to main menu

5. **Route Protection**

   - Add route guards for authenticated routes
   - Redirect to login if not authenticated
   - Handle guest mode (optional)

6. **Integration**
   - Add login/register buttons to main menu
   - Show user info when logged in
   - Add logout functionality

## Testing

**Manual Testing:**

```bash
# Register
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get current user
curl -X GET http://localhost:5173/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Future Considerations

### Custom Dice Sets

If implementing custom dice set builder (from `docs/design/ideas.md`):

- Store custom configuration in `game_saves.custom_dice_config JSONB`
- Store `starting_credits` and `credits_spent`
- May need separate table for saved dice set templates

### Session-Based Statistics (Quick Win)

Before full database implementation:

- Track statistics in React state/context
- Store in localStorage for persistence
- Display stats in modal/page
- No backend needed
- Can migrate to database later

## Open Questions

1. Should we support multiple save slots per user? (MVP: 1 active save)
2. Auto-save frequency? (Suggested: On level complete)
3. Guest user handling? (Store in `users` table with `is_guest=true` or separate system?)
4. Password reset flow? (Not in MVP, add later)
5. Email verification? (Not in MVP, add later)
