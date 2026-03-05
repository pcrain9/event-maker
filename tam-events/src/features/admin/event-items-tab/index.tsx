import { useState } from "react";
import type { AdminEvent, AdminEventItem } from "../../types";

type EventItemsTabProps = {
  events: AdminEvent[];
  eventItems: AdminEventItem[];
  onEditItem: (item: AdminEventItem) => void;
  onNewItem: () => void;
};

export default function EventItemsTab({
  events,
  eventItems,
  onEditItem,
  onNewItem,
}: EventItemsTabProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    events.length > 0 ? events[0].id : null,
  );

  const filteredItems = selectedEventId
    ? eventItems.filter((item) => item.eventId === selectedEventId)
    : [];

  return (
    <section className="admin-tab-content">
      <div className="admin__panel-header">
        <div>
          <h2>Event Items</h2>
          <p className="admin__muted">
            Manage sessions, speakers, and room assignments.
          </p>
        </div>
        <div className="admin__actions">
          <label className="form__field" style={{ marginRight: "1rem" }}>
            <span>Select Event</span>
            <select
              value={selectedEventId ?? ""}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          {/* <button className="admin__button admin__button--ghost">
            Import CSV
          </button>
          <button
            className="admin__button admin__button--primary"
            onClick={onNewItem}
          >
            New session
          </button> */}
        </div>
      </div>

      {!selectedEventId ? (
        <div className="admin__card">
          <p
            className="admin__muted"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            Please select an event to view and manage its items.
          </p>
        </div>
      ) : (
        <>
          <div className="admin__grid">
            <div className="admin__card">
              <p className="admin__eyebrow">Upcoming sessions</p>
              <h3>
                {
                  filteredItems.filter((item) =>
                    ["live", "up-next"].includes(item.status),
                  ).length
                }
              </h3>
              <p className="admin__muted">Items in the next rotation window.</p>
            </div>
            <div className="admin__card">
              <p className="admin__eyebrow">Draft changes</p>
              <h3>
                {filteredItems.filter((item) => item.status === "draft").length}
              </h3>
              <p className="admin__muted">Unpublished edits awaiting review.</p>
            </div>
          </div>

          <div className="admin__card">
            <div className="admin__card-header">
              <div>
                <h3>Session list</h3>
                <p className="admin__muted">
                  Current agenda rows and presenters.
                </p>
              </div>
              <button
                className="admin__button admin__button--ghost"
                onClick={onNewItem}
              >
                Add item
              </button>
            </div>
            <div className="admin__table">
              {filteredItems.length === 0 ? (
                <p
                  className="admin__muted"
                  style={{ padding: "1rem", textAlign: "center" }}
                >
                  No event items found for this event.
                </p>
              ) : (
                filteredItems.map((item) => (
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
                        onClick={() => onEditItem(item)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
