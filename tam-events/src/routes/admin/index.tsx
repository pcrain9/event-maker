import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";
import AdminLayout from "../../features/admin/admin-layout";
import AnnouncementsTab from "../../features/admin/announcements-tab";
import AnnouncementModal from "../../features/admin/announcement-modal";
import EventItemsTab, {
  type EventItemsTabRef,
} from "../../features/admin/event-items-tab";
import EventItemModal from "../../features/admin/event-item-modal";
import EventsTab from "../../features/admin/events-tab";
import { getEvents } from "../../api";
import type {
  AdminEvent,
  AdminEventItem,
  AdminAnnouncement,
  AdminTab,
} from "../../types";

const DEFAULT_TAB: AdminTab = "events";

const normalizeAdminTab = (value: string | null): AdminTab => {
  if (
    value === "events" ||
    value === "eventItems" ||
    value === "announcements"
  ) {
    return value;
  }
  return DEFAULT_TAB;
};

export default function AdminRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const tab = normalizeAdminTab(searchParams.get("tab"));
  const [activeModal, setActiveModal] = useState<
    "event-item" | "announcement" | null
  >(null);
  const [selectedItem, setSelectedItem] = useState<AdminEventItem | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AdminAnnouncement | null>(null);
  const [announcementsRefreshKey, setAnnouncementsRefreshKey] = useState(0);
  const eventItemsTabRef = useRef<EventItemsTabRef>(null);

  // Fetch event slugs from API
  const [eventSlugs, setEventSlugs] = useState<
    Array<{ id: number; slug: string; title: string }>
  >([]);

  const events: AdminEvent[] = useMemo(
    () => [
      {
        id: 1,
        title: "TAM Annual Summit",
        dateRange: "Feb 7-9, 2026",
        location: "Austin, TX",
        status: "live",
        itemsCount: 18,
      },
      {
        id: 2,
        title: "Collections Leadership Lab",
        dateRange: "Mar 12-13, 2026",
        location: "Houston, TX",
        status: "draft",
        itemsCount: 6,
      },
      {
        id: 3,
        title: "Member Programs Showcase",
        dateRange: "Apr 4, 2026",
        location: "Dallas, TX",
        status: "archived",
        itemsCount: 9,
      },
    ],
    [],
  );

  const eventItems: AdminEventItem[] = useMemo(
    () => [
      // Event items are now fetched from the backend in EventItemsTab
      // This array is kept for type compatibility but unused
    ],
    [],
  );

  // Fetch event slugs on component mount
  useEffect(() => {
    const fetchEventSlugs = async () => {
      try {
        const response = await getEvents();
        setEventSlugs(response.events);
      } catch (error) {
        console.error("Failed to fetch event slugs:", error);
        setEventSlugs([]);
      }
    };

    fetchEventSlugs();
  }, []);

  useEffect(() => {
    const current = searchParams.get("tab");
    if (current !== tab) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", tab);
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, tab]);

  useEffect(() => {
    if (!activeModal) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
        setSelectedItem(null);
        setSelectedAnnouncement(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeModal]);

  const handleTabChange = (nextTab: AdminTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    setSearchParams(next);
  };

  const openEventItemModal = (item?: AdminEventItem) => {
    setSelectedItem(item ?? null);
    setActiveModal("event-item");
  };

  const openAnnouncementModal = (announcement?: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement ?? null);
    setActiveModal("announcement");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
    setSelectedAnnouncement(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <AdminLayout
        activeTab={tab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        userName={user?.username}
        userFullName={user?.full_name}
      >
        {tab === "events" && (
          <EventsTab events={events} eventItems={eventItems} />
        )}
        {tab === "eventItems" && (
          <EventItemsTab
            events={eventSlugs}
            onEditItem={openEventItemModal}
            onNewItem={() => openEventItemModal()}
            refreshRef={(ref) => {
              eventItemsTabRef.current = ref;
            }}
          />
        )}
        {tab === "announcements" && (
          <AnnouncementsTab
            onNewAnnouncement={() => openAnnouncementModal()}
            onEditAnnouncement={(announcement) =>
              openAnnouncementModal(announcement)
            }
            eventSlugs={eventSlugs}
            refreshKey={announcementsRefreshKey}
          />
        )}
      </AdminLayout>

      <EventItemModal
        isOpen={activeModal === "event-item"}
        onClose={closeModal}
        selectedItem={selectedItem}
        events={events}
        onSave={() => {
          closeModal();

          // Refresh the event items list after saving
          eventItemsTabRef.current?.refreshEventItems();
        }}
      />
      <AnnouncementModal
        isOpen={activeModal === "announcement"}
        onClose={closeModal}
        events={eventSlugs}
        selectedAnnouncement={selectedAnnouncement}
        onSave={() => {
          setAnnouncementsRefreshKey((current) => current + 1);
        }}
      />
    </>
  );
}
