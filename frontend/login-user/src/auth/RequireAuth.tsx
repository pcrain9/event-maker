import { JSX } from "react";
import { Navigate } from "react-router-dom";

function parseJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("access_token")
      : null;
  if (!token) return <Navigate to="/login" replace />;

  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== "number") {
    sessionStorage.removeItem("access_token");
    return <Navigate to="/login" replace />;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    // token expired
    sessionStorage.removeItem("access_token");
    return <Navigate to="/login" replace />;
  }

  return children;
};
