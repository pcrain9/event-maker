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
