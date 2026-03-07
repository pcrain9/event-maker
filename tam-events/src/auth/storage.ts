/**
 * Token storage utilities for authentication
 *
 * Uses sessionStorage for security:
 * - Persists across page reloads
 * - Does not persist across tabs/windows
 * - Mitigates XSS risk compared to localStorage
 */

const TOKEN_KEY = "auth_token";
const USERNAME_KEY = "auth_username";

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
   * Save authenticated username to session storage
   */
  saveUsername: (username: string): void => {
    try {
      sessionStorage.setItem(USERNAME_KEY, username);
    } catch (error) {
      console.error("Failed to save username:", error);
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
   * Retrieve authenticated username from session storage
   */
  getUsername: (): string | null => {
    try {
      return sessionStorage.getItem(USERNAME_KEY);
    } catch (error) {
      console.error("Failed to retrieve username:", error);
      return null;
    }
  },

  /**
   * Remove authentication token from session storage
   */
  clear: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USERNAME_KEY);
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
