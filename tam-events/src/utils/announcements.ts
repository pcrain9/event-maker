const DISMISSED_ANNOUNCEMENTS_KEY = "dismissed_announcements";

type DismissedAnnouncementRecord = {
  id: number;
  ends: string;
  title?: string;
  tone?: "info" | "success" | "warning" | "danger";
  dismissedAt: string;
};

type DismissAnnouncementInput = {
  id: number;
  ends: string;
  title?: string;
  tone?: "info" | "success" | "warning" | "danger";
};

const getDismissedAnnouncementsKey = (storageScope: string): string =>
  `${DISMISSED_ANNOUNCEMENTS_KEY}:${storageScope}`;

/**
 * Get all dismissed announcements from localStorage.
 * Returns a Map of announcement id to ends datetime.
 */
export function getDismissedAnnouncements(
  storageScope = "guest",
): Map<number, DismissedAnnouncementRecord> {
  try {
    const stored = localStorage.getItem(getDismissedAnnouncementsKey(storageScope));
    if (!stored) return new Map();

    const parsed = JSON.parse(stored) as Record<
      string,
      string | DismissedAnnouncementRecord
    >;

    return new Map(
      Object.entries(parsed).map(([id, value]) => {
        if (typeof value === "string") {
          return [
            Number(id),
            {
              id: Number(id),
              ends: value,
              dismissedAt: new Date().toISOString(),
            },
          ];
        }

        return [Number(id), value];
      }),
    );
  } catch {
    return new Map();
  }
}

/**
 * Save a dismissed announcement to localStorage.
 * id: announcement id
 * endsDatetime: ISO datetime string when the announcement expires
 */
export function dismissAnnouncement(
  announcement: DismissAnnouncementInput,
  storageScope = "guest",
): void {
  try {
    const dismissed = getDismissedAnnouncements(storageScope);
    dismissed.set(announcement.id, {
      ...announcement,
      dismissedAt: new Date().toISOString(),
    });

    const toStore = Object.fromEntries(dismissed);
    localStorage.setItem(
      getDismissedAnnouncementsKey(storageScope),
      JSON.stringify(toStore),
    );
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
export function isAnnouncementDismissed(
  id: number,
  endsDatetime: string,
  storageScope = "guest",
): boolean {
  try {
    const dismissed = getDismissedAnnouncements(storageScope);
    const dismissedRecord = dismissed.get(id);
    if (!dismissedRecord) {
      return false;
    }

    // Check if announcement has expired
    const now = new Date();
    const expiresAt = new Date(dismissedRecord.ends || endsDatetime);

    if (now > expiresAt) {
      // Announcement has expired, remove from dismissed
      cleanupExpiredDismissals(storageScope);
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
export function cleanupExpiredDismissals(storageScope = "guest"): void {
  try {
    const dismissed = getDismissedAnnouncements(storageScope);
    const now = new Date();
    let hasChanges = false;

    const entriesToRemove: number[] = [];
    dismissed.forEach((record, id) => {
      const expiresAt = new Date(record.ends);
      if (now > expiresAt) {
        entriesToRemove.push(id);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      entriesToRemove.forEach((id) => dismissed.delete(id));
      const toStore = Object.fromEntries(dismissed);
      localStorage.setItem(
        getDismissedAnnouncementsKey(storageScope),
        JSON.stringify(toStore),
      );
    }
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
