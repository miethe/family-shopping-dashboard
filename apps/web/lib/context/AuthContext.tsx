'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '../auth/types';
import { getToken, storeToken, clearToken } from '../auth/storage';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../auth/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Validate token and load user data
   */
  const validateAndLoadUser = useCallback(async (authToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const userData = await getCurrentUser(authToken);
      setUser(userData);
      setToken(authToken);
    } catch (err) {
      console.error('Token validation failed:', err);
      clearToken();
      setUser(null);
      setToken(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load token from localStorage on mount and validate
   */
  useEffect(() => {
    const storedToken = getToken();

    if (storedToken) {
      validateAndLoadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, [validateAndLoadUser]);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiLogin({ email, password });

      // Store token
      storeToken(response.token.access_token, response.token.expires_in);

      // Set user state
      setUser({
        id: response.id,
        email: response.email,
        created_at: response.created_at,
        updated_at: response.updated_at,
      });
      setToken(response.token.access_token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Register new user and automatically log them in
   */
  const register = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Register user
      await apiRegister({ email, password });

      // Automatically log in after successful registration
      const response = await apiLogin({ email, password });

      // Store token
      storeToken(response.token.access_token, response.token.expires_in);

      // Set user state
      setUser({
        id: response.id,
        email: response.email,
        created_at: response.created_at,
        updated_at: response.updated_at,
      });
      setToken(response.token.access_token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setToken(null);
    setError(null);
    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
