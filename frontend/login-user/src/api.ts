import axios from "axios";

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
