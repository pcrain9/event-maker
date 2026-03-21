import type { AdminEvent } from "../../../types";

type EventsTabProps = {
  events: AdminEvent[];
  isLoading: boolean;
  error: string | null;
  onNewEvent: () => void;
  onEditEvent: (event: AdminEvent) => void;
  onDeleteEvent: (event: AdminEvent) => void;
};

export default function EventsTab({
  events,
  isLoading,
  error,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
}: EventsTabProps) {
  const totalSessions = events.reduce(
    (sum, event) => sum + event.itemsCount,
    0,
  );

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
          <button className="admin__button admin__button--primary" onClick={onNewEvent}>
            New event
          </button>
        </div>
      </div>

      <div className="admin__grid">
        <div className="admin__card">
          <p className="admin__eyebrow">Total sessions</p>
          <h3>{totalSessions}</h3>
          <p className="admin__muted">Session count across all events.</p>
        </div>
      </div>

      <div className="admin__card">
        <div className="admin__card-header">
          <div>
            <h3>Total events</h3>
          </div>
        </div>
        {isLoading ? (
          <p className="admin__muted" style={{ padding: "1rem" }}>
            Loading events...
          </p>
        ) : error ? (
          <p
            className="admin__muted"
            style={{ padding: "1rem", color: "#b91c1c" }}
          >
            {error}
          </p>
        ) : events.length === 0 ? (
          <p className="admin__muted" style={{ padding: "1rem" }}>
            No events found.
          </p>
        ) : (
          <ul className="admin__list">
            {events.map((event) => (
              <li key={event.id} className="admin__list-item">
                <div>
                  <p className="admin__list-title">{event.title}</p>
                  <p className="admin__muted">
                    {event.footer_links?.length ?? 0} footer links
                  </p>
                </div>
                <div className="admin__list-meta">
                  <span className="admin__pill" data-tone={event.status}>
                    {event.status}
                  </span>
                  <span className="admin__count">{event.itemsCount} items</span>
                  <button
                    className="admin__button admin__button--ghost"
                    onClick={() => onEditEvent(event)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin__button admin__button--ghost"
                    onClick={() => onDeleteEvent(event)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
