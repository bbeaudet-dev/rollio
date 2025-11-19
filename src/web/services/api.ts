/**
 * Centralized API client for making authenticated requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  user?: any;
  token?: string;
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
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

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

