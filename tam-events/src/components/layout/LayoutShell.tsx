import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export type LayoutNavItem = {
  label: string;
  href: string;
  isActive?: boolean;
};

export type LayoutNotice = {
  tone: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
};

type LayoutShellProps = {
  title: string;
  subtitle: string;
  navItems?: LayoutNavItem[];
  notices?: LayoutNotice[];
  children: ReactNode;
};

export default function LayoutShell({
  title,
  subtitle,
  navItems = [],
  notices = [],
  children,
}: LayoutShellProps) {
  return (
    <div className="layout">
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
                  className={`layout__nav-link${
                    item.isActive ? " is-active" : ""
                  }`}
                  aria-current={item.isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {notices.length > 0 && (
        <section className="layout__notices" aria-live="polite">
          {notices.map((notice) => (
            <article
              key={`${notice.tone}-${notice.title}`}
              className="layout__notice"
              data-tone={notice.tone}
            >
              <p className="layout__notice-title">{notice.title}</p>
              <p className="layout__notice-message">{notice.message}</p>
            </article>
          ))}
        </section>
      )}

      <main className="layout__content">{children}</main>

      <footer className="layout__footer">
        <p>TAM Conference Program. Curated moments, clear schedules.</p>
        <div className="layout__footer-meta">
          <span>Contact: tam-events@conference.org</span>
          <span>Last updated: Feb 7, 2026</span>
        </div>
      </footer>
    </div>
  );
}
