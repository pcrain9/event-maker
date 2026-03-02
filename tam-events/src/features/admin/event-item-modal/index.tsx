import type { AdminEvent, AdminEventItem } from "../../types";

type EventItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: AdminEventItem | null;
  events: AdminEvent[];
};

export default function EventItemModal({
  isOpen,
  onClose,
  selectedItem,
  events,
}: EventItemModalProps) {
  if (!isOpen) return null;

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
          >
            Close
          </button>
        </div>
        <div className="modal__body">
          <form
            className="form"
            key={selectedItem?.id ?? "new"}
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="form__field">
              <span>Session title</span>
              <input
                type="text"
                defaultValue={selectedItem?.title ?? ""}
                placeholder="Session title"
              />
            </label>
            <div className="form__row">
              <label className="form__field">
                <span>Event</span>
                <select defaultValue={selectedItem?.eventId ?? 1}>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form__field">
                <span>Status</span>
                <select defaultValue={selectedItem?.status ?? "draft"}>
                  <option value="draft">Draft</option>
                  <option value="up-next">Up next</option>
                  <option value="later">Later</option>
                  <option value="live">Live</option>
                </select>
              </label>
            </div>
            <div className="form__row">
              <label className="form__field">
                <span>Time</span>
                <input
                  type="text"
                  defaultValue={selectedItem?.time ?? ""}
                  placeholder="9:00 AM"
                />
              </label>
              <label className="form__field">
                <span>Room</span>
                <input
                  type="text"
                  defaultValue={selectedItem?.room ?? ""}
                  placeholder="Main Hall"
                />
              </label>
            </div>
            <label className="form__field">
              <span>Speaker</span>
              <input
                type="text"
                defaultValue={selectedItem?.speaker ?? ""}
                placeholder="Speaker name"
              />
            </label>
            <label className="form__field">
              <span>Session notes</span>
              <textarea
                rows={3}
                placeholder="Add links, sponsors, or extended notes"
              />
            </label>
          </form>
        </div>
        <div className="modal__footer">
          <button
            className="admin__button admin__button--ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="admin__button admin__button--primary">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
