import { Router, Request, Response } from 'express';
import { query } from '../db';
import { verifyToken } from '../auth/authUtils';

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
 * Record a difficulty completion
 * POST /api/progress/complete-difficulty
 */
router.post('/complete-difficulty', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { difficulty } = req.body;

    if (!difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty is required'
      });
    }

    // Insert or update (ON CONFLICT DO NOTHING since we have UNIQUE constraint)
    await query(
      `INSERT INTO difficulty_completions (user_id, difficulty, completed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, difficulty) DO NOTHING`,
      [userId, difficulty]
    );

    return res.json({
      success: true,
      message: 'Difficulty completion recorded'
    });
  } catch (error) {
    console.error('Record difficulty completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record difficulty completion'
    });
  }
});

/**
 * Record an item unlock
 * POST /api/progress/unlock-item
 */
router.post('/unlock-item', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { unlockType, unlockId } = req.body;

    if (!unlockType || !unlockId) {
      return res.status(400).json({
        success: false,
        error: 'Unlock type and unlock ID are required'
      });
    }

    if (!['charm', 'consumable', 'blessing', 'pip_effect', 'material', 'difficulty'].includes(unlockType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid unlock type. Must be charm, consumable, blessing, pip_effect, material, or difficulty'
      });
    }

    // Insert or update (ON CONFLICT DO NOTHING since we have UNIQUE constraint)
    await query(
      `INSERT INTO unlocked_items (user_id, unlock_type, unlock_id, unlocked_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, unlock_type, unlock_id) DO NOTHING`,
      [userId, unlockType, unlockId]
    );

    return res.json({
      success: true,
      message: 'Item unlock recorded'
    });
  } catch (error) {
    console.error('Record item unlock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record item unlock'
    });
  }
});

/**
 * Get all difficulty completions for the current user
 * GET /api/progress/completions
 */
router.get('/completions', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      `SELECT difficulty, completed_at
       FROM difficulty_completions
       WHERE user_id = $1
       ORDER BY completed_at ASC`,
      [userId]
    );

    const completions = result.rows.map(row => ({
      difficulty: row.difficulty,
      completedAt: row.completed_at
    }));

    return res.json({
      success: true,
      completions
    });
  } catch (error) {
    console.error('Get difficulty completions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get difficulty completions'
    });
  }
});

/**
 * Get all unlocked items for the current user
 * GET /api/progress/unlocks
 */
router.get('/unlocks', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const unlockType = req.query.unlockType as string | undefined;

    let queryText = `SELECT unlock_type, unlock_id, unlocked_at
                     FROM unlocked_items
                     WHERE user_id = $1`;
    const params: any[] = [userId];

    if (unlockType) {
      queryText += ' AND unlock_type = $2';
      params.push(unlockType);
    }

    queryText += ' ORDER BY unlocked_at ASC';

    const result = await query(queryText, params);

    const unlocks = result.rows.map(row => ({
      unlockType: row.unlock_type,
      unlockId: row.unlock_id,
      unlockedAt: row.unlocked_at
    }));

    return res.json({
      success: true,
      unlocks
    });
  } catch (error) {
    console.error('Get unlocked items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unlocked items'
    });
  }
});

export default router;

