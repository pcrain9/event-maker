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
