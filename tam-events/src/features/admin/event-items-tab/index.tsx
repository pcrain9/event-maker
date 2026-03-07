import { useCallback, useEffect, useState } from "react";
import { getEventBySlug } from "../../../api";
import { formatSessionTime } from "../../../utils/date";
import type { EventResponse, AdminEventItem } from "../../../types";

export type EventItemsTabRef = {
  refreshEventItems: () => Promise<void>;
};

type EventItemsTabProps = {
  events: Array<{ id: number; slug: string; title: string }>;
  onEditItem: (item: AdminEventItem) => void;
  onNewItem: () => void;
  refreshRef?: (ref: EventItemsTabRef) => void;
};

export default function EventItemsTab({
  events,
  onEditItem,
  onNewItem,
  refreshRef,
}: EventItemsTabProps) {
  const [eventItems, setEventItems] = useState<AdminEventItem[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Extract fetchEventItems as a reusable function
  const fetchEventItems = useCallback(async () => {
    if (!selectedEventSlug) {
      setEventItems([]);
      return;
    }

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
  }, [selectedEventSlug]);

  // Expose fetchEventItems to parent component
  useEffect(() => {
    if (refreshRef) {
      refreshRef({ refreshEventItems: fetchEventItems });
    }
  }, [fetchEventItems, refreshRef]);

  // Fetch event items when selected event changes
  useEffect(() => {
    const fetchItems = async () => {
      await fetchEventItems();
    };
    fetchItems();
  }, [selectedEventSlug, fetchEventItems]);

  const filteredItems = eventItems;

  return (
    <section className="admin-tab-content">
      <div className="admin__panel-header">
        <div>
          <h2>Event items</h2>
          <p className="admin__muted">
            Manage sessions, speakers, and room assignments.
          </p>
        </div>
        <div className="admin__actions">
          <label className="form__field" style={{ marginRight: "1rem" }}>
            <span>Select event</span>
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
              <p className="admin__eyebrow">Total event items</p>
              <h3>{filteredItems.length}</h3>
            </div>
            <div className="admin__card">
              <p className="admin__eyebrow">Cancelled event items</p>
              <h3>{filteredItems.filter((item) => item.cancelled).length}</h3>
            </div>
          </div>

          <div className="admin__card">
            <div className="admin__card-header">
              <div>
                <h3>Event item list</h3>
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
