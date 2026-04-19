import axios, { AxiosError } from "axios";
import type {
  AdminUser,
  AdminUserCreate,
  AdminUserUpdate,
  EventCreate,
  EventAdminResponse,
  EventIdsResponse,
  EventResponse,
  LoginResponse,
  EventItem,
  EventItemCreate,
  EventItemUpdate,
  EventUpdate,
  AdminAnnouncement,
  AnnouncementCreate,
  AnnouncementUpdate,
} from "./types";
import type { AuthError } from "./auth/store/authStore";
import { tokenStorage } from "./auth/storage";

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT?.trim();

if (!API_BASE_URL) {
  throw new Error("Missing required environment variable: VITE_API_ENDPOINT");
}

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

/**
 * Update an event item - ADMIN ONLY
 *
 * @param eventId - The ID of the parent event
 * @param itemId - The ID of the event item to update
 * @param data - Partial update data (all fields optional)
 * @returns Updated event item
 * @throws {AxiosError} 401 if unauthorized, 403 if not admin, 404 if not found
 */
export const updateEventItem = async (
  eventId: number,
  itemId: number,
  data: EventItemUpdate,
): Promise<EventItem> => {
  const response = await authenticatedClient.put<EventItem>(
    `/events/${eventId}/items/${itemId}`,
    data,
  );
  return response.data;
};

/**
 * Create an event item - ADMIN ONLY
 */
export const createEventItem = async (
  eventId: number,
  data: EventItemCreate,
): Promise<EventItem> => {
  const response = await authenticatedClient.post<EventItem>(
    `/events/${eventId}/items`,
    data,
  );
  return response.data;
};

/**
 * Update an event - ADMIN ONLY
 *
 * @param eventId - The ID of the event to update
 * @param data - Partial update data (footer links only for now)
 * @returns Updated event
 * @throws {AxiosError} 401 if unauthorized, 403 if not admin, 404 if not found
 */
export const updateEvent = async (
  eventId: number,
  data: EventUpdate,
): Promise<EventResponse> => {
  const response = await authenticatedClient.put<EventResponse>(
    `/events/${eventId}`,
    data,
  );
  return response.data;
};

/**
 * Create an event - ADMIN ONLY
 */
export const createEvent = async (
  data: EventCreate,
): Promise<EventAdminResponse> => {
  const response = await authenticatedClient.post<EventAdminResponse>(
    `/events/`,
    data,
  );
  return response.data;
};

/**
 * Delete a single event item - ADMIN ONLY
 */
export const deleteEventItem = async (
  eventId: number,
  itemId: number,
): Promise<void> => {
  await authenticatedClient.delete(`/events/${eventId}/items/${itemId}`);
};

/**
 * Delete an event - ADMIN ONLY
 */
export const deleteEvent = async (eventId: number): Promise<void> => {
  await authenticatedClient.delete(`/events/${eventId}`);
};

/**
 * Fetch all announcements for a specific event - PUBLIC
 *
 * @param eventId - The ID of the event to fetch announcements for
 * @returns Array of announcements for the event
 * @throws {AxiosError} 404 if event not found
 */
export const getAnnouncementsByEvent = async (
  eventId: number,
): Promise<AdminAnnouncement[]> => {
  const response = await publicClient.get<AdminAnnouncement[]>(
    `/announcements/`,
    {
      params: { event_id: eventId },
    },
  );
  return response.data;
};

/**
 * Create a new announcement - ADMIN ONLY
 *
 * @param data - The announcement data to create
 * @returns The created announcement
 * @throws {AxiosError} 401 if unauthorized, 403 if not admin
 */
export const createAnnouncement = async (
  data: AnnouncementCreate,
): Promise<AdminAnnouncement> => {
  const response = await authenticatedClient.post<AdminAnnouncement>(
    `/announcements/`,
    data,
  );
  return response.data;
};

/**
 * Update an announcement - ADMIN ONLY
 *
 * @param announcementId - The ID of the announcement to update
 * @param data - Partial update data (all fields optional)
 * @returns The updated announcement
 * @throws {AxiosError} 401 if unauthorized, 403 if not admin, 404 if not found
 */
export const updateAnnouncement = async (
  announcementId: number,
  data: AnnouncementUpdate,
): Promise<AdminAnnouncement> => {
  const response = await authenticatedClient.put<AdminAnnouncement>(
    `/announcements/${announcementId}`,
    data,
  );
  return response.data;
};

/**
 * Delete an announcement - ADMIN ONLY
 *
 * @param announcementId - The ID of the announcement to delete
 * @throws {AxiosError} 401 if unauthorized, 403 if not admin, 404 if not found
 */
export const deleteAnnouncement = async (
  announcementId: number,
): Promise<void> => {
  await authenticatedClient.delete(`/announcements/${announcementId}`);
};

/**
 * Fetch all admin users - ADMIN ONLY
 */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await authenticatedClient.get<AdminUser[]>(`/users/admins`);
  return response.data;
};

/**
 * Create a new admin user - ADMIN ONLY
 */
export const createAdminUser = async (
  data: AdminUserCreate,
): Promise<AdminUser> => {
  const response = await authenticatedClient.post<AdminUser>(
    `/users/admins`,
    data,
  );
  return response.data;
};

/**
 * Update an existing admin user - ADMIN ONLY
 */
export const updateAdminUser = async (
  userId: number,
  data: AdminUserUpdate,
): Promise<AdminUser> => {
  const response = await authenticatedClient.put<AdminUser>(
    `/users/admins/${userId}`,
    data,
  );
  return response.data;
};

/**
 * Delete an admin user - ADMIN ONLY
 */
export const deleteAdminUser = async (userId: number): Promise<void> => {
  await authenticatedClient.delete(`/users/admins/${userId}`);
};
