import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import LayoutShell from "../../components/layout/LayoutShell";
import { Schedule } from "../../components/schedule";
import ScheduleSkeleton from "../../components/skeleton-loader";
import type {
  EventItem,
  EventResponse,
  HomeTab,
  ScheduleDay,
  ThemeColors,
} from "../../types";
import { getEventBySlug } from "../../api";
import { useAuthStore } from "../../auth/store/authStore";
import {
  formatDayLabel,
  formatDayDate,
  formatSessionTime,
} from "../../utils/date";

const DEFAULT_TAB: HomeTab = "events";

const normalizeHomeTab = (value: string | null): HomeTab => {
  if (value === "events" || value === "sponsors") return value;
  return DEFAULT_TAB;
};

const HERO_PLACEHOLDER_URL =
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80";

const dummyEventItems: EventItem[] = [
  {
    id: 101,
    title: "Welcome and opening remarks",
    sponsor: "Keynote",
    time: "2026-02-07T09:00:00-06:00",
    speakers: [
      {
        name: "Dr. Maya Patel",
        headshot: "https://i.pravatar.cc/160?img=47",
        institution: "TAM Committee",
      },
      {
        name: "Aidan Ruiz",
        headshot: "https://i.pravatar.cc/160?img=12",
        institution: "TAM Committee",
      },
    ],
    link: "https://tam.example.com/opening",
    description: "Kickoff for day one and a quick tour of the program.",
    location: "Main Hall",
    cancelled: false,
    slides: ["https://tam.example.com/slides/opening.pdf"],
    event_id: 1,
  },
  {
    id: 102,
    title: "Designing for daily momentum",
    sponsor: "Experience",
    time: "2026-02-07T10:30:00-06:00",
    speakers: [
      {
        name: "Riley Chen",
        headshot: "https://i.pravatar.cc/160?img=32",
        institution: "Momentum Lab",
      },
    ],
    link: "https://tam.example.com/momentum",
    description: "Tactics for keeping teams aligned through rapid cycles.",
    location: "Studio A",
    cancelled: false,
    slides: null,
    event_id: 1,
  },
  {
    id: 103,
    title: "Operational craft workshop",
    sponsor: "Operations",
    time: "2026-02-07T13:00:00-06:00",
    speakers: [
      {
        name: "Jordan Lee",
        headshot: "https://i.pravatar.cc/160?img=15",
        institution: "Ops Guild",
      },
      {
        name: "Priya Desai",
        headshot: "https://i.pravatar.cc/160?img=5",
        institution: "Ops Guild",
      },
    ],
    link: "https://tam.example.com/ops-workshop",
    description: "Hands-on session for workflow design and handoffs.",
    location: "Workshop B",
    cancelled: false,
    slides: ["https://tam.example.com/slides/ops-workshop.pdf"],
    event_id: 1,
  },
  {
    id: 201,
    title: "Community roundtable",
    sponsor: "Community",
    time: "2026-02-08T09:30:00-06:00",
    speakers: [
      {
        name: "Avery Brooks",
        headshot: "https://i.pravatar.cc/160?img=56",
        institution: "Community Partners",
      },
      {
        name: "Noah Kim",
        headshot: "https://i.pravatar.cc/160?img=23",
        institution: "Community Partners",
      },
    ],
    link: "https://tam.example.com/roundtable",
    description: "Peer-led discussion with live Q&A.",
    location: "Forum C",
    cancelled: false,
    slides: null,
    event_id: 1,
  },
  {
    id: 202,
    title: "Sponsor showcase",
    sponsor: "Sponsors",
    time: "2026-02-08T11:00:00-06:00",
    speakers: null,
    link: "https://tam.example.com/showcase",
    description: "Highlights from this year's partners and demos.",
    location: "Expo Floor",
    cancelled: false,
    slides: null,
    event_id: 1,
  },
  {
    id: 301,
    title: "Future of TAM",
    sponsor: "Keynote",
    time: "2026-02-09T10:00:00-06:00",
    speakers: [
      {
        name: "Samira Ortiz",
        headshot: "https://i.pravatar.cc/160?img=44",
        institution: "TAM Futures",
      },
    ],
    link: "https://tam.example.com/future",
    description: "Closing keynote with a look ahead at next year.",
    location: "Main Hall",
    cancelled: false,
    slides: null,
    event_id: 1,
  },
  {
    id: 302,
    title: "Closing reflections",
    sponsor: "Closing",
    time: "2026-02-09T12:30:00-06:00",
    speakers: [
      {
        name: "Casey Wright",
        headshot: "https://i.pravatar.cc/160?img=28",
        institution: "TAM Committee",
      },
      {
        name: "Morgan Hill",
        headshot: "https://i.pravatar.cc/160?img=3",
        institution: "TAM Committee",
      },
    ],
    link: "https://tam.example.com/closing",
    description: "Final reflections and handoff notes.",
    location: "Main Hall",
    cancelled: false,
    slides: null,
    event_id: 1,
  },
];

const getSessionStatus = (time: Date) => {
  const now = new Date();
  const diffMs = time.getTime() - now.getTime();
  const liveWindowMs = 45 * 60 * 1000;
  const upNextWindowMs = 90 * 60 * 1000;

  if (diffMs <= 0 && diffMs >= -liveWindowMs) {
    return "live" as const;
  }

  if (diffMs > 0 && diffMs <= upNextWindowMs) {
    return "up-next" as const;
  }

  return "later" as const;
};

const buildScheduleDays = (items: EventItem[]): ScheduleDay[] => {
  const groups = new Map<string, EventItem[]>();

  items.forEach((item) => {
    const date = new Date(item.time);
    const key = date.toISOString().split("T")[0];
    const group = groups.get(key);

    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  });

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, dayItems]) => {
      const dayDate = new Date(`${key}T00:00:00`);
      const sortedItems = dayItems
        .slice()
        .sort(
          (left, right) =>
            new Date(left.time).getTime() - new Date(right.time).getTime(),
        );

      return {
        label: formatDayLabel(dayDate),
        date: formatDayDate(dayDate),
        focus: "Program updates and sessions",
        sessions: sortedItems.map((item) => {
          const sessionTime = new Date(item.time);
          return {
            id: item.id,
            time: formatSessionTime(sessionTime),
            title: item.title,
            room: item.location ?? "TBA",
            track: item.sponsor ?? null,
            status: item.cancelled ? "later" : getSessionStatus(sessionTime),
            speakers: item.speakers ?? null,
            description: item.description ?? null,
          };
        }),
      };
    });
};

const applyColorScheme = (scheme: ThemeColors) => {
  const root = document.documentElement;
  root.style.setProperty("--bg", scheme.background);
  root.style.setProperty("--bg-alt", scheme.alt_background);
  root.style.setProperty("--ink", scheme.text);
  root.style.setProperty("--muted", scheme.secondary);
  root.style.setProperty("--accent", scheme.primary);
  root.style.setProperty("--accent-soft", scheme.secondary);
  root.style.setProperty("--line", scheme.tertiary);
  root.style.setProperty("--card", scheme.alt_background);
};

export default function HomeRoute() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const tab = normalizeHomeTab(searchParams.get("tab"));
  const [eventData, setEventData] = useState<EventResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scheduleDays = useMemo(
    () => buildScheduleDays(eventData?.event_items ?? dummyEventItems),
    [eventData],
  );
  const navItems = [
    { label: "Events", href: "?tab=events", isActive: tab === "events" },
    { label: "Sponsors", href: "?tab=sponsors", isActive: tab === "sponsors" },
  ];
  const notices = [
    {
      tone: "danger" as const,
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

  useEffect(() => {
    let isMounted = true;
    const fetchEvent = async () => {
      if (!slug) {
        setLoadError("No event slug provided");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await getEventBySlug(slug);
        if (!isMounted) return;
        setEventData(data);
        applyColorScheme(data.color_scheme);
        setLoadError(null);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load event items:", error);
        setLoadError("Unable to load event data right now.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const title = eventData?.title ?? "Today at TAM";
  const heroImageUrl = eventData?.hero_image_url ?? HERO_PLACEHOLDER_URL;

  return (
    <LayoutShell
      title={title}
      subtitle="Browse the program, jump into highlighted sessions, and keep an eye on room shifts as they roll in."
      navItems={navItems}
      notices={notices}
      heroImageUrl={heroImageUrl}
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
              {isLoading ? (
                <p className="admin__muted">Loading schedule...</p>
              ) : null}
              {loadError ? <p className="admin__muted">{loadError}</p> : null}
            </div>
            <div>
              <button
                onClick={() => navigate(isAuthenticated ? "/admin" : "/login")}
                className="admin__button admin__button--primary"
              >
                {isAuthenticated ? "Go to Admin" : "Admin Login"}
              </button>
            </div>
          </div>

          <div className="schedule">
            {isLoading ? (
              <ScheduleSkeleton />
            ) : (
              scheduleDays.map((day, index) => (
                <Schedule key={day.label} day={day} defaultOpen={index === 0} />
              ))
            )}
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
