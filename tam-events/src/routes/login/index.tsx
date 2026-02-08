import LayoutShell from "../../components/layout/LayoutShell";

export default function LoginRoute() {
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
          <form className="login__form">
            <label className="login__label" htmlFor="login-email">
              Email
            </label>
            <input
              className="login__input"
              id="login-email"
              name="email"
              type="email"
              placeholder="you@tamevents.org"
              autoComplete="email"
              required
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
            />
            <div className="login__row">
              <label className="login__check">
                <input type="checkbox" name="remember" />
                Keep me signed in
              </label>
              <button type="button" className="login__link">
                Forgot password
              </button>
            </div>
            <button className="login__button" type="submit">
              Sign in to admin
            </button>
          </form>
          <div className="login__meta">
            <span>Need access?</span>
            <button type="button" className="login__link">
              Request an admin invite
            </button>
          </div>
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
            <p>
              Sessions expire after 45 minutes of inactivity. Use a device you
              trust and keep MFA enabled.
            </p>
          </div>
        </aside>
      </section>
    </LayoutShell>
  );
}
