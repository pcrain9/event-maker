import { useState, useEffect } from "react";
import { createAnnouncement, updateAnnouncement } from "../../../api";
import { useToast } from "../../../components/toast";
import type { AdminAnnouncement } from "../../../types";
import { toDateTimeLocalValue } from "../../../utils/date";

const TONE_COLORS = {
  info: "#2563eb",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
} as const;

type AnnouncementTone = keyof typeof TONE_COLORS;

type AnnouncementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  events: Array<{ id: number; slug: string; title: string }>;
  selectedAnnouncement?: AdminAnnouncement | null;
  onSave?: () => void;
};

export default function AnnouncementModal({
  isOpen,
  onClose,
  events,
  selectedAnnouncement,
  onSave,
}: AnnouncementModalProps) {
  const toast = useToast();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<AnnouncementTone>("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = !!selectedAnnouncement;

  // Populate form when editing
  useEffect(() => {
    if (selectedAnnouncement) {
      setSelectedEventId(selectedAnnouncement.event_id);
      setSelectedTone(selectedAnnouncement.tone as AnnouncementTone);
      setTitle(selectedAnnouncement.title);
      setMessage(selectedAnnouncement.body);
      setStartsAt(toDateTimeLocalValue(selectedAnnouncement.starts));
      setEndsAt(toDateTimeLocalValue(selectedAnnouncement.ends));
    } else {
      // Reset form when creating new
      setSelectedEventId(null);
      setSelectedTone("info");
      setTitle("");
      setMessage("");
      setStartsAt("");
      setEndsAt("");
      setSubmitError(null);
    }
  }, [selectedAnnouncement]);

  const resetForm = () => {
    setSelectedEventId(null);
    setSelectedTone("info");
    setTitle("");
    setMessage("");
    setStartsAt("");
    setEndsAt("");
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedEventId) {
      setSubmitError("Please select an event.");
      return;
    }

    if (!title.trim() || !message.trim() || !startsAt || !endsAt) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    const startsDate = new Date(startsAt);
    const endsDate = new Date(endsAt);
    if (endsDate <= startsDate) {
      setSubmitError("End time must be after start time.");
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError(null);

      if (isEditMode && selectedAnnouncement) {
        // Update existing announcement
        await updateAnnouncement(selectedAnnouncement.id, {
          title: title.trim(),
          body: message.trim(),
          tone: selectedTone,
          starts: startsDate.toISOString(),
          ends: endsDate.toISOString(),
        });
        toast.success("Announcement updated");
      } else {
        // Create new announcement
        await createAnnouncement({
          event_id: selectedEventId,
          title: title.trim(),
          body: message.trim(),
          tone: selectedTone,
          starts: startsDate.toISOString(),
          ends: endsDate.toISOString(),
        });
        toast.success("Announcement created");
      }

      onSave?.();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to save announcement", error);
      setSubmitError(
        `Failed to ${isEditMode ? "update" : "create"} announcement. Please try again.`,
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} announcement`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <p className="admin__eyebrow">Admin</p>
            <h3>{isEditMode ? "Edit announcement" : "New announcement"}</h3>
          </div>
          <button
            className="admin__button admin__button--ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="modal__body">
          <form className="form" id="announcement-form" onSubmit={handleSubmit}>
            <label className="form__field">
              <span>Event</span>
              <select
                value={selectedEventId ?? ""}
                onChange={(e) =>
                  setSelectedEventId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                required
                disabled={isEditMode}
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__field">
              <span>Title</span>
              <input
                type="text"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="form__field">
              <span>Message</span>
              <textarea
                rows={4}
                placeholder="What do attendees need to know?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </label>
            <div className="form__row">
              <label className="form__field form__field--color">
                <span>Tone</span>
                <div className="form__color">
                  <select
                    value={selectedTone}
                    onChange={(e) =>
                      setSelectedTone(e.target.value as AnnouncementTone)
                    }
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                  </select>
                  <span
                    className="form__swatch"
                    style={{ backgroundColor: TONE_COLORS[selectedTone] }}
                    aria-label={`${selectedTone} tone color preview`}
                    title={`Tone color: ${selectedTone}`}
                  />
                </div>
              </label>
            </div>
            <div className="form__row">
              <label className="form__field">
                <span>Start time</span>
                <input
                  type="datetime-local"
                  placeholder="When does this announcement start?"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              </label>
              <label className="form__field">
                <span>End time</span>
                <input
                  type="datetime-local"
                  placeholder="When does this announcement end?"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
                />
              </label>
            </div>
            {submitError && (
              <p className="admin__muted" style={{ color: "#dc2626" }}>
                {submitError}
              </p>
            )}
          </form>
        </div>
        <div className="modal__footer">
          <button
            className="admin__button admin__button--ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="admin__button admin__button--primary"
            type="submit"
            form="announcement-form"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
