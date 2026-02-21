import axios, { AxiosError } from "axios";
import type { EventIdsResponse, EventResponse, LoginResponse } from "./types";
import type { AuthError } from "./auth/store/authStore";
import { tokenStorage } from "./auth/storage";

const API_BASE_URL = "http://localhost:8000";

/**
 * Public API client - No authentication required
 * Used for: event browsing, public data
 */
export const publicClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Authenticated API client - Bearer token attached automatically
 * Used for: admin operations, protected resources
 */
export const authenticatedClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Request interceptor: Attach Bearer token to authenticated requests only
 */
authenticatedClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // No token available - request will likely fail with 401
      console.warn("Authenticated request made without token");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor: Handle 401 globally for token expiration
 * Only on authenticated client
 */
authenticatedClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and dispatch event
      tokenStorage.clear();

      // Dispatch custom event for auth store to handle
      window.dispatchEvent(new CustomEvent("auth:expired"));

      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Authenticate user with username and password
 *
 * @throws {AuthError} Structured error with code and message
 */
export const loginUser = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  try {
    const { data } = await axios.post<LoginResponse>(
      `${API_BASE_URL}/users/token`,
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status as AuthError["code"];
      const detail =
        error.response.data?.detail || "An error occurred during login";

      // Map backend errors to user-friendly messages
      const authError: AuthError = {
        code: status,
        message: detail,
        retry: status === 503 || status === 504, // Retryable errors
      };

      throw authError;
    }

    // Network or unknown error
    const networkError: AuthError = {
      code: 500,
      message: "Network error. Please check your connection.",
      retry: true,
    };
    throw networkError;
  }
};

// =============================================================================
// PUBLIC API ENDPOINTS (No authentication required)
// =============================================================================

/**
 * Fetch all event IDs - PUBLIC
 */
export const getEvents = async (): Promise<EventIdsResponse> => {
  const response = await publicClient.get<EventIdsResponse>("/events/");
  return response.data;
};

/**
 * Fetch event details by slug - PUBLIC
 */
export const getEventBySlug = async (slug: string): Promise<EventResponse> => {
  const response = await publicClient.get<EventResponse>(`/events/${slug}`);
  return response.data;
};

// =============================================================================
// AUTHENTICATED API ENDPOINTS (Bearer token required)
// =============================================================================

// Future admin endpoints will use authenticatedClient
// Example:
// export const updateEvent = async (id: number, data: EventUpdate) => {
//   const response = await authenticatedClient.put(`/events/${id}`, data);
//   return response.data;
// };
