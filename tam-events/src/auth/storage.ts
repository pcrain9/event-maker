/**
 * Token storage utilities for authentication
 *
 * Uses sessionStorage for security:
 * - Persists across page reloads
 * - Does not persist across tabs/windows
 * - Mitigates XSS risk compared to localStorage
 */

const TOKEN_KEY = "auth_token";

export const tokenStorage = {
  /**
   * Save authentication token to session storage
   */
  save: (token: string): void => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  },

  /**
   * Retrieve authentication token from session storage
   */
  get: (): string | null => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to retrieve token:", error);
      return null;
    }
  },

  /**
   * Remove authentication token from session storage
   */
  clear: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to clear token:", error);
    }
  },

  /**
   * Check if a token exists in storage
   */
  exists: (): boolean => {
    return tokenStorage.get() !== null;
  },
};
