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
  LayoutNotice,
  AdminAnnouncement,
} from "../../types";
import { getEventBySlug, getAnnouncementsByEvent } from "../../api";
import { useAuthStore } from "../../auth/store/authStore";
import { tokenStorage } from "../../auth/storage";
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
        isoDate: key,
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
            status: item.cancelled
              ? "cancelled"
              : getSessionStatus(sessionTime),
            speakers: item.speakers ?? null,
            description: item.description ?? null,
          };
        }),
      };
    });
};

const applyColorScheme = (scheme: ThemeColors) => {
  const root = document.documentElement;
  const normalizedHeading = scheme.heading?.trim().toLowerCase();
  const normalizedText = scheme.text.trim().toLowerCase();
  const headingColor =
    !normalizedHeading || normalizedHeading === normalizedText
      ? scheme.primary
      : scheme.heading;

  // Core color tokens
  root.style.setProperty("--bg", scheme.background);
  root.style.setProperty("--heading", headingColor);
  root.style.setProperty("--ink", scheme.text);
  root.style.setProperty("--ink-rgb", hexToRgbTriplet(scheme.text));
  root.style.setProperty("--accent", scheme.primary);
  root.style.setProperty("--accent-rgb", hexToRgbTriplet(scheme.primary));
  root.style.setProperty("--muted", scheme.secondary);
  root.style.setProperty("--accent-soft", scheme.secondary);
  root.style.setProperty(
    "--accent-soft-contrast",
    getContrastingTextColor(scheme.secondary),
  );

  // Derive accent-deep from primary (darker shade for hover/active states)
  const accentDeep = dimColor(scheme.primary, 0.8);
  root.style.setProperty("--accent-deep", accentDeep);

  // Alt background
  const altBg = scheme.alt_background || deriveAltBackground(scheme.background);
  root.style.setProperty("--bg-alt", altBg);
  root.style.setProperty("--card", altBg);

  // Border/line
  root.style.setProperty("--line", scheme.secondary);

  // Override glow/gradient variables so the base warm theme doesn't bleed through
  const glow1 = deriveAltBackground(scheme.background);
  const glow2 = deriveAltBackground(altBg);
  root.style.setProperty("--bg-glow-1", glow1);
  root.style.setProperty("--bg-glow-2", glow2);
  root.style.setProperty(
    "--card-accent",
    `linear-gradient(120deg, ${altBg} 0%, ${glow2} 100%)`,
  );
  root.style.setProperty(
    "--preview-card",
    `linear-gradient(140deg, ${altBg} 0%, ${glow1} 100%)`,
  );
};

// Helper: derive a darker shade of a hex color
const dimColor = (hex: string, factor: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * factor));
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * factor));
  const b = Math.max(0, Math.floor((num & 255) * factor));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const hexToRgbTriplet = (hex: string): string => {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : normalized;

  const value = parseInt(expanded, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r} ${g} ${b}`;
};

// Helper: derive a subtle alt background from base background
const deriveAltBackground = (bgColor: string): string => {
  const num = parseInt(bgColor.replace("#", ""), 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 255) * 0.95));
  const g = Math.min(255, Math.floor(((num >> 8) & 255) * 0.95));
  const b = Math.min(255, Math.floor((num & 255) * 0.95));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const getContrastingTextColor = (hexColor: string): string => {
  const normalized = hexColor.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : normalized;

  const value = parseInt(expanded, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance < 0.5 ? "#ffffff" : "#111111";
};

const EVENT_COLOR_OVERRIDE_KEYS = [
  "--bg",
  "--heading",
  "--ink",
  "--ink-rgb",
  "--accent",
  "--accent-rgb",
  "--muted",
  "--accent-soft",
  "--accent-soft-contrast",
  "--accent-deep",
  "--bg-alt",
  "--card",
  "--line",
  "--bg-glow-1",
  "--bg-glow-2",
  "--card-accent",
  "--preview-card",
] as const;

const clearEventColorOverrides = () => {
  const root = document.documentElement;
  EVENT_COLOR_OVERRIDE_KEYS.forEach((key) => {
    root.style.removeProperty(key);
  });
};

export default function HomeRoute() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authenticatedUsername = tokenStorage.getUsername();
  const announcementStorageScope = authenticatedUsername
    ? `auth:${authenticatedUsername}`
    : "guest";
  const tab = normalizeHomeTab(searchParams.get("tab"));
  const [eventData, setEventData] = useState<EventResponse | null>(null);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scheduleDays = useMemo(
    () => buildScheduleDays(eventData?.event_items ?? dummyEventItems),
    [eventData],
  );
  const openDayIndex = useMemo(() => {
    const todayIsoDate = new Date().toISOString().split("T")[0];
    const todayIndex = scheduleDays.findIndex(
      (day) => day.isoDate === todayIsoDate,
    );

    return todayIndex >= 0 ? todayIndex : 0;
  }, [scheduleDays]);
  const navItems = [
    { label: "Events", href: "?tab=events", isActive: tab === "events" },
    { label: "Sponsors", href: "?tab=sponsors", isActive: tab === "sponsors" },
  ];

  // Convert announcements to notices format and filter by active date range
  const notices: LayoutNotice[] = useMemo(() => {
    const now = new Date();
    return announcements
      .filter((announcement) => {
        const starts = new Date(announcement.starts);
        const ends = new Date(announcement.ends);
        return now >= starts && now <= ends;
      })
      .map((announcement) => ({
        id: announcement.id,
        tone: announcement.tone,
        title: announcement.title,
        message: announcement.body,
        ends: announcement.ends,
      }));
  }, [announcements]);

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
        clearEventColorOverrides();
        setLoadError("No event slug provided");
        setIsLoading(false);
        return;
      }
      try {
        // Ensure stale inline vars from prior event don't persist during slug transitions.
        clearEventColorOverrides();
        setIsLoading(true);
        const data = await getEventBySlug(slug);
        if (!isMounted) return;
        setEventData(data);
        applyColorScheme(data.color_scheme);

        // Fetch announcements for this event
        try {
          const eventAnnouncements = await getAnnouncementsByEvent(data.id);
          if (isMounted) {
            setAnnouncements(eventAnnouncements);
          }
        } catch (announcementError) {
          console.error("Failed to load announcements:", announcementError);
          // Don't fail the whole page if announcements fail
        }

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
      clearEventColorOverrides();
    };
  }, [slug]);

  const title = eventData?.title ?? "Today at TAM";
  const heroImageUrl = eventData?.hero_image_url ?? null;

  useEffect(() => {
    const pageLabel = tab === "sponsors" ? "Sponsors" : "Schedule";
    const eventLabel = eventData?.title ?? "TAM Events";
    document.title = `${pageLabel} | ${eventLabel}`;
  }, [eventData?.title, tab]);

  return (
    <LayoutShell
      title={title}
      subtitle=""
      navItems={navItems}
      notices={notices}
      footerLinks={eventData?.footer_links ?? null}
      announcementStorageScope={announcementStorageScope}
      heroImageUrl={heroImageUrl}
      isLoading={isLoading}
      heroAction={
        <button
          onClick={() => navigate(isAuthenticated ? "/admin" : "/login")}
          className="layout__hero-admin-cta"
        >
          {isAuthenticated ? "Go to Admin" : "Admin Login"}
        </button>
      }
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
                <p className="schedule__muted">Loading schedule...</p>
              ) : null}
              {loadError ? (
                <p className="schedule__muted">{loadError}</p>
              ) : null}
            </div>
          </div>

          <div className="schedule">
            {isLoading ? (
              <ScheduleSkeleton />
            ) : (
              scheduleDays.map((day, index) => (
                <Schedule
                  key={day.isoDate}
                  day={day}
                  defaultOpen={index === openDayIndex}
                />
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
