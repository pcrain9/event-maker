import { useEffect, useState } from "react";
import { getEvents, getEventBySlug } from "../../../api";
import { formatSessionTime } from "../../../utils/date";
import type { EventResponse, AdminEventItem } from "../../../types";

type EventItemsTabProps = {
  onEditItem: (item: AdminEventItem) => void;
  onNewItem: () => void;
};

export default function EventItemsTab({
  onEditItem,
  onNewItem,
}: EventItemsTabProps) {
  const [events, setEvents] = useState<
    { id: number; slug: string; title: string }[]
  >([]);
  const [eventItems, setEventItems] = useState<AdminEventItem[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEvents();
        setEvents(response.events);
        setError(null);
      } catch (err) {
        setError("Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch event items when selected event changes
  useEffect(() => {
    if (!selectedEventSlug) {
      setEventItems([]);
      return;
    }

    const fetchEventItems = async () => {
      try {
        const response: EventResponse = await getEventBySlug(selectedEventSlug);
        setEventItems(
          response.event_items.map((item) => ({
            ...item,
            event_id: response.id,
          })),
        );
        setError(null);
      } catch (err) {
        setError("Failed to load event items");
        console.error(err);
      }
    };

    fetchEventItems();
  }, [selectedEventSlug]);

  if (loading) {
    return (
      <section className="admin-tab-content">
        <p
          className="admin__muted"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          Loading events...
        </p>
      </section>
    );
  }

  const filteredItems = eventItems;

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
              value={selectedEventSlug ?? ""}
              onChange={(e) => setSelectedEventSlug(e.target.value || null)}
            >
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.slug}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="admin__card" style={{ color: "red", padding: "1rem" }}>
          <p>{error}</p>
        </div>
      )}

      {!selectedEventSlug ? (
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
              <p className="admin__eyebrow">Total sessions</p>
              <h3>{filteredItems.length}</h3>
              <p className="admin__muted">Sessions in this event.</p>
            </div>
            <div className="admin__card">
              <p className="admin__eyebrow">Cancelled</p>
              <h3>{filteredItems.filter((item) => item.cancelled).length}</h3>
              <p className="admin__muted">Sessions marked as cancelled.</p>
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
                        {[
                          formatSessionTime(new Date(item.time)),
                          item.location || "",
                          item.speakers?.map((s) => s.name).join(", "),
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                    <div className="admin__list-meta">
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
