import { Router, Request, Response } from 'express';
import { query } from '../db';
import { verifyToken } from '../auth/authUtils';
import fs from 'fs';
import path from 'path';
import { deserializeGameState } from '../utils/gameStateSerialization';
import { CharmRegistry } from '../../game/logic/charmSystem';
import { registerCharms } from '../../game/logic/charms/index';

const router = Router();

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
 * Get user statistics
 * GET /api/stats
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get or create user statistics
    let result = await query(
      'SELECT * FROM user_statistics WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create initial stats record
      await query(
        `INSERT INTO user_statistics (user_id) VALUES ($1)`,
        [userId]
      );
      result = await query(
        'SELECT * FROM user_statistics WHERE user_id = $1',
        [userId]
      );
    }

    const stats = result.rows[0];

    return res.json({
      success: true,
      stats: {
        gamesPlayed: stats.games_played || 0,
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        highScoreSingleRoll: stats.high_score_single_roll || 0,
        highScoreBank: stats.high_score_bank || 0,
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

/**
 * Get game history
 * GET /api/stats/history
 */
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT id, dice_set_name, difficulty, end_reason, final_score, 
              levels_completed, total_rounds, high_single_roll, high_bank, 
              game_state, completed_at
       FROM completed_games
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Register charms for deserialization
    registerCharms();
    const charmRegistry = CharmRegistry.getInstance();

    const games = result.rows.map(row => {
      // Extract dice set and level lost on from game state
      let diceSet: any[] = [];
      let levelLostOn = row.levels_completed + 1; // Fallback
      
      if (row.game_state) {
        try {
          const gameStateData = typeof row.game_state === 'string' 
            ? row.game_state 
            : JSON.stringify(row.game_state);
          const deserializedState = deserializeGameState(gameStateData, charmRegistry);
          diceSet = deserializedState.config.diceSetConfig.dice || [];
          // Get the level they lost/won on from currentLevel
          levelLostOn = deserializedState.currentLevel?.levelNumber || row.levels_completed + 1;
        } catch (error) {
          console.error('Failed to extract data from game state:', error);
        }
      }

      return {
        id: row.id,
        diceSetName: row.dice_set_name,
        difficulty: row.difficulty,
        endReason: row.end_reason,
        finalScore: row.final_score,
        levelsCompleted: row.levels_completed,
        totalRounds: row.total_rounds,
        highSingleRoll: row.high_single_roll,
        highBank: row.high_bank,
        levelLostOn, // Extracted from gameState
        diceSet, // Include extracted dice set
        completedAt: row.completed_at,
      };
    });

    return res.json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game history'
    });
  }
});

/**
 * Get combination usage statistics
 * GET /api/stats/combinations
 */
router.get('/combinations', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      `SELECT combination_type, times_used, total_points_scored, highest_score,
              first_used_at, last_used_at
       FROM combination_usage
       WHERE user_id = $1
       ORDER BY times_used DESC`,
      [userId]
    );

    const combinations = result.rows.map(row => ({
      combinationType: row.combination_type,
      timesUsed: row.times_used,
      totalPointsScored: row.total_points_scored,
      highestScore: row.highest_score,
      firstUsedAt: row.first_used_at,
      lastUsedAt: row.last_used_at,
    }));

    return res.json({
      success: true,
      combinations
    });
  } catch (error) {
    console.error('Get combination usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get combination usage'
    });
  }
});

/**
 * Get available profile pictures
 * GET /api/stats/profile-pictures
 */
router.get('/profile-pictures', async (req: Request, res: Response) => {
  try {
    const charmsDir = path.join(process.cwd(), 'public', 'assets', 'images', 'charms');
    
    // Read directory and filter for .jpeg/.jpg files
    const files = fs.readdirSync(charmsDir).filter(file => 
      file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.jpg')
    );
    
    const pictures = files.map(filename => {
      const id = filename.replace(/\.(jpeg|jpg)$/i, '').toLowerCase().replace(/_/g, '-');
      const name = filename.replace(/\.(jpeg|jpg)$/i, '').replace(/_/g, ' ');
      return {
        id,
        name,
        imagePath: `/assets/images/charms/${filename}`
      };
    });
    
    return res.json({
      success: true,
      pictures
    });
  } catch (error) {
    console.error('Get profile pictures error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile pictures'
    });
  }
});

export default router;

