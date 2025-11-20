import { Router, Request, Response } from 'express';
import { query } from '../db';
import { verifyToken } from '../auth/authUtils';
import { serializeGameState, deserializeGameState } from '../utils/gameStateSerialization';
import { CharmRegistry } from '../../game/logic/charmSystem';
import { registerCharms } from '../../game/logic/charms/index';
import { saveGameCompletion } from '../utils/gameStats';

const router = Router();

// Register charms before using the registry
registerCharms();
const charmRegistry = CharmRegistry.getInstance();

/**
 * Middleware to verify authentication
 */
function requireAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }

  try {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    (req as any).userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
}

/**
 * Save game state
 * POST /api/game/save
 */
router.post('/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({
        success: false,
        error: 'Game state is required'
      });
    }

    // Serialize game state (strip functions)
    const serializedState = serializeGameState(gameState);

    // Check if user already has an active save
    const existingSave = await query(
      'SELECT id FROM game_saves WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (existingSave.rows.length > 0) {
      // Update existing save
      await query(
        `UPDATE game_saves 
         SET game_state = $1, updated_at = NOW()
         WHERE user_id = $2 AND is_active = true`,
        [serializedState, userId]
      );

      return res.json({
        success: true,
        message: 'Game saved successfully'
      });
    } else {
      // Create new save
      const result = await query(
        `INSERT INTO game_saves (user_id, game_state, is_active)
         VALUES ($1, $2, true)
         RETURNING id, created_at, updated_at`,
        [userId, serializedState]
      );

      return res.json({
        success: true,
        message: 'Game saved successfully',
        saveId: result.rows[0].id
      });
    }
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save game'
    });
  }
});

/**
 * Load game state
 * GET /api/game/save
 */
router.get('/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get active save for user
    const result = await query(
      `SELECT game_state, created_at, updated_at
       FROM game_saves
       WHERE user_id = $1 AND is_active = true
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return 200 with a message instead of 404
      return res.status(200).json({
        success: false,
        error: 'No saved game found'
      });
    }

    const save = result.rows[0];
    
    // Check if the saved game is still active (not ended)
    // game_state is JSONB - pg library returns it as an object
    const rawGameState = save.game_state;
    const parsedGameState = typeof rawGameState === 'string' 
      ? JSON.parse(rawGameState) 
      : rawGameState;
    
    // If game is not active (ended), deactivate the save and return 200 with message
    if (!parsedGameState.isActive) {
      // Deactivate the save
      await query(
        'UPDATE game_saves SET is_active = false WHERE user_id = $1 AND is_active = true',
        [userId]
      );
      // Return 200 with a message instead of 404
      return res.status(200).json({
        success: false,
        error: 'No active game found'
      });
    }
    
    // game_state is JSONB - pg library returns it as an object, but we stored it as a JSON string
    // We need to handle both cases
    let gameStateData: string;
    
    // If it's an object, stringify it first (since we stored it as a string)
    // If it's already a string, use it directly
    if (typeof rawGameState === 'object' && rawGameState !== null) {
      // It's already parsed by pg, but we need to stringify it to match our serialization format
      gameStateData = JSON.stringify(rawGameState);
    } else {
      gameStateData = rawGameState as string;
    }
    
    // deserializeGameState expects a string (our serialized format)
    const gameState = deserializeGameState(gameStateData, charmRegistry);

    return res.json({
      success: true,
      gameState,
      savedAt: save.updated_at
    });
  } catch (error) {
    console.error('Load game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load game'
    });
  }
});

/**
 * Save game completion statistics
 * POST /api/game/complete
 */
router.post('/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { gameState, endReason } = req.body;

    if (!gameState || !endReason) {
      return res.status(400).json({
        success: false,
        error: 'Game state and end reason are required'
      });
    }

    // Save game completion stats
    await saveGameCompletion(userId, gameState, endReason);

    return res.json({
      success: true,
      message: 'Game completion saved'
    });
  } catch (error) {
    console.error('Save game completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save game completion'
    });
  }
});

/**
 * Delete saved game
 * DELETE /api/game/save
 */
router.delete('/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    await query(
      'UPDATE game_saves SET is_active = false WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    return res.json({
      success: true,
      message: 'Saved game deleted'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete saved game'
    });
  }
});

export default router;

