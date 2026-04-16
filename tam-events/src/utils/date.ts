/**
 * Format a date as a locale-specific time string (e.g., "9:00 AM")
 */
export const formatSessionTime = (date: Date): string =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/**
 * Format a date as a day label (e.g., "Saturday")
 */
export const formatDayLabel = (date: Date): string =>
  date.toLocaleDateString("en-US", { weekday: "long" });

/**
 * Format a date as a short date (e.g., "Feb 7")
 */
export const formatDayDate = (date: Date): string =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

/**
 * Format a date as a short date-time string (e.g., "Feb 7, 9:00 AM")
 */
export const formatShortDateTime = (date: Date): string =>
  `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${formatSessionTime(date)}`;

/**
 * Get a stable calendar date key in YYYY-MM-DD format.
 * For ISO-like strings, preserve the original date portion instead of converting to UTC.
 */
export const getCalendarDateKey = (value: Date | string): string => {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Format a date or date string for a datetime-local input using local time.
 */
export const toDateTimeLocalValue = (
  value: Date | string | null | undefined,
): string => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
