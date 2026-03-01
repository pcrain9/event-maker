type AnnouncementModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AnnouncementModal({
  isOpen,
  onClose,
}: AnnouncementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <p className="admin__eyebrow">Admin</p>
            <h3>New announcement</h3>
          </div>
          <button
            className="admin__button admin__button--ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="modal__body">
          <form className="form" onSubmit={(event) => event.preventDefault()}>
            <label className="form__field">
              <span>Title</span>
              <input type="text" placeholder="Announcement title" />
            </label>
            <label className="form__field">
              <span>Message</span>
              <textarea
                rows={4}
                placeholder="What do attendees need to know?"
              />
            </label>
            <div className="form__row">
              <label className="form__field">
                <span>Tone</span>
                <select defaultValue="info">
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </label>
              <label className="form__field">
                <span>Expiry</span>
                <input type="text" placeholder="Feb 7, 6:00 PM" />
              </label>
            </div>
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
