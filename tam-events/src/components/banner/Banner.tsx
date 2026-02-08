import { Link } from "react-router-dom";
import type { BannerProps } from "../../types";

export default function Banner({
  title,
  subtitle,
  navItems = [],
}: BannerProps) {
  return (
    <header className="layout__hero">
      <div className="layout__hero-inner">
        <p className="layout__kicker">TAM Events</p>
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
