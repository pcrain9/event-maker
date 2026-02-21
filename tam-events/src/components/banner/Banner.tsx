import { Link } from "react-router-dom";
import type { BannerProps } from "../../types";
import { useTheme } from "../../useTheme";

export default function Banner({
  title,
  subtitle,
  navItems = [],
  heroImageUrl,
}: BannerProps) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <header className="layout__hero">
      {heroImageUrl ? (
        <div
          className="layout__hero-media"
          style={{ backgroundImage: `url(${heroImageUrl})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="layout__hero-inner">
        <div className="layout__hero-top">
          <p className="layout__kicker">TAM Events</p>
          <div className="layout__theme">
            <label className="layout__theme-label" htmlFor="theme-select">
              Theme
            </label>
            <select
              id="theme-select"
              className="layout__theme-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value as typeof theme)}
            >
              {themes.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h1 className="layout__title">{title}</h1>
        <p className="layout__subtitle">{subtitle}</p>
        {navItems.length > 0 && (
          <nav className="layout__nav" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`layout__nav-link${item.isActive ? " is-active" : ""}`}
                aria-current={item.isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
