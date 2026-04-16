import { useState, useEffect } from "react";
import { createEventItem, updateEventItem } from "../../../api";
import { useToastStore } from "../../../components/toast/store/toastStore";
import type { AdminEvent, AdminEventItem, Speaker } from "../../../types";
import type { EventItemCreate, EventItemUpdate } from "../../../types";
import { toDateTimeLocalValue } from "../../../utils/date";

type EventItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: AdminEventItem | null;
  initialEventId?: number | null;
  events: AdminEvent[];
  onSave?: (item: AdminEventItem) => void;
};

export default function EventItemModal({
  isOpen,
  onClose,
  selectedItem,
  initialEventId,
  events,
  onSave,
}: EventItemModalProps) {
  // Toast store
  const addToast = useToastStore((state) => state.addToast);

  // Form state
  const [formData, setFormData] = useState<EventItemUpdate>({});
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEventTitle =
    events.find((event) => event.id === selectedEventId)?.title ?? "";

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
      setSelectedEventId(selectedItem.event_id);
    } else {
      setFormData({
        title: "",
        sponsor: "",
        time: "",
        location: "",
        speakers: [],
        cancelled: false,
        slides: [],
      });
      setSelectedEventId(initialEventId ?? events[0]?.id ?? null);
    }
    setError(null);
  }, [selectedItem, isOpen, initialEventId, events]);

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

  const handleAddSpeaker = () => {
    const newSpeaker: Speaker = {
      name: "",
      headshot: "",
      institution: "",
    };
    const currentSpeakers = (formData.speakers as Speaker[] | undefined) || [];
    handleInputChange("speakers", [...currentSpeakers, newSpeaker]);
  };

  const handleUpdateSpeaker = (
    index: number,
    field: keyof Speaker,
    value: string,
  ) => {
    const currentSpeakers = (formData.speakers as Speaker[] | undefined) || [];
    const updatedSpeakers = [...currentSpeakers];
    updatedSpeakers[index] = {
      ...updatedSpeakers[index],
      [field]: value,
    };
    handleInputChange("speakers", updatedSpeakers);
  };

  const handleDeleteSpeaker = (index: number) => {
    const currentSpeakers = (formData.speakers as Speaker[] | undefined) || [];
    const updatedSpeakers = currentSpeakers.filter((_, i) => i !== index);
    handleInputChange("speakers", updatedSpeakers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      const errorMsg = "Title is required";
      setError(errorMsg);
      addToast({ type: "error", message: errorMsg });
      return;
    }

    if (!selectedItem && !selectedEventId) {
      const errorMsg = "An event is required";
      setError(errorMsg);
      addToast({ type: "error", message: errorMsg });
      return;
    }

    if (!formData.time) {
      const errorMsg = "Session time is required";
      setError(errorMsg);
      addToast({ type: "error", message: errorMsg });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let savedItem: AdminEventItem;

      if (selectedItem) {
        const eventId = selectedItem.event_id;
        const itemId = selectedItem.id;

        await updateEventItem(eventId, itemId, formData);
        savedItem = {
          ...selectedItem,
          ...formData,
        };
      } else {
        const created = await createEventItem(selectedEventId as number, {
          title: formData.title.trim(),
          time: formData.time,
          sponsor: formData.sponsor ?? null,
          speakers: formData.speakers ?? null,
          link: formData.link ?? null,
          description: formData.description ?? null,
          location: formData.location ?? null,
          cancelled: formData.cancelled ?? false,
          slides: formData.slides ?? null,
        } satisfies EventItemCreate);
        savedItem = created;
      }

      // Show success toast
      addToast({
        type: "success",
        message: `"${formData.title}" ${selectedItem ? "updated" : "created"} successfully`,
      });

      // Notify parent component of successful save
      if (onSave) {
        onSave(savedItem);
      }

      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save event item";
      setError(message);
      addToast({
        type: "error",
        message: message,
      });
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
          <form className="form" onSubmit={handleSubmit}>
            {error && (
              <p className="admin__muted" style={{ color: "#b91c1c" }}>
                {error}
              </p>
            )}

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

            <label className="form__field">
              <span>Event</span>
              <input
                type="text"
                value={selectedEventTitle}
                disabled
                readOnly
                placeholder="Assigned event"
              />
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

            <div className="form__row">
              <label className="form__field">
                <span>Session time</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocalValue(formData.time)}
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
                Total speakers:{" "}
                {(formData.speakers as Speaker[] | undefined)?.length ?? 0}
              </p>

              {/* Speakers List */}
              {((formData.speakers as Speaker[] | undefined)?.length ??
              0 > 0) ? (
                <div style={{ marginBottom: "1rem" }}>
                  {(formData.speakers as Speaker[]).map((speaker, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "4px",
                        marginBottom: "0.75rem",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <div style={{ marginBottom: "0.5rem" }}>
                        <label
                          style={{
                            fontSize: "0.75rem",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Speaker name
                        </label>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) =>
                            handleUpdateSpeaker(idx, "name", e.target.value)
                          }
                          placeholder="John Doe"
                          disabled={loading}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: "0.5rem" }}>
                        <label
                          style={{
                            fontSize: "0.75rem",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Institution
                        </label>
                        <input
                          type="text"
                          value={speaker.institution}
                          onChange={(e) =>
                            handleUpdateSpeaker(
                              idx,
                              "institution",
                              e.target.value,
                            )
                          }
                          placeholder="University/Company Name"
                          disabled={loading}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: "0.5rem" }}>
                        <label
                          style={{
                            fontSize: "0.75rem",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Headshot URL
                        </label>
                        <input
                          type="text"
                          value={speaker.headshot}
                          onChange={(e) =>
                            handleUpdateSpeaker(idx, "headshot", e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                          disabled={loading}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSpeaker(idx)}
                        disabled={loading}
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                      >
                        Delete speaker
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="admin__muted"
                  style={{ fontSize: "0.85rem", marginBottom: "1rem" }}
                >
                  No speakers added yet
                </p>
              )}

              {/* Add Speaker Button */}
              <button
                type="button"
                onClick={handleAddSpeaker}
                disabled={loading}
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#2563eb",
                  border: "1px solid #93c5fd",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                + Add speaker
              </button>
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
            {loading
              ? "Saving..."
              : selectedItem
                ? "Save changes"
                : "Create session"}
          </button>
        </div>
      </div>
    </div>
  );
}
