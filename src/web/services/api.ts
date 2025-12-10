/**
 * Centralized API client for making authenticated requests to the backend
 */

// Helper to access Vite env variables with proper typing
function getEnvVar(key: string): string | undefined {
  // @ts-ignore - Vite provides import.meta.env at runtime
  return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : undefined;
}

function isProd(): boolean {
  // @ts-ignore - Vite provides import.meta.env at runtime
  return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PROD : false;
}

// API base URL - points to Render backend in production, local server in development
// In dev mode, use relative URLs so Vite proxy handles routing to backend
const API_BASE_URL = getEnvVar('VITE_API_URL') || 
  (isProd() ? 'https://your-backend.onrender.com' : '');

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  user?: any;
  token?: string;
  gameState?: any; // For game load responses
  savedAt?: string; // For game load responses
  stats?: any; // For stats responses
  games?: any[]; // For game history responses
  pictures?: any[]; // For profile pictures responses
  combinations?: any[]; // For combination stats responses
  leaderboard?: any[]; // For leaderboard responses
}

export interface ApiError {
  message: string;
  status?: number;
}

/**
 * Get the stored JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Store the JWT token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove the JWT token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Make an authenticated API request with timeout
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 10000 // 10 second default timeout
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    // Race between fetch and timeout
    let response: Response;
    try {
      response = await Promise.race([
        fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        }),
        timeoutPromise,
      ]);
    } catch (fetchError: any) {
      // Handle network errors (CORS, connection refused, etc.)
      const errorDetails = {
        error: fetchError,
        url: `${API_BASE_URL}${endpoint}`,
        message: fetchError?.message,
        apiBaseUrl: API_BASE_URL,
        isProduction: isProd(),
        hasViteApiUrl: !!getEnvVar('VITE_API_URL')
      };
      console.error('Fetch error:', errorDetails);
      
      // Provide more helpful error message
      let errorMessage = `Network error: ${fetchError?.message || 'Failed to connect to server'}`;
      if (API_BASE_URL.includes('your-backend.onrender.com')) {
        errorMessage += '. Please configure VITE_API_URL environment variable with your backend URL.';
      }
      errorMessage += ' Check console for details.';
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, read as text to see what we got
      const text = await response.text();
      console.error('Non-JSON response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        url: `${API_BASE_URL}${endpoint}`,
        preview: text.substring(0, 200)
      });
      return {
        success: false,
        error: `Server returned non-JSON response (status: ${response.status}). Check console for details.`,
      };
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      removeToken();
      // Dispatch custom event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return {
        success: false,
        error: 'Session expired. Please log in again.',
      };
    }

    // Handle other errors
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Auth-specific API functions
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(username: string, email: string | null, password: string): Promise<ApiResponse> {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  /**
   * Login a user
   */
  async login(username: string, password: string): Promise<ApiResponse> {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<ApiResponse> {
    return apiRequest('/api/auth/me');
  },
};

/**
 * Game-specific API functions
 */
export const gameApi = {
  /**
   * Save game state
   */
  async saveGame(gameState: any): Promise<ApiResponse> {
    return apiRequest('/api/game/save', {
      method: 'POST',
      body: JSON.stringify({ gameState }),
    });
  },

  /**
   * Mark in_progress games as quit
   * Called when starting a new game
   */
  async markInProgressGamesAsQuit(): Promise<ApiResponse> {
    return apiRequest('/api/game/mark-quit', {
      method: 'POST',
    });
  },

  /**
   * Load saved game
   * Returns success: false with no error for 404s (expected when no save exists)
   */
  async loadGame(): Promise<ApiResponse> {
    const token = getToken();
    if (!token) {
      // No token means not authenticated - don't make request
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${API_BASE_URL}/api/game/save`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      // Handle 401 Unauthorized
      if (response.status === 401) {
        removeToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return {
          success: false,
          error: 'Session expired. Please log in again.',
        };
      }

      // Handle other HTTP errors (500, etc.)
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      // No saved game - server returns 200 with success: false and a message
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'No saved game found'
        };
      }

      return {
        success: true,
        ...data,
      };
    } catch (error) {
      // Only log non-404 errors
      console.error('Load game error:', error);
      return {
        success: false,
        error: 'Failed to load game',
      };
    }
  },

  /**
   * Delete saved game
   */
  async deleteGame(): Promise<ApiResponse> {
    return apiRequest('/api/game/save', {
      method: 'DELETE',
    });
  },
  
  /**
   * Save game completion statistics
   */
  async saveGameCompletion(gameState: any, endReason: 'win' | 'lost' | 'quit'): Promise<ApiResponse> {
    return apiRequest('/api/game/complete', {
      method: 'POST',
      body: JSON.stringify({ gameState, endReason }),
    });
  },
};

/**
 * Stats API functions
 */
export const statsApi = {
  /**
   * Get user statistics
   */
  async getStats(): Promise<ApiResponse> {
    return apiRequest('/api/stats');
  },

  /**
   * Get game history
   */
  async getHistory(limit?: number, offset?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const query = params.toString();
    return apiRequest(`/api/stats/history${query ? `?${query}` : ''}`);
  },

  /**
   * Get combination usage statistics
   */
  async getCombinations(): Promise<ApiResponse> {
    return apiRequest('/api/stats/combinations');
  },
  
  /**
   * Update profile picture
   */
  async updateProfilePicture(pictureId: string): Promise<ApiResponse> {
    return apiRequest('/api/auth/profile/picture', {
      method: 'POST',
      body: JSON.stringify({ pictureId }),
    });
  },
  
  /**
   * Get available profile pictures
   */
  async getProfilePictures(): Promise<ApiResponse> {
    return apiRequest('/api/stats/profile-pictures');
  },
  
  /**
   * Get leaderboard (all users' highest scores)
   */
  async getLeaderboard(): Promise<ApiResponse> {
    return apiRequest('/api/stats/leaderboard');
  },
};

/**
 * Progress API functions
 */
export const progressApi = {
  /**
   * Record a difficulty completion
   */
  async completeDifficulty(difficulty: string): Promise<ApiResponse> {
    return apiRequest('/api/progress/complete-difficulty', {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
    });
  },

  /**
   * Record an item unlock
   */
  async unlockItem(unlockType: 'charm' | 'consumable' | 'blessing' | 'pip_effect' | 'material' | 'difficulty', unlockId: string): Promise<ApiResponse> {
    return apiRequest('/api/progress/unlock-item', {
      method: 'POST',
      body: JSON.stringify({ unlockType, unlockId }),
    });
  },

  /**
   * Get all difficulty completions for the current user
   */
  async getCompletions(): Promise<ApiResponse> {
    return apiRequest('/api/progress/completions');
  },

  /**
   * Get all unlocked items for the current user
   */
  async getUnlocks(unlockType?: 'charm' | 'consumable' | 'blessing' | 'pip_effect' | 'material' | 'difficulty'): Promise<ApiResponse> {
    const query = unlockType ? `?unlockType=${unlockType}` : '';
    return apiRequest(`/api/progress/unlocks${query}`);
  },
};

