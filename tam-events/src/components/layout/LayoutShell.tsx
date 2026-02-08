import { useMemo, useState } from "react";
import Banner from "../banner/Banner";
import type { LayoutShellProps } from "../../types";

export default function LayoutShell({
  title,
  subtitle,
  navItems = [],
  notices = [],
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

  return (
    <div className="layout">
      <Banner title={title} subtitle={subtitle} navItems={navItems} />

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
                <div className="layout__notice-header">
                  <p className="layout__notice-title">{notice.title}</p>
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
                    Close
                  </button>
                </div>
                <p className="layout__notice-message">{notice.message}</p>
              </article>
            );
          })}
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
