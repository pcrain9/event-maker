import type { AdminAnnouncement } from "../../../types";

type AnnouncementsTabProps = {
  announcements: AdminAnnouncement[];
  onNewAnnouncement: () => void;
};

export default function AnnouncementsTab({
  announcements,
  onNewAnnouncement,
}: AnnouncementsTabProps) {
  return (
    <section className="admin-tab-content">
      <div className="admin__panel-header">
        <div>
          <h2>Announcements</h2>
        </div>
        <button
          className="admin__button admin__button--primary"
          onClick={onNewAnnouncement}
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
  );
}
