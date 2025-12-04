import type { LoginResponse, User, TokenResponse, LoginCredentials, RegisterCredentials, RegisterResponse } from './types';

// Fallback uses external port (8030) for Docker dev environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8030/api/v1';

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Login failed' } }));
    throw new Error(error.error?.message || 'Login failed');
  }

  return response.json();
}

/**
 * Register new user
 */
export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Registration failed' } }));
    throw new Error(error.error?.message || 'Registration failed');
  }

  return response.json();
}

/**
 * Get current user from token
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Authentication failed' } }));
    throw new Error(error.error?.message || 'Authentication failed');
  }

  return response.json();
}

/**
 * Refresh authentication token
 */
export async function refreshToken(token: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Token refresh failed' } }));
    throw new Error(error.error?.message || 'Token refresh failed');
  }

  return response.json();
}
