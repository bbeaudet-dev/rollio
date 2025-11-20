import { Router, Request, Response } from 'express';
import { query } from '../db';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../auth/authUtils';

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

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username must be between 3 and 50 characters' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if username already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(409).json({ 
          success: false, 
          error: 'Email already exists' 
        });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, created_at`,
      [username, email || null, passwordHash]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profile_picture || 'default',
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register user' 
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    // Find user
    const result = await query(
      'SELECT id, username, email, password_hash, profile_picture FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    
    // Get profile_picture from user record
    const profilePicture = user.profile_picture || 'default';

    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to login' 
    });
  }
});

// Get current user (protected route)
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    // Get user from database
    const result = await query(
      'SELECT id, username, email, profile_picture, created_at, last_login FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
});

// Update profile picture
router.post('/profile/picture', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { pictureId } = req.body;

    if (!pictureId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Picture ID is required' 
      });
    }

    // Update profile picture
    await query(
      'UPDATE users SET profile_picture = $1 WHERE id = $2',
      [pictureId, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture updated'
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile picture' 
    });
  }
});

export default router;

