import { useEffect, useState } from "react";
import { updateEvent } from "../../../api";
import { useToast } from "../../../components/toast";
import type { AdminEvent, EventResponse, FooterLink } from "../../../types";

type EventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent?: AdminEvent | null;
  onSave?: (updatedEvent: EventResponse) => void;
};

const EMPTY_LINK: FooterLink = {
  link_title: "",
  href: "",
};

export default function EventModal({
  isOpen,
  onClose,
  selectedEvent,
  onSave,
}: EventModalProps) {
  const toast = useToast();
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFooterLinks(selectedEvent?.footer_links ?? []);
    setSubmitError(null);
  }, [isOpen, selectedEvent]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    setFooterLinks((current) => [...current, { ...EMPTY_LINK }]);
  };

  const handleUpdateLink = (
    index: number,
    field: keyof FooterLink,
    value: string,
  ) => {
    setFooterLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index ? { ...link, [field]: value } : link,
      ),
    );
  };

  const handleRemoveLink = (index: number) => {
    setFooterLinks((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedEvent) {
      setSubmitError("Please choose an event to edit.");
      toast.error("No event selected");
      return;
    }

    const hasInvalidLink = footerLinks.some(
      (link) => !link.link_title.trim() || !link.href.trim(),
    );

    if (hasInvalidLink) {
      setSubmitError("Each footer link must include a title and URL.");
      toast.error("Footer links require title and URL");
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError(null);

      const updatedEvent = await updateEvent(selectedEvent.id, {
        footer_links: footerLinks,
      });

      toast.success("Footer links updated");
      onSave?.(updatedEvent);
      onClose();
    } catch (error) {
      console.error("Failed to update event footer links", error);
      setSubmitError("Failed to save footer links. Please try again.");
      toast.error("Failed to update footer links");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <p className="admin__eyebrow">Admin</p>
            <h3>Edit footer links</h3>
          </div>
          <button
            className="admin__button admin__button--ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Close
          </button>
        </div>

        <div className="modal__body">
          <form className="form" id="event-footer-links-form" onSubmit={handleSubmit}>
            {selectedEvent ? (
              <p className="admin__muted">{selectedEvent.title}</p>
            ) : null}

            {footerLinks.length === 0 ? (
              <p className="admin__muted">No footer links yet. Add one below.</p>
            ) : (
              footerLinks.map((link, index) => (
                <div className="form__row" key={`${selectedEvent?.id ?? "event"}-${index}`}>
                  <label className="form__field">
                    <span>Link title</span>
                    <input
                      type="text"
                      value={link.link_title}
                      onChange={(e) =>
                        handleUpdateLink(index, "link_title", e.target.value)
                      }
                      placeholder="Proceedings"
                      disabled={isSaving}
                    />
                  </label>
                  <label className="form__field">
                    <span>URL</span>
                    <input
                      type="url"
                      value={link.href}
                      onChange={(e) => handleUpdateLink(index, "href", e.target.value)}
                      placeholder="https://example.com"
                      disabled={isSaving}
                    />
                  </label>
                  <div className="form__field" style={{ alignSelf: "end" }}>
                    <button
                      type="button"
                      className="admin__button admin__button--ghost"
                      onClick={() => handleRemoveLink(index)}
                      disabled={isSaving}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              type="button"
              className="admin__button admin__button--ghost"
              onClick={handleAddLink}
              disabled={isSaving}
            >
              Add footer link
            </button>

            {submitError && (
              <p className="admin__muted" style={{ color: "#b91c1c" }}>
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
            form="event-footer-links-form"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
