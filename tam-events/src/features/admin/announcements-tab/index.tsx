import { useState, useEffect, useCallback } from "react";
import type { AdminAnnouncement } from "../../../types";
import { deleteAnnouncement, getAnnouncementsByEvent } from "../../../api";
import { useToast } from "../../../components/toast";
import { formatShortDateTime } from "../../../utils/date";

type AnnouncementsTabProps = {
  onNewAnnouncement: () => void;
  onEditAnnouncement: (announcement: AdminAnnouncement) => void;
  eventSlugs: Array<{ id: number; slug: string; title: string }>;
  refreshKey?: number;
};

export default function AnnouncementsTab({
  onNewAnnouncement,
  onEditAnnouncement,
  eventSlugs,
  refreshKey = 0,
}: AnnouncementsTabProps) {
  const toast = useToast();
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(
    null,
  );
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Find the selected event ID from slug
  const selectedEventId = eventSlugs.find(
    (e) => e.slug === selectedEventSlug,
  )?.id;

  // Fetch announcements for the selected event
  const fetchAnnouncements = useCallback(async () => {
    if (!selectedEventId) {
      setAnnouncements([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getAnnouncementsByEvent(selectedEventId);
      setAnnouncements(data);
      setError(null);
    } catch (err) {
      setError("Failed to load announcements");
      console.error(err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  // Fetch announcements when selected event changes
  useEffect(() => {
    const fetch = async () => {
      await fetchAnnouncements();
    };
    fetch();
  }, [selectedEventId, fetchAnnouncements, refreshKey]);

  const handleDeleteAnnouncement = async (announcement: AdminAnnouncement) => {
    const confirmed = window.confirm(
      `Delete announcement "${announcement.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeletingAnnouncementId(announcement.id);
      await deleteAnnouncement(announcement.id);

      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id),
      );
      toast.success("Announcement deleted");
    } catch (deleteError) {
      console.error("Failed to delete announcement", deleteError);
      toast.error("Failed to delete announcement");
    } finally {
      setDeletingAnnouncementId(null);
    }
  };

  return (
    <section className="admin-tab-content">
      <div className="admin__panel-header">
        <div>
          <h2>Announcements</h2>
        </div>
        <div className="admin__actions">
          <label className="form__field" style={{ marginRight: "1rem" }}>
            <span>Select event</span>
            <select
              value={selectedEventSlug ?? ""}
              onChange={(e) => setSelectedEventSlug(e.target.value || null)}
            >
              <option value="">Select event</option>
              {eventSlugs.map((event) => (
                <option key={event.id} value={event.slug}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          <button
            className="admin__button admin__button--primary"
            onClick={onNewAnnouncement}
          >
            New announcement
          </button>
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
            Please select an event to view and manage its announcements.
          </p>
        </div>
      ) : loading ? (
        <div className="admin__card">
          <p
            className="admin__muted"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            Loading announcements...
          </p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="admin__card">
          <p
            className="admin__muted"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            No announcements found for this event.
          </p>
        </div>
      ) : (
        <div className="admin__grid admin__grid--dense">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="admin__card">
              <div className="admin__card-header">
                <div>
                  <h3>{announcement.title}</h3>
                </div>
                <span className="admin__pill" data-tone={announcement.tone}>
                  {announcement.tone}
                </span>
              </div>
              <p className="admin__muted">{announcement.body}</p>
              <div className="admin__card-footer">
                <span>
                  {formatShortDateTime(new Date(announcement.starts))}
                  {" -> "}
                  {formatShortDateTime(new Date(announcement.ends))}
                </span>
                <div className="admin__actions">
                  <button
                    className="admin__button admin__button--ghost"
                    onClick={() => onEditAnnouncement(announcement)}
                    disabled={deletingAnnouncementId === announcement.id}
                  >
                    Edit
                  </button>
                  <button
                    className="admin__button admin__button--ghost"
                    onClick={() => void handleDeleteAnnouncement(announcement)}
                    disabled={deletingAnnouncementId === announcement.id}
                  >
                    {deletingAnnouncementId === announcement.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
