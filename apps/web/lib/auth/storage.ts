const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

/**
 * Store authentication token with expiry calculation
 * @param token - JWT token
 * @param expiresIn - Seconds until expiry
 */
export function storeToken(token: string, expiresIn: number): void {
  if (typeof window === 'undefined') return;

  const expiryTime = Date.now() + expiresIn * 1000;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

/**
 * Retrieve stored token if still valid
 * @returns Token or null if expired/missing
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  // Check if token is expired
  if (Date.now() > parseInt(expiry, 10)) {
    clearToken();
    return null;
  }

  return token;
}

/**
 * Clear authentication token from storage
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Check if token exists and is valid
 */
export function hasValidToken(): boolean {
  return getToken() !== null;
}

/**
 * Get time remaining until token expiry in seconds
 * @returns Seconds remaining or 0 if no token/expired
 */
export function getTokenTimeRemaining(): number {
  if (typeof window === 'undefined') return 0;

  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!expiry) return 0;

  const remaining = Math.floor((parseInt(expiry, 10) - Date.now()) / 1000);
  return Math.max(0, remaining);
}
