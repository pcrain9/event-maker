import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import LayoutShell from "../components/layout/LayoutShell";

type HomeTab = "events" | "sponsors";

const DEFAULT_TAB: HomeTab = "events";

const normalizeHomeTab = (value: string | null): HomeTab => {
  if (value === "events" || value === "sponsors") return value;
  return DEFAULT_TAB;
};

const scheduleDays = [
  {
    label: "Thursday",
    date: "Feb 7",
    focus: "Opening sessions and main stage",
    sessions: [
      {
        time: "9:00 AM",
        title: "Welcome and opening remarks",
        room: "Main Hall",
        track: "Keynote",
        status: "live",
      },
      {
        time: "10:30 AM",
        title: "Designing for daily momentum",
        room: "Studio A",
        track: "Experience",
        status: "up-next",
      },
      {
        time: "1:00 PM",
        title: "Operational craft workshop",
        room: "Workshop B",
        track: "Operations",
        status: "later",
      },
    ],
  },
  {
    label: "Friday",
    date: "Feb 8",
    focus: "Breakouts and sponsor showcases",
    sessions: [
      {
        time: "9:30 AM",
        title: "Community roundtable",
        room: "Forum C",
        track: "Community",
        status: "up-next",
      },
      {
        time: "11:00 AM",
        title: "Sponsor showcase",
        room: "Expo Floor",
        track: "Sponsors",
        status: "later",
      },
    ],
  },
  {
    label: "Saturday",
    date: "Feb 9",
    focus: "Closing sessions and handoff",
    sessions: [
      {
        time: "10:00 AM",
        title: "Future of TAM",
        room: "Main Hall",
        track: "Keynote",
        status: "later",
      },
      {
        time: "12:30 PM",
        title: "Closing reflections",
        room: "Main Hall",
        track: "Closing",
        status: "later",
      },
    ],
  },
];

export default function HomeRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = normalizeHomeTab(searchParams.get("tab"));
  const ids = searchParams.get("ids") ?? "";
  const navItems = [
    { label: "Events", href: "?tab=events", isActive: tab === "events" },
    { label: "Sponsors", href: "?tab=sponsors", isActive: tab === "sponsors" },
  ];
  const notices = [
    {
      tone: "info" as const,
      title: "Check-in opens at 8:00 AM",
      message: "Stop by the welcome desk for your badge and day-one guide.",
    },
  ];

  useEffect(() => {
    const current = searchParams.get("tab");
    if (current !== tab) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", tab);
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, tab]);

  return (
    <LayoutShell
      title="Today at TAM"
      subtitle="Browse the program, jump into highlighted sessions, and keep an eye on room shifts as they roll in."
      navItems={navItems}
      notices={notices}
    >
      {tab === "events" ? (
        <section className="layout__panel">
          <div className="schedule__intro">
            <div>
              <h2>Schedule</h2>
              <p>
                Plan your day with the latest rooms, tracks, and featured
                sessions.
              </p>
            </div>
            <div className="schedule__meta">
              <span>Query ids: {ids || "(none)"}</span>
              <span>Timezone: America/Denver</span>
            </div>
          </div>

          <div className="schedule">
            {scheduleDays.map((day) => (
              <article key={day.label} className="schedule__day">
                <header className="schedule__day-header">
                  <div>
                    <p className="schedule__day-label">{day.label}</p>
                    <p className="schedule__day-date">{day.date}</p>
                  </div>
                  <p className="schedule__day-focus">{day.focus}</p>
                </header>
                <div className="schedule__sessions">
                  {day.sessions.map((session) => (
                    <div
                      key={`${day.label}-${session.time}-${session.title}`}
                      className="schedule__card"
                      data-status={session.status}
                    >
                      <div>
                        <p className="schedule__time">{session.time}</p>
                        <h3 className="schedule__title">{session.title}</h3>
                      </div>
                      <div className="schedule__details">
                        <span>{session.room}</span>
                        <span className="schedule__track">{session.track}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="layout__panel">
          <h2>Sponsors</h2>
          <p>Partner highlights and sponsor spotlights will live here.</p>
        </section>
      )}
    </LayoutShell>
  );
}
