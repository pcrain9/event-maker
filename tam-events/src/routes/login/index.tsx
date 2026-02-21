import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutShell from "../../components/layout/LayoutShell";
import { useAuthStore } from "../../auth/store/authStore";
import type { AuthError } from "../../auth/store/authStore";

/**
 * Map backend error codes to user-friendly messages
 */
const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 401:
      return "Invalid username or password. Please try again.";
    case 403:
      return "Your account is inactive. Please contact support.";
    case 503:
    case 504:
      return "Service temporarily unavailable. Please try again in a moment.";
    case 500:
    default:
      return error.message || "An error occurred. Please try again.";
  }
};

export default function LoginRoute() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    try {
      await login(username, password);
      // Success - redirect to admin
      navigate("/admin");
    } catch (error) {
      // Error is already in store, will be displayed below
      console.error("Login failed:", error);
    }
  };

  return (
    <LayoutShell
      title="Admin Access"
      subtitle="Sign in to manage schedule updates, announcements, and theme controls."
    >
      <section className="login">
        <div className="login__panel">
          <div className="login__header">
            <p className="login__eyebrow">Festival Ops</p>
            <h2>Welcome back</h2>
            <p className="login__subtext">
              Use your staff credentials to keep the TAM Events schedule current
              and aligned with on-site updates.
            </p>
          </div>

          {/* Error Display */}
          {storeError && (
            <div
              style={{
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "16px",
                color: "#c33",
              }}
            >
              {getErrorMessage(storeError)}
              {storeError.retry && (
                <span
                  style={{
                    display: "block",
                    marginTop: "8px",
                    fontSize: "0.9em",
                  }}
                >
                  This may be a temporary issue. Please try again.
                </span>
              )}
            </div>
          )}

          <form className="login__form" onSubmit={handleSubmit}>
            <label className="login__label" htmlFor="login-username">
              Username
            </label>
            <input
              className="login__input"
              id="login-username"
              name="username"
              type="text"
              placeholder="your-username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <label className="login__label" htmlFor="login-password">
              Password
            </label>
            <input
              className="login__input"
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <div className="login__row">
              <label className="login__check">
                <input type="checkbox" name="remember" disabled={isLoading} />
                Keep me signed in
              </label>
              <button
                type="button"
                className="login__link"
                disabled={isLoading}
              >
                Forgot password
              </button>
            </div>
            <button
              className="login__button"
              type="submit"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? "Signing in..." : "Sign in to admin"}
            </button>
          </form>
        </div>
        <aside className="login__aside">
          <div className="login__aside-card">
            <h3>Operations dashboard</h3>
            <p>
              Confirm stage changes, push real-time announcements, and
              coordinate volunteer coverage with one shared workspace.
            </p>
            <ul className="login__list">
              <li>Live schedule overrides</li>
              <li>Artist arrival tracking</li>
              <li>Emergency broadcast tools</li>
            </ul>
          </div>
          <div className="login__aside-card login__aside-card--muted">
            <p className="login__aside-title">Security note</p>
            <p>Sessions expire after 24 hours. Use a device you trust.</p>
          </div>
        </aside>
      </section>
    </LayoutShell>
  );
}
