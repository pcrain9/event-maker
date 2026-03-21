import { useEffect, useState } from "react";
import { createEvent } from "../../../api";
import { useToast } from "../../../components/toast";
import type { EventCreate, ThemeColors } from "../../../types";

type EventCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

const DEFAULT_COLORS: ThemeColors = {
  primary: "#0f172a",
  secondary: "#1e293b",
  tertiary: "#334155",
  background: "#f8fafc",
  alt_background: "#e2e8f0",
  text: "#0f172a",
  title_text: "#020617",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EventCreateModal({
  isOpen,
  onClose,
  onSave,
}: EventCreateModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [colorScheme, setColorScheme] = useState<ThemeColors>(DEFAULT_COLORS);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle("");
    setSlug("");
    setHeroImageUrl("");
    setColorScheme(DEFAULT_COLORS);
    setIsSaving(false);
    setSubmitError(null);
    setSlugTouched(false);
  }, [isOpen]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

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

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColorScheme((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !slug.trim()) {
      setSubmitError("Title and slug are required.");
      return;
    }

    const payload: EventCreate = {
      title: title.trim(),
      slug: slug.trim(),
      hero_image_url: heroImageUrl.trim() || null,
      color_scheme: colorScheme,
    };

    try {
      setIsSaving(true);
      setSubmitError(null);

      await createEvent(payload);
      toast.success("Event created");
      onSave?.();
      onClose();
    } catch (error) {
      console.error("Failed to create event", error);
      setSubmitError("Failed to create event. Please try again.");
      toast.error("Failed to create event");
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
            <h3>New event</h3>
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
          <form className="form" id="event-create-form" onSubmit={handleSubmit}>
            <label className="form__field">
              <span>Title</span>
              <input
                type="text"
                placeholder="2027 TAM Conference"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSaving}
              />
            </label>

            <label className="form__field">
              <span>Slug</span>
              <input
                type="text"
                placeholder="2027-tam-conference"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                required
                disabled={isSaving}
              />
            </label>

            <label className="form__field">
              <span>Hero image URL (optional)</span>
              <input
                type="url"
                placeholder="https://example.com/hero.png"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                disabled={isSaving}
              />
            </label>

            <div className="form__row">
              <label className="form__field form__field--color">
                <span>Primary</span>
                <input
                  type="color"
                  value={colorScheme.primary}
                  onChange={(e) => updateColor("primary", e.target.value)}
                  disabled={isSaving}
                />
              </label>
              <label className="form__field form__field--color">
                <span>Secondary</span>
                <input
                  type="color"
                  value={colorScheme.secondary}
                  onChange={(e) => updateColor("secondary", e.target.value)}
                  disabled={isSaving}
                />
              </label>
            </div>

            <div className="form__row">
              <label className="form__field form__field--color">
                <span>Tertiary</span>
                <input
                  type="color"
                  value={colorScheme.tertiary}
                  onChange={(e) => updateColor("tertiary", e.target.value)}
                  disabled={isSaving}
                />
              </label>
              <label className="form__field form__field--color">
                <span>Background</span>
                <input
                  type="color"
                  value={colorScheme.background}
                  onChange={(e) => updateColor("background", e.target.value)}
                  disabled={isSaving}
                />
              </label>
            </div>

            <div className="form__row">
              <label className="form__field form__field--color">
                <span>Alt background</span>
                <input
                  type="color"
                  value={colorScheme.alt_background}
                  onChange={(e) => updateColor("alt_background", e.target.value)}
                  disabled={isSaving}
                />
              </label>
              <label className="form__field form__field--color">
                <span>Text</span>
                <input
                  type="color"
                  value={colorScheme.text}
                  onChange={(e) => updateColor("text", e.target.value)}
                  disabled={isSaving}
                />
              </label>
            </div>

            <label className="form__field form__field--color">
              <span>Title text</span>
              <input
                type="color"
                value={colorScheme.title_text}
                onChange={(e) => updateColor("title_text", e.target.value)}
                disabled={isSaving}
              />
            </label>

            <div className="admin__card">
              <p className="admin__eyebrow">Event Items JSON Upload</p>
              <p className="admin__muted">
                Coming soon. This section will upload a JSON document for bulk
                event item creation.
              </p>
              <button className="admin__button admin__button--ghost" disabled>
                Upload JSON (unimplemented)
              </button>
            </div>

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
            form="event-create-form"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Create event"}
          </button>
        </div>
      </div>
    </div>
  );
}
