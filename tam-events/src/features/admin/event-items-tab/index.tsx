import type { AdminEventItem } from "../../types";

type EventItemsTabProps = {
  eventItems: AdminEventItem[];
  onEditItem: (item: AdminEventItem) => void;
  onNewItem: () => void;
};

export default function EventItemsTab({
  eventItems,
  onEditItem,
  onNewItem,
}: EventItemsTabProps) {
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
          <button className="admin__button admin__button--ghost">
            Import CSV
          </button>
          <button
            className="admin__button admin__button--primary"
            onClick={onNewItem}
          >
            New session
          </button>
        </div>
      </div>

      <div className="admin__grid">
        <div className="admin__card">
          <p className="admin__eyebrow">Upcoming sessions</p>
          <h3>
            {
              eventItems.filter((item) =>
                ["live", "up-next"].includes(item.status),
              ).length
            }
          </h3>
          <p className="admin__muted">Items in the next rotation window.</p>
        </div>
        <div className="admin__card">
          <p className="admin__eyebrow">Draft changes</p>
          <h3>{eventItems.filter((item) => item.status === "draft").length}</h3>
          <p className="admin__muted">Unpublished edits awaiting review.</p>
        </div>
      </div>

      <div className="admin__card">
        <div className="admin__card-header">
          <div>
            <h3>Session list</h3>
            <p className="admin__muted">Current agenda rows and presenters.</p>
          </div>
          <button
            className="admin__button admin__button--ghost"
            onClick={onNewItem}
          >
            Add item
          </button>
        </div>
        <div className="admin__table">
          {eventItems.map((item) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
