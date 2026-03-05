import { useState, useEffect } from "react";
import { updateEventItem } from "../../../api";
import type { AdminEvent, AdminEventItem, Speaker } from "../../../types";
import type { EventItemUpdate } from "../../../types";

type EventItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: AdminEventItem | null;
  events: AdminEvent[];
  onSave?: (item: AdminEventItem) => void;
};

export default function EventItemModal({
  isOpen,
  onClose,
  selectedItem,
  events,
  onSave,
}: EventItemModalProps) {
  // Form state
  const [formData, setFormData] = useState<EventItemUpdate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when modal opens or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        title: selectedItem.title,
        sponsor: selectedItem.sponsor,
        time: selectedItem.time,
        speakers: selectedItem.speakers || [],
        link: selectedItem.link,
        description: selectedItem.description,
        location: selectedItem.location,
        cancelled: selectedItem.cancelled,
        slides: selectedItem.slides,
      });
    } else {
      setFormData({
        title: "",
        sponsor: "",
        location: "",
        speakers: [],
        cancelled: false,
      });
    }
    setError(null);
  }, [selectedItem, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    key: keyof EventItemUpdate,
    value: string | boolean | Speaker[] | string[] | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      setError("No event item selected");
      return;
    }

    if (!formData.title?.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const eventId = selectedItem.event_id;
      const itemId = selectedItem.id;

      // Call the API to update the item
      await updateEventItem(eventId, itemId, formData);

      // Notify parent component of successful save
      if (onSave) {
        onSave({
          ...selectedItem,
          ...formData,
        });
      }

      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save event item";
      setError(message);
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <p className="admin__eyebrow">Admin</p>
            <h3>{selectedItem ? "Edit session" : "New session"}</h3>
          </div>
          <button
            className="admin__button admin__button--ghost"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>
        <div className="modal__body">
          {error && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#fee",
                border: "1px solid #f99",
                borderRadius: "4px",
                color: "#c00",
              }}
            >
              {error}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <label className="form__field">
              <span>Session title</span>
              <input
                type="text"
                value={formData.title ?? ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Session title"
                disabled={loading}
              />
            </label>

            <div className="form__row">
              <label className="form__field">
                <span>Event</span>
                <select
                  defaultValue={selectedItem?.event_id ?? 1}
                  disabled={!selectedItem || loading}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form__field">
                <span>Cancelled</span>
                <select
                  value={formData.cancelled ? "true" : "false"}
                  onChange={(e) =>
                    handleInputChange("cancelled", e.target.value === "true")
                  }
                  disabled={loading}
                >
                  <option value="false">Not cancelled</option>
                  <option value="true">Cancelled</option>
                </select>
              </label>
            </div>

            <div className="form__row">
              <label className="form__field">
                <span>Session time</span>
                <input
                  type="datetime-local"
                  value={
                    formData.time
                      ? new Date(formData.time as string)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  disabled={loading}
                />
              </label>

              <label className="form__field">
                <span>Location</span>
                <input
                  type="text"
                  value={formData.location ?? ""}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Main Hall"
                  disabled={loading}
                />
              </label>
            </div>

            <label className="form__field">
              <span>Sponsor</span>
              <input
                type="text"
                value={formData.sponsor ?? ""}
                onChange={(e) => handleInputChange("sponsor", e.target.value)}
                placeholder="Sponsor name"
                disabled={loading}
              />
            </label>

            <label className="form__field">
              <span>Link</span>
              <input
                type="text"
                value={formData.link ?? ""}
                onChange={(e) => handleInputChange("link", e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
              />
            </label>

            <label className="form__field">
              <span>Description</span>
              <textarea
                rows={3}
                value={formData.description ?? ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Add session description"
                disabled={loading}
              />
            </label>

            <div className="form__field">
              <span>Speakers</span>
              <p className="admin__muted" style={{ fontSize: "0.85rem" }}>
                Current speakers:{" "}
                {(formData.speakers as Speaker[] | undefined)?.length ?? 0}
              </p>
              {(formData.speakers as Speaker[] | undefined)?.map(
                (speaker, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 500 }}>{speaker.name}</p>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                      {speaker.institution}
                    </p>
                  </div>
                ),
              )}
              <p className="admin__muted" style={{ fontSize: "0.75rem" }}>
                Speaker management coming soon
              </p>
            </div>
          </form>
        </div>

        <div className="modal__footer">
          <button
            className="admin__button admin__button--ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="admin__button admin__button--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
