import axios from "axios";
import type { EventIdsResponse, EventResponse } from "./types";

const API_BASE_URL = "http://localhost:8000";

export const loginUser = async (req: {
  username: string;
  password: string;
}) => {
  try {
    const params = new URLSearchParams();
    params.append("username", req.username);
    params.append("password", req.password);

    const response = await axios.post<{
      access_token: string;
      token_type: string;
      username: string;
    }>("http://localhost:8000/users/token", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response) {
      sessionStorage.setItem("access_token", response.data.access_token);
      return response.data;
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
};

export const getEvents = async (): Promise<EventIdsResponse> => {
  const response = await axios.get<EventIdsResponse>(`${API_BASE_URL}/events/`);
  return response.data;
};

export const getEventBySlug = async (
  slug: string,
): Promise<EventResponse> => {
  const response = await axios.get<EventResponse>(
    `${API_BASE_URL}/events/${slug}`,
  );
  return response.data;
};
