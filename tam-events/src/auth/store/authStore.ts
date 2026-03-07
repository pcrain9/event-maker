import { create } from "zustand";
import { loginUser } from "../../api";
import { tokenStorage } from "../storage";

/**
 * User response model from backend
 */
export type UserResponse = {
  id: number;
  username: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
};

/**
 * Authentication error types mapped from backend HTTP status codes
 */
export type AuthError = {
  code: 401 | 403 | 500 | 503 | 504;
  message: string;
  retry?: boolean; // Indicates if user should retry (503/504)
};

/**
 * Complete authentication state shape
 */
type AuthState = {
  // State
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => void;
  clearError: () => void;
};

/**
 * Global authentication store using Zustand
 *
 * Architecture:
 * - Single source of truth for auth state
 * - Immutable updates via set()
 * - Side effects (API calls, storage) handled in actions
 * - Can be accessed outside React via getState()
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Authenticate user with username/password
   *
   * Flow:
   * 1. Set loading state
   * 2. Call login API
   * 3. Persist token to sessionStorage
   * 4. Update auth state
   * 5. Handle errors with appropriate codes
   *
   * @throws {AuthError} Re-throws for component-level handling
   */
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await loginUser(username, password);

      // Persist token to storage
      tokenStorage.save(response.access_token);
      tokenStorage.saveUsername(response.user.username);

      // Update state immutably
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const authError = error as AuthError;

      // Clear auth state on error
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: authError,
      });

      // Re-throw for component-level error handling
      throw authError;
    }
  },

  /**
   * Clear authentication state and storage
   *
   * Called on:
   * - Explicit user logout
   * - Token expiration (401 from API)
   * - Session invalidation
   */
  logout: () => {
    tokenStorage.clear();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  /**
   * Restore session from persisted token
   *
   * Called on app initialization to restore user session
   * Uses optimistic restoration - if token is expired,
   * it will be invalidated by 401 response from API
   *
   * Future: Could validate token immediately via /users/me endpoint
   */
  restoreSession: () => {
    const token = tokenStorage.get();

    if (token) {
      // Optimistically restore authentication state
      set({
        token,
        isAuthenticated: true,
      });

      // Note: User object not restored - will be lazy-loaded on first API call
      // or could be fetched explicitly via a /users/me endpoint
    }
  },

  /**
   * Clear error state
   *
   * Used when user dismisses error or retries action
   */
  clearError: () => set({ error: null }),
}));
