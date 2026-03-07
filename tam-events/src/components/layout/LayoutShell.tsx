import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Banner from "../banner/Banner";
import type { LayoutShellProps } from "../../types";
import {
  cleanupExpiredDismissals,
  dismissAnnouncement,
  isAnnouncementDismissed,
} from "../../utils/announcements";

export default function LayoutShell({
  title,
  subtitle,
  navItems = [],
  notices = [],
  heroImageUrl: _heroImageUrl, // Accept but not used yet
  children,
}: LayoutShellProps) {
  const [dismissedNoticeKeys, setDismissedNoticeKeys] = useState<string[]>([]);

  // Cleanup expired dismissals on mount
  useEffect(() => {
    cleanupExpiredDismissals();
  }, []);

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
          if (isAnnouncementDismissed(notice.id, notice.ends)) {
            return false;
          }
        }

        return true;
      }),
    [dismissedNoticeKeys, notices],
  );

  return (
    <div className="layout">
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
                        dismissAnnouncement(notice.id, notice.ends);
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

      <Banner title={title} subtitle={subtitle} navItems={navItems} />

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
