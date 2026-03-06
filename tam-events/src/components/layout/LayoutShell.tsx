import { useMemo, useState } from "react";
import Banner from "../banner/Banner";
import type { LayoutShellProps } from "../../types";

export default function LayoutShell({
  title,
  subtitle,
  navItems = [],
  notices = [],
  heroImageUrl,
  children,
}: LayoutShellProps) {
  const [dismissedNoticeKeys, setDismissedNoticeKeys] = useState<string[]>([]);
  const visibleNotices = useMemo(
    () =>
      notices.filter(
        (notice) =>
          !dismissedNoticeKeys.includes(`${notice.tone}-${notice.title}`),
      ),
    [dismissedNoticeKeys, notices],
  );

  const getNoticeIcon = (tone: string) => {
    switch (tone) {
      case "info":
        return "ℹ";
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "danger":
        return "✕";
      default:
        return "ℹ";
    }
  };

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
                  <span className="layout__notice-icon" aria-hidden="true">
                    {getNoticeIcon(notice.tone)}
                  </span>
                  <div className="layout__notice-text">
                    <p className="layout__notice-title">{notice.title}</p>
                    <p className="layout__notice-message">{notice.message}</p>
                  </div>
                  <button
                    className="layout__notice-close"
                    type="button"
                    aria-label="Close notification"
                    onClick={() =>
                      setDismissedNoticeKeys((prev) =>
                        prev.includes(noticeKey) ? prev : [...prev, noticeKey],
                      )
                    }
                  >
                    ✕
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <Banner
        title={title}
        subtitle={subtitle}
        navItems={navItems}
        heroImageUrl={heroImageUrl}
      />

      <main className="layout__content">{children}</main>

      <footer className="layout__footer">
        <div className="layout__footer-meta">
          <span>Contact: tam-events@conference.org</span>
          <span>Last updated: Feb 7, 2026</span>
        </div>
      </footer>
    </div>
  );
}
