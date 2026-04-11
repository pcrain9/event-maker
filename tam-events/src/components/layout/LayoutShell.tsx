import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../banner/Banner";
import ScrollToTopButton from "../scroll-to-top";
import type { LayoutShellProps } from "../../types";
import {
  cleanupExpiredDismissals,
  dismissAnnouncement,
  isAnnouncementDismissed,
} from "../../utils/announcements";

export default function LayoutShell({
  title,
  subtitle,
  variant = "default",
  navItems = [],
  notices = [],
  footerLinks = null,
  announcementStorageScope = "guest",
  heroImageUrl,
  heroAction,
  isLoading = false,
  children,
}: LayoutShellProps) {
  const [dismissedNoticeKeys, setDismissedNoticeKeys] = useState<string[]>([]);

  // Cleanup expired dismissals on mount and scope changes.
  useEffect(() => {
    cleanupExpiredDismissals(announcementStorageScope);
  }, [announcementStorageScope]);

  const visibleNotices = useMemo(
    () =>
      notices.filter((notice) => {
        // Check session-state dismissal (by tone + title, for backward compat with hardcoded notices)
        const sessionKey = `${notice.tone}-${notice.title}`;
        if (dismissedNoticeKeys.includes(sessionKey)) {
          return false;
        }

        // Check persistent dismissal (for API announcements with id and ends)
        if (notice.id !== undefined && notice.ends !== undefined) {
          if (
            isAnnouncementDismissed(
              notice.id,
              notice.ends,
              announcementStorageScope,
            )
          ) {
            return false;
          }
        }

        return true;
      }),
    [announcementStorageScope, dismissedNoticeKeys, notices],
  );

  return (
    <div className="layout" data-variant={variant}>
      {visibleNotices.length > 0 && (
        <section className="layout__notices" aria-live="polite">
          {visibleNotices.map((notice) => {
            const noticeKey = `${notice.tone}-${notice.title}`;
            return (
              <article
                key={noticeKey}
                className="layout__notice"
                data-tone={notice.tone}
              >
                <div className="layout__notice-content">
                  <div className="layout__notice-text">
                    <p className="layout__notice-title">{notice.title}</p>
                    <p className="layout__notice-message">{notice.message}</p>
                  </div>
                  <button
                    className="layout__notice-close"
                    type="button"
                    aria-label="Close notification"
                    onClick={() => {
                      const noticeKey = `${notice.tone}-${notice.title}`;
                      setDismissedNoticeKeys((prev) =>
                        prev.includes(noticeKey) ? prev : [...prev, noticeKey],
                      );

                      // Persist dismissal for API announcements
                      if (
                        notice.id !== undefined &&
                        notice.ends !== undefined
                      ) {
                        dismissAnnouncement(
                          {
                            id: notice.id,
                            ends: notice.ends,
                            title: notice.title,
                            tone: notice.tone,
                          },
                          announcementStorageScope,
                        );
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <Banner heroImageUrl={heroImageUrl} />

      <main className="layout__content">
        <section className="layout__masthead">
          <div className="layout__masthead-header">
            <div className="layout__masthead-copy">
              <div className="layout__masthead-top"></div>
              {isLoading ? (
                <>
                  <div className="layout__title-skeleton" aria-hidden="true" />
                  <div
                    className="layout__subtitle-skeleton"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  <h1 className="layout__title">{title}</h1>
                  {subtitle ? (
                    <p className="layout__subtitle">{subtitle}</p>
                  ) : null}
                </>
              )}
            </div>
            {heroAction ? (
              <div className="layout__masthead-action">{heroAction}</div>
            ) : null}
          </div>
          {navItems.length > 0 ? (
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
          ) : null}
        </section>

        {children}
      </main>

      <footer className="layout__footer">
        {footerLinks && footerLinks.length > 0 ? (
          <nav className="layout__footer-links" aria-label="Footer links">
            {footerLinks.map((link) => (
              <a
                key={`${link.link_title}-${link.href}`}
                className="layout__footer-link"
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {link.link_title}
              </a>
            ))}
          </nav>
        ) : null}
        <div className="layout__footer-meta">
          <span>Contact: admin@texasmuseums.org</span>
          <span>817.332.1177</span>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
