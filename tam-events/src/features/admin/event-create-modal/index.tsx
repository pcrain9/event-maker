import { useEffect, useState } from "react";
import { createEvent } from "../../../api";
import { useToast } from "../../../components/toast";
import type {
  EventCreate,
  EventItemCreate,
  Speaker,
  ThemeColors,
} from "../../../types";

type EventCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

const DEFAULT_COLORS: ThemeColors = {
  primary: "#437d48",
  secondary: "#f2ccdf",
  background: "#f7f2cb",
  text: "#141414",
  heading: "#141414",
  alt_background: "#a8bde1",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSpeaker(
  value: unknown,
  index: number,
  itemIndex: number,
): Speaker {
  if (!isRecord(value)) {
    throw new Error(
      `Speaker ${index + 1} in item ${itemIndex + 1} is invalid.`,
    );
  }

  const name = typeof value.name === "string" ? value.name.trim() : "";
  const headshot =
    typeof value.headshot === "string" ? value.headshot.trim() : "";
  const institution =
    typeof value.institution === "string" ? value.institution.trim() : "";

  if (!name) {
    throw new Error(
      `Speaker ${index + 1} in item ${itemIndex + 1} is missing a name.`,
    );
  }

  return {
    name,
    headshot,
    institution,
  };
}

function parseEventItemsJson(raw: string): EventItemCreate[] {
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of event items.");
  }

  return parsed.map((value, index) => {
    if (!isRecord(value)) {
      throw new Error(`Item ${index + 1} is invalid.`);
    }

    const title = typeof value.title === "string" ? value.title.trim() : "";
    const time = typeof value.time === "string" ? value.time.trim() : "";

    if (!title) {
      throw new Error(`Item ${index + 1} is missing a title.`);
    }

    if (!time) {
      throw new Error(`Item ${index + 1} is missing a time.`);
    }

    const speakers =
      value.speakers == null
        ? null
        : Array.isArray(value.speakers)
          ? value.speakers.map((speaker, speakerIndex) =>
              normalizeSpeaker(speaker, speakerIndex, index),
            )
          : (() => {
              throw new Error(
                `Speakers for item ${index + 1} must be an array.`,
              );
            })();

    const slides =
      value.slides == null
        ? null
        : Array.isArray(value.slides)
          ? value.slides.map((slide, slideIndex) => {
              if (typeof slide !== "string") {
                throw new Error(
                  `Slide ${slideIndex + 1} in item ${index + 1} must be a string.`,
                );
              }
              return slide;
            })
          : (() => {
              throw new Error(`Slides for item ${index + 1} must be an array.`);
            })();

    return {
      title,
      time,
      sponsor: typeof value.sponsor === "string" ? value.sponsor : null,
      speakers,
      link: typeof value.link === "string" ? value.link : null,
      description:
        typeof value.description === "string" ? value.description : null,
      location: typeof value.location === "string" ? value.location : null,
      cancelled: typeof value.cancelled === "boolean" ? value.cancelled : false,
      slides,
    } satisfies EventItemCreate;
  });
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
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [colorScheme, setColorScheme] = useState<ThemeColors>(DEFAULT_COLORS);
  const [jsonFileName, setJsonFileName] = useState<string | null>(null);
  const [eventItems, setEventItems] = useState<EventItemCreate[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    setSponsors([""]);
    setColorScheme(DEFAULT_COLORS);
    setJsonFileName(null);
    setEventItems([]);
    setUploadError(null);
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

  const handleAddSponsor = () => {
    setSponsors((current) => [...current, ""]);
  };

  const handleSponsorChange = (index: number, value: string) => {
    setSponsors((current) =>
      current.map((sponsor, currentIndex) =>
        currentIndex === index ? value : sponsor,
      ),
    );
  };

  const handleRemoveSponsor = (index: number) => {
    setSponsors((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleJsonUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setJsonFileName(null);
      setEventItems([]);
      setUploadError(null);
      return;
    }

    try {
      const text = await file.text();
      const parsedItems = parseEventItemsJson(text);
      setJsonFileName(file.name);
      setEventItems(parsedItems);
      setUploadError(null);
    } catch (error) {
      setJsonFileName(file.name);
      setEventItems([]);
      setUploadError(
        error instanceof Error ? error.message : "Failed to parse JSON file.",
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !slug.trim()) {
      setSubmitError("Title and slug are required.");
      return;
    }

    if (uploadError) {
      setSubmitError("Fix the JSON upload errors before creating the event.");
      return;
    }

    const normalizedSponsors = sponsors
      .map((sponsor) => sponsor.trim())
      .filter(Boolean);

    const payload: EventCreate = {
      title: title.trim(),
      slug: slug.trim(),
      hero_image_url: heroImageUrl.trim() || null,
      color_scheme: colorScheme,
      ...(normalizedSponsors.length > 0
        ? { sponsors: normalizedSponsors }
        : {}),
      ...(eventItems.length > 0 ? { event_items: eventItems } : {}),
    };

    try {
      setIsSaving(true);
      setSubmitError(null);

      await createEvent(payload);
      toast.success(
        eventItems.length > 0
          ? `Event created with ${eventItems.length} imported items`
          : "Event created",
      );
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

            <p className="admin__eyebrow">Sponsors</p>
            <p className="admin__muted">
              Use direct image URLs, the same way you would for the hero image.
            </p>

            {sponsors.map((sponsor, index) => (
              <div className="form__row" key={`new-sponsor-${index}`}>
                <label className="form__field">
                  <span>
                    {index === 0
                      ? "Sponsor image URL (optional)"
                      : `Sponsor image URL ${index + 1} (optional)`}
                  </span>
                  <input
                    type="url"
                    value={sponsor}
                    onChange={(e) => handleSponsorChange(index, e.target.value)}
                    placeholder="https://tam-assets.s3.amazonaws.com/sponsors/logo.png"
                    disabled={isSaving}
                  />
                </label>
                {sponsors.length > 1 ? (
                  <div className="form__field" style={{ alignSelf: "end" }}>
                    <button
                      type="button"
                      className="admin__button admin__button--ghost"
                      onClick={() => handleRemoveSponsor(index)}
                      disabled={isSaving}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            ))}

            <button
              type="button"
              className="admin__button admin__button--ghost"
              onClick={handleAddSponsor}
              disabled={isSaving}
            >
              Add another sponsor image URL
            </button>

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
                <span>Background</span>
                <input
                  type="color"
                  value={colorScheme.background}
                  onChange={(e) => updateColor("background", e.target.value)}
                  disabled={isSaving}
                />
              </label>
              <label className="form__field form__field--color">
                <span>Alt background (optional)</span>
                <input
                  type="color"
                  value={colorScheme.alt_background || "#e2e8f0"}
                  onChange={(e) =>
                    updateColor("alt_background", e.target.value)
                  }
                  disabled={isSaving}
                />
              </label>
            </div>

            <div className="form__row">
              <label className="form__field form__field--color">
                <span>Text</span>
                <input
                  type="color"
                  value={colorScheme.text}
                  onChange={(e) => updateColor("text", e.target.value)}
                  disabled={isSaving}
                />
              </label>
              <label className="form__field form__field--color">
                <span>Heading</span>
                <input
                  type="color"
                  value={colorScheme.heading}
                  onChange={(e) => updateColor("heading", e.target.value)}
                  disabled={isSaving}
                />
              </label>
            </div>

            <div className="admin__card">
              <p className="admin__eyebrow">Event Items JSON Upload</p>
              <p className="admin__muted">
                Upload a JSON array of event items to create the event shell and
                its sessions in one step.
              </p>
              <label className="form__field" style={{ marginTop: "1rem" }}>
                <span>JSON file (optional)</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleJsonUpload}
                  disabled={isSaving}
                />
              </label>
              {jsonFileName && !uploadError && (
                <p className="admin__muted">
                  {jsonFileName} ready: {eventItems.length} item
                  {eventItems.length === 1 ? "" : "s"} parsed.
                </p>
              )}
              {uploadError && (
                <p className="admin__muted" style={{ color: "#b91c1c" }}>
                  {uploadError}
                </p>
              )}
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
