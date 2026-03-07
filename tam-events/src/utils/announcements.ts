const DISMISSED_ANNOUNCEMENTS_KEY = "dismissed_announcements";

/**
 * Get all dismissed announcements from localStorage.
 * Returns a Map of announcement id to ends datetime.
 */
export function getDismissedAnnouncements(): Map<number, string> {
  try {
    const stored = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);
    if (!stored) return new Map();

    const parsed = JSON.parse(stored);
    return new Map(Object.entries(parsed).map(([id, ends]) => [Number(id), ends as string]));
  } catch {
    return new Map();
  }
}

/**
 * Save a dismissed announcement to localStorage.
 * id: announcement id
 * endsDatetime: ISO datetime string when the announcement expires
 */
export function dismissAnnouncement(id: number, endsDatetime: string): void {
  try {
    const dismissed = getDismissedAnnouncements();
    dismissed.set(id, endsDatetime);

    const toStore = Object.fromEntries(dismissed);
    localStorage.setItem(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify(toStore));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Check if an announcement is dismissed and not yet expired.
 * id: announcement id
 * endsDatetime: ISO datetime string when the announcement expires
 * Returns true if dismissed AND not expired, false otherwise
 */
export function isAnnouncementDismissed(id: number, endsDatetime: string): boolean {
  try {
    const dismissed = getDismissedAnnouncements();
    if (!dismissed.has(id)) {
      return false;
    }

    // Check if announcement has expired
    const now = new Date();
    const expiresAt = new Date(endsDatetime);

    if (now > expiresAt) {
      // Announcement has expired, remove from dismissed
      cleanupExpiredDismissals();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up expired dismissals from localStorage.
 * Removes entries where the announcement's end time has passed.
 */
export function cleanupExpiredDismissals(): void {
  try {
    const dismissed = getDismissedAnnouncements();
    const now = new Date();
    let hasChanges = false;

    const entriesToRemove: number[] = [];
    dismissed.forEach((endsDatetime, id) => {
      const expiresAt = new Date(endsDatetime);
      if (now > expiresAt) {
        entriesToRemove.push(id);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      entriesToRemove.forEach((id) => dismissed.delete(id));
      const toStore = Object.fromEntries(dismissed);
      localStorage.setItem(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify(toStore));
    }
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
