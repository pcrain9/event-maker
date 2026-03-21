import { useEffect, useState } from "react";
import { updateEvent } from "../../../api";
import { useToast } from "../../../components/toast";
import type {
  AdminEvent,
  EventResponse,
  EventUpdate,
  FooterLink,
  ThemeColors,
} from "../../../types";

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
  const [colorScheme, setColorScheme] = useState<ThemeColors | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFooterLinks(selectedEvent?.footer_links ?? []);
    setColorScheme(selectedEvent?.color_scheme ?? null);
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

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColorScheme((current) =>
      current ? { ...current, [key]: value } : null,
    );
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

      const updatePayload: EventUpdate = {
        footer_links: footerLinks,
        ...(colorScheme ? { color_scheme: colorScheme } : {}),
      };

      const updatedEvent = await updateEvent(selectedEvent.id, updatePayload);

      toast.success("Event updated");
      onSave?.(updatedEvent);
      onClose();
    } catch (error) {
      console.error("Failed to update event", error);
      setSubmitError("Failed to save event. Please try again.");
      toast.error("Failed to update event");
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
            <h3>Edit event</h3>
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
          <form
            className="form"
            id="event-footer-links-form"
            onSubmit={handleSubmit}
          >
            {selectedEvent ? (
              <p className="admin__muted">{selectedEvent.title}</p>
            ) : null}

            {colorScheme && (
              <>
                <p className="admin__eyebrow">Brand colors</p>
                <div className="form__row">
                  <label className="form__field form__field--color">
                    <span>Primary</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="color"
                        value={colorScheme.primary || "#000000"}
                        onChange={(e) => updateColor("primary", e.target.value)}
                        disabled={isSaving}
                        style={{
                          width: "50px",
                          height: "40px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={(colorScheme.primary || "#000000").toUpperCase()}
                        onChange={(e) => updateColor("primary", e.target.value)}
                        disabled={isSaving}
                        style={{
                          flex: 1,
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </label>
                  <label className="form__field form__field--color">
                    <span>Secondary</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="color"
                        value={colorScheme.secondary || "#000000"}
                        onChange={(e) =>
                          updateColor("secondary", e.target.value)
                        }
                        disabled={isSaving}
                        style={{
                          width: "50px",
                          height: "40px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={(
                          colorScheme.secondary || "#000000"
                        ).toUpperCase()}
                        onChange={(e) =>
                          updateColor("secondary", e.target.value)
                        }
                        disabled={isSaving}
                        style={{
                          flex: 1,
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </label>
                </div>

                <div className="form__row">
                  <label className="form__field form__field--color">
                    <span>Background</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="color"
                        value={colorScheme.background || "#ffffff"}
                        onChange={(e) =>
                          updateColor("background", e.target.value)
                        }
                        disabled={isSaving}
                        style={{
                          width: "50px",
                          height: "40px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={(
                          colorScheme.background || "#ffffff"
                        ).toUpperCase()}
                        onChange={(e) =>
                          updateColor("background", e.target.value)
                        }
                        disabled={isSaving}
                        style={{
                          flex: 1,
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </label>
                  <label className="form__field form__field--color">
                    <span>Alt background</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="color"
                        value={colorScheme.alt_background || "#e2e8f0"}
                        onChange={(e) =>
                          updateColor("alt_background", e.target.value)
                        }
                        disabled={isSaving}
                        style={{
                          width: "50px",
                          height: "40px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={(
                          colorScheme.alt_background || "#e2e8f0"
                        ).toUpperCase()}
                        onChange={(e) =>
                          updateColor("alt_background", e.target.value)
                        }
                        disabled={isSaving}
                        style={{
                          flex: 1,
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </label>
                </div>

                <div className="form__row">
                  <label className="form__field form__field--color">
                    <span>Text</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="color"
                        value={colorScheme.text || "#000000"}
                        onChange={(e) => updateColor("text", e.target.value)}
                        disabled={isSaving}
                        style={{
                          width: "50px",
                          height: "40px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={(colorScheme.text || "#000000").toUpperCase()}
                        onChange={(e) => updateColor("text", e.target.value)}
                        disabled={isSaving}
                        style={{
                          flex: 1,
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </label>
                  <label className="form__field form__field--color">
                    <span>Heading</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="color"
                        value={colorScheme.heading || "#000000"}
                        onChange={(e) => updateColor("heading", e.target.value)}
                        disabled={isSaving}
                        style={{
                          width: "50px",
                          height: "40px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={(colorScheme.heading || "#000000").toUpperCase()}
                        onChange={(e) => updateColor("heading", e.target.value)}
                        disabled={isSaving}
                        style={{
                          flex: 1,
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </label>
                </div>
              </>
            )}

            <p className="admin__eyebrow">Footer links</p>

            {footerLinks.length === 0 ? (
              <p className="admin__muted">
                No footer links yet. Add one below.
              </p>
            ) : (
              footerLinks.map((link, index) => (
                <div
                  className="form__row"
                  key={`${selectedEvent?.id ?? "event"}-${index}`}
                >
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
                      onChange={(e) =>
                        handleUpdateLink(index, "href", e.target.value)
                      }
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
