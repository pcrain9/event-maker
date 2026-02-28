import type { AdminEvent, AdminEventItem } from "../../types";

type EventsTabProps = {
  events: AdminEvent[];
  eventItems: AdminEventItem[];
};

export default function EventsTab({ events, eventItems }: EventsTabProps) {
  return (
    <section className="admin-tab-content">
      <div className="admin__panel-header">
        <div>
          <h2>Events</h2>
          <p className="admin__muted">
            Curate event shells and publish status.
          </p>
        </div>
        <div className="admin__actions">
          <button className="admin__button admin__button--ghost">
            New event
          </button>
        </div>
      </div>

      <div className="admin__grid">
        <div className="admin__card admin__card--accent">
          <p className="admin__eyebrow">Active events</p>
          <h3>{events.filter((event) => event.status === "live").length}</h3>
          <p className="admin__muted">Live schedules on the homepage.</p>
        </div>
        <div className="admin__card">
          <p className="admin__eyebrow">Total sessions</p>
          <h3>{eventItems.length}</h3>
          <p className="admin__muted">Session count across all events.</p>
        </div>
      </div>

      <div className="admin__card">
        <div className="admin__card-header">
          <div>
            <h3>Event shells</h3>
            <p className="admin__muted">Tap into event-level details.</p>
          </div>
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
                <span className="admin__count">{event.itemsCount} items</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
