import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setToken, removeToken, getToken } from '../services/api';

export interface User {
  id: string;
  username: string;
  email?: string;
  profilePicture?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string | null, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user from token on mount
   */
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // Token is invalid, remove it
          removeToken();
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Listen for logout events (e.g., from 401 errors)
    const handleLogout = () => {
      setUser(null);
      removeToken();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  /**
   * Login function
   */
  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      if (response.success && response.user && response.token) {
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  /**
   * Register function
   */
  const register = async (username: string, email: string | null, password: string) => {
    try {
      const response = await authApi.register(username, email, password);
      if (response.success && response.user && response.token) {
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    removeToken();
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

