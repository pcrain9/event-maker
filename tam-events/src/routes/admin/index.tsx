import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LayoutShell from "../../components/layout/LayoutShell";
import type {
  AdminAnnouncement,
  AdminEvent,
  AdminEventItem,
  AdminTab,
  ThemeColors,
} from "../../types";

const DEFAULT_TAB: AdminTab = "events";

const normalizeAdminTab = (value: string | null): AdminTab => {
  if (value === "events" || value === "announcements" || value === "theme") {
    return value;
  }
  return DEFAULT_TAB;
};

export default function AdminRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = normalizeAdminTab(searchParams.get("tab"));
  const [activeModal, setActiveModal] = useState<
    "event-item" | "announcement" | "theme" | null
  >(null);
  const [selectedItem, setSelectedItem] = useState<AdminEventItem | null>(null);
  const [themeDraft, setThemeDraft] = useState<ThemeColors>({
    primary: "#c5522a",
    secondary: "#f2c6a7",
    tertiary: "#efe3d6",
    background: "#f6efe7",
    alt_background: "#fffaf4",
    text: "#1f1c16",
    title_text: "#1f1c16",
  });
  const events: AdminEvent[] = useMemo(
    () => [
      {
        id: 1,
        title: "TAM Annual Summit",
        dateRange: "Feb 7-9, 2026",
        location: "Austin, TX",
        status: "live",
        itemsCount: 18,
      },
      {
        id: 2,
        title: "Collections Leadership Lab",
        dateRange: "Mar 12-13, 2026",
        location: "Houston, TX",
        status: "draft",
        itemsCount: 6,
      },
      {
        id: 3,
        title: "Member Programs Showcase",
        dateRange: "Apr 4, 2026",
        location: "Dallas, TX",
        status: "archived",
        itemsCount: 9,
      },
    ],
    [],
  );
  const eventItems: AdminEventItem[] = useMemo(
    () => [
      {
        id: 201,
        eventId: 1,
        title: "Welcome and opening remarks",
        time: "9:00 AM",
        room: "Main Hall",
        speaker: "Dr. Naomi Wells",
        status: "live",
      },
      {
        id: 202,
        eventId: 1,
        title: "Designing for daily momentum",
        time: "10:30 AM",
        room: "Studio A",
        speaker: "Tia Alvarez",
        status: "up-next",
      },
      {
        id: 203,
        eventId: 1,
        title: "Operational craft workshop",
        time: "1:00 PM",
        room: "Workshop B",
        speaker: "Rohan Patel",
        status: "later",
      },
      {
        id: 301,
        eventId: 2,
        title: "Exhibit prep lab",
        time: "9:30 AM",
        room: "Lab 2",
        speaker: "Mila Cheng",
        status: "draft",
      },
    ],
    [],
  );
  const announcements: AdminAnnouncement[] = useMemo(
    () => [
      {
        id: 1,
        title: "Badge pickup moved",
        body: "Registration is now at Ballroom B. Doors open at 7:30 AM.",
        tone: "warning",
        starts: "Feb 7, 7:00 AM",
        ends: "Feb 7, 11:00 AM",
      },
      {
        id: 2,
        title: "Shuttle standby",
        body: "Afternoon shuttles pause at 4:30 PM. Plan early exits.",
        tone: "info",
        starts: "Feb 7, 2:00 PM",
        ends: "Feb 7, 6:00 PM",
      },
    ],
    [],
  );
  const navItems = [
    { label: "Events", href: "?tab=events", isActive: tab === "events" },
    {
      label: "Announcements",
      href: "?tab=announcements",
      isActive: tab === "announcements",
    },
    { label: "Theme", href: "?tab=theme", isActive: tab === "theme" },
  ];
  const notices = [
    {
      tone: "warning" as const,
      title: "Draft changes only",
      message:
        "Publishing is disabled in staging. Updates here are preview-only.",
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
    if (!activeModal) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
        setSelectedItem(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeModal]);

  const openEventItemModal = (item?: AdminEventItem) => {
    setSelectedItem(item ?? null);
    setActiveModal("event-item");
  };

  const openAnnouncementModal = () => {
    setSelectedItem(null);
    setActiveModal("announcement");
  };

  const openThemeModal = () => {
    setSelectedItem(null);
    setActiveModal("theme");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
  };

  const updateTheme = (key: keyof ThemeColors, value: string) => {
    setThemeDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <LayoutShell
      title="Admin Studio"
      subtitle="Curate the schedule, spotlight announcements, and tune the conference palette."
      navItems={navItems}
      notices={notices}
    >
      {tab === "events" && (
        <section className="layout__panel">
          <div className="admin__panel-header">
            <div>
              <h2>Events & Items</h2>
              <p className="admin__muted">
                Curate event shells, session timing, and schedule highlights.
              </p>
            </div>
            <div className="admin__actions">
              <button className="admin__button admin__button--ghost">
                Import CSV
              </button>
              <button
                className="admin__button admin__button--primary"
                onClick={() => openEventItemModal()}
              >
                New session
              </button>
            </div>
          </div>

          <div className="admin__grid">
            <div className="admin__card admin__card--accent">
              <p className="admin__eyebrow">Active events</p>
              <h3>
                {events.filter((event) => event.status === "live").length}
              </h3>
              <p className="admin__muted">Live schedules on the homepage.</p>
            </div>
            <div className="admin__card">
              <p className="admin__eyebrow">Upcoming sessions</p>
              <h3>
                {
                  eventItems.filter((item) =>
                    ["live", "up-next"].includes(item.status),
                  ).length
                }
              </h3>
              <p className="admin__muted">Items in the next rotation window.</p>
            </div>
            <div className="admin__card">
              <p className="admin__eyebrow">Draft changes</p>
              <h3>
                {eventItems.filter((item) => item.status === "draft").length}
              </h3>
              <p className="admin__muted">Unpublished edits awaiting review.</p>
            </div>
          </div>

          <div className="admin__split">
            <div className="admin__card">
              <div className="admin__card-header">
                <div>
                  <h3>Event shells</h3>
                  <p className="admin__muted">Tap into event-level details.</p>
                </div>
                <button className="admin__button admin__button--ghost">
                  New event
                </button>
              </div>
              <ul className="admin__list">
                {events.map((event) => (
                  <li key={event.id} className="admin__list-item">
                    <div>
                      <p className="admin__list-title">{event.title}</p>
                      <p className="admin__muted">
                        {event.dateRange} • {event.location}
                      </p>
                    </div>
                    <div className="admin__list-meta">
                      <span className="admin__pill" data-tone={event.status}>
                        {event.status}
                      </span>
                      <span className="admin__count">
                        {event.itemsCount} items
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin__card">
              <div className="admin__card-header">
                <div>
                  <h3>Event items</h3>
                  <p className="admin__muted">
                    Manage sessions, speakers, and rooms.
                  </p>
                </div>
                <button
                  className="admin__button admin__button--ghost"
                  onClick={() => openEventItemModal()}
                >
                  Add item
                </button>
              </div>
              <div className="admin__table">
                {eventItems.map((item) => (
                  <div key={item.id} className="admin__row">
                    <div>
                      <p className="admin__list-title">{item.title}</p>
                      <p className="admin__muted">
                        {item.time} • {item.room} • {item.speaker}
                      </p>
                    </div>
                    <div className="admin__list-meta">
                      <span className="admin__pill" data-tone={item.status}>
                        {item.status}
                      </span>
                      <button
                        className="admin__button admin__button--ghost"
                        onClick={() => openEventItemModal(item)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {tab === "announcements" && (
        <section className="layout__panel">
          <div className="admin__panel-header">
            <div>
              <h2>Announcements</h2>
              <p className="admin__muted">
                Craft urgency and guidance for attendees in real time.
              </p>
            </div>
            <button
              className="admin__button admin__button--primary"
              onClick={openAnnouncementModal}
            >
              New announcement
            </button>
          </div>
          <div className="admin__grid admin__grid--dense">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="admin__card">
                <div className="admin__card-header">
                  <div>
                    <p className="admin__eyebrow">{announcement.tone}</p>
                    <h3>{announcement.title}</h3>
                  </div>
                  <span className="admin__pill" data-tone={announcement.tone}>
                    {announcement.tone}
                  </span>
                </div>
                <p className="admin__muted">{announcement.body}</p>
                <div className="admin__card-footer">
                  <span>
                    {announcement.starts} → {announcement.ends}
                  </span>
                  <div className="admin__actions">
                    <button className="admin__button admin__button--ghost">
                      Duplicate
                    </button>
                    <button className="admin__button admin__button--ghost">
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {tab === "theme" && (
        <section className="layout__panel">
          <div className="admin__panel-header">
            <div>
              <h2>Theme Studio</h2>
              <p className="admin__muted">
                Align the experience with the event palette in one move.
              </p>
            </div>
            <button
              className="admin__button admin__button--primary"
              onClick={openThemeModal}
            >
              Open theme editor
            </button>
          </div>
          <div className="admin__split">
            <div className="admin__card">
              <h3>Current palette</h3>
              <div className="admin__swatches">
                {Object.entries(themeDraft).map(([key, value]) => (
                  <div key={key} className="admin__swatch">
                    <span
                      className="admin__swatch-color"
                      style={{ backgroundColor: value }}
                    />
                    <div>
                      <p className="admin__list-title">{key}</p>
                      <p className="admin__muted">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin__card admin__preview">
              <h3>Preview</h3>
              <div className="admin__preview-card">
                <p className="admin__eyebrow">Theme preview</p>
                <h4>Welcome to TAM</h4>
                <p className="admin__muted">
                  Primary actions, subtle backgrounds, and type hierarchy update
                  instantly when you publish.
                </p>
                <button className="admin__button admin__button--primary">
                  Primary CTA
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeModal && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__backdrop" onClick={closeModal} />
          <div className="modal__panel">
            <div className="modal__header">
              <div>
                <p className="admin__eyebrow">Admin</p>
                <h3>
                  {activeModal === "event-item" &&
                    (selectedItem ? "Edit session" : "New session")}
                  {activeModal === "announcement" && "New announcement"}
                  {activeModal === "theme" && "Theme editor"}
                </h3>
              </div>
              <button
                className="admin__button admin__button--ghost"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
            <div className="modal__body">
              {activeModal === "event-item" && (
                <form
                  className="form"
                  key={selectedItem?.id ?? "new"}
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label className="form__field">
                    <span>Session title</span>
                    <input
                      type="text"
                      defaultValue={selectedItem?.title ?? ""}
                      placeholder="Session title"
                    />
                  </label>
                  <div className="form__row">
                    <label className="form__field">
                      <span>Event</span>
                      <select defaultValue={selectedItem?.eventId ?? 1}>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form__field">
                      <span>Status</span>
                      <select defaultValue={selectedItem?.status ?? "draft"}>
                        <option value="draft">Draft</option>
                        <option value="up-next">Up next</option>
                        <option value="later">Later</option>
                        <option value="live">Live</option>
                      </select>
                    </label>
                  </div>
                  <div className="form__row">
                    <label className="form__field">
                      <span>Time</span>
                      <input
                        type="text"
                        defaultValue={selectedItem?.time ?? ""}
                        placeholder="9:00 AM"
                      />
                    </label>
                    <label className="form__field">
                      <span>Room</span>
                      <input
                        type="text"
                        defaultValue={selectedItem?.room ?? ""}
                        placeholder="Main Hall"
                      />
                    </label>
                  </div>
                  <label className="form__field">
                    <span>Speaker</span>
                    <input
                      type="text"
                      defaultValue={selectedItem?.speaker ?? ""}
                      placeholder="Speaker name"
                    />
                  </label>
                  <label className="form__field">
                    <span>Session notes</span>
                    <textarea
                      rows={3}
                      placeholder="Add links, sponsors, or extended notes"
                    />
                  </label>
                </form>
              )}
              {activeModal === "announcement" && (
                <form
                  className="form"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label className="form__field">
                    <span>Title</span>
                    <input type="text" placeholder="Announcement title" />
                  </label>
                  <label className="form__field">
                    <span>Message</span>
                    <textarea
                      rows={4}
                      placeholder="What do attendees need to know?"
                    />
                  </label>
                  <div className="form__row">
                    <label className="form__field">
                      <span>Tone</span>
                      <select defaultValue="info">
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="danger">Danger</option>
                      </select>
                    </label>
                    <label className="form__field">
                      <span>Expiry</span>
                      <input type="text" placeholder="Feb 7, 6:00 PM" />
                    </label>
                  </div>
                </form>
              )}
              {activeModal === "theme" && (
                <div className="form">
                  {(
                    [
                      "primary",
                      "secondary",
                      "tertiary",
                      "background",
                      "alt_background",
                      "text",
                      "title_text",
                    ] as (keyof ThemeColors)[]
                  ).map((key) => (
                    <label key={key} className="form__field form__field--color">
                      <span>{key}</span>
                      <div className="form__color">
                        <input
                          type="color"
                          value={themeDraft[key]}
                          onChange={(event) =>
                            updateTheme(key, event.target.value)
                          }
                        />
                        <input
                          type="text"
                          value={themeDraft[key]}
                          onChange={(event) =>
                            updateTheme(key, event.target.value)
                          }
                        />
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="admin__button admin__button--ghost"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button className="admin__button admin__button--primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutShell>
  );
}
