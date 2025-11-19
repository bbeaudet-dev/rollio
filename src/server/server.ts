import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import { runMigrations } from './migrations/runMigrations';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';

dotenv.config();

const app = express();
const server = createServer(app);

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? true  // Allow all origins in production for now
  : ["http://localhost:3000", "http://localhost:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5173;

// Middleware
app.use(express.json());

// CORS middleware for Express routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'production' || (Array.isArray(allowedOrigins) && origin && allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize database and run migrations
async function initializeDatabase() {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Room management
interface Room {
  id: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  activePlayerIds: string[]; // Players who were in the room when game started
  hostId: string; // Who can start the game
  createdAt: Date;
}

interface Player {
  id: string;
  username: string;
  socketId: string;
  gameScore: number;
  currentRound: number;
  hotDiceCounterRound: number;
  roundPoints: number;
  isActive: boolean;
  lastAction: string;
  status: 'lobby' | 'in_game' | 'spectating';
}

const rooms = new Map<string, Room>();

// Generate room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Health check endpoint
app.get('/health', (req, res) => {
  const healthInfo = {
    status: 'ok',
    message: 'Rollio backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    activeRooms: rooms.size,
    totalPlayers: Array.from(rooms.values()).reduce((total, room) => total + room.players.length, 0),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  res.json(healthInfo);
});

// API endpoint to start a new game
app.post('/api/game/start', (req, res) => {
  try {
    // Initialize game state
    res.json({ success: true, message: 'Game started' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start game' });
  }
});

// API endpoint to process game action
app.post('/api/game/action', (req, res) => {
  try {
    const { action, data } = req.body;
    // Process game action
    res.json({ success: true, message: 'Action processed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process action' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create_room', (username: string, callback) => {
    console.log('Creating room for:', username, 'socket:', socket.id);
    
    try {
      const roomCode = generateRoomCode();
      console.log('Generated room code:', roomCode);
      
      const player: Player = {
        id: socket.id,
        username,
        socketId: socket.id,
        gameScore: 0,
        currentRound: 0,
        hotDiceCounterRound: 0,
        roundPoints: 0,
        isActive: true,
        lastAction: 'joined',
        status: 'lobby'
      };

      const room: Room = {
        id: roomCode,
        players: [player],
        gameState: 'waiting',
        activePlayerIds: [],
        hostId: socket.id,
        createdAt: new Date()
      };

      rooms.set(roomCode, room);
      socket.join(roomCode);
      
      console.log(`Room ${roomCode} created by ${username}`);
      console.log('Current rooms:', Array.from(rooms.keys()));
      console.log('Sending callback with:', { success: true, roomCode, player });
      
      // Ensure callback is called
      if (typeof callback === 'function') {
        callback({ success: true, roomCode, player });
      } else {
        console.error('Callback is not a function:', callback);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Failed to create room' });
      }
    }
  });

  // Join an existing room
  socket.on('join_room', (roomCode: string, username: string, callback) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.players.length >= 4) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    const player: Player = {
      id: socket.id,
      username,
      socketId: socket.id,
      gameScore: 0,
      currentRound: 0,
      hotDiceCounterRound: 0,
      roundPoints: 0,
      isActive: true,
      lastAction: 'joined',
      status: 'lobby'
    };

    room.players.push(player);
    socket.join(roomCode);
    
    // Notify all players in the room
    io.to(roomCode).emit('player_joined', player);
    
    console.log(`${username} joined room ${roomCode}`);
    callback({ success: true, room, player });
  });

  // Update player state (score, round, etc.)
  socket.on('update_player_state', (roomCode: string, playerState: Partial<Player>) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    // Update player state
    room.players[playerIndex] = { ...room.players[playerIndex], ...playerState };
    
    // Broadcast to all players in the room
    io.to(roomCode).emit('player_state_updated', room.players[playerIndex]);
  });

  // Start game (only host can do this)
  socket.on('start_game', (roomCode: string, callback) => {
    const room = rooms.get(roomCode);
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    // Check if this player is the host
    if (room.hostId !== socket.id) {
      callback({ success: false, error: 'Only the host can start the game' });
      return;
    }

    // Log current player IDs as active players
    room.activePlayerIds = room.players.map(p => p.id);
    room.gameState = 'playing';

    console.log(`Game started in room ${roomCode} with ${room.activePlayerIds.length} active players`);

    // Notify all players in the room that the game has started
    io.to(roomCode).emit('game_started', {
      roomCode,
      activePlayerIds: room.activePlayerIds,
      gameState: room.gameState
    });

    callback({ success: true, room });
  });



  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all rooms they're in
    for (const [roomCode, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        // Notify remaining players
        io.to(roomCode).emit('player_left', player);
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted (empty)`);
        }
        
        break;
      }
    }
  });
});

// Start server
async function startServer() {
  await initializeDatabase();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);

export default app; 