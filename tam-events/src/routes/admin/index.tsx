import { useEffect, useRef, useState } from "react";
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
import { getEventBySlug, getEvents } from "../../api";
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
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const tabLabelByKey: Record<AdminTab, string> = {
      events: "Events",
      eventItems: "Event Items",
      announcements: "Announcements",
    };

    document.title = `${tabLabelByKey[tab]} | Admin | TAM Events`;
  }, [tab]);

  // Fetch event slugs from API
  const [eventSlugs, setEventSlugs] = useState<
    Array<{ id: number; slug: string; title: string }>
  >([]);

  // Fetch event summaries and item counts on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchEventSlugs = async () => {
      setIsEventsLoading(true);

      try {
        const response = await getEvents();
        if (!isMounted) {
          return;
        }

        setEventSlugs(response.events);

        const eventsWithCounts = await Promise.all(
          response.events.map(async (event) => {
            try {
              const detail = await getEventBySlug(event.slug);
              const itemsCount = detail.event_items.length;

              return {
                id: event.id,
                slug: event.slug,
                title: event.title,
                status: itemsCount > 0 ? "live" : "draft",
                itemsCount,
              } satisfies AdminEvent;
            } catch (error) {
              console.error(`Failed to fetch event details for ${event.slug}:`, error);
              return {
                id: event.id,
                slug: event.slug,
                title: event.title,
                status: "draft",
                itemsCount: 0,
              } satisfies AdminEvent;
            }
          }),
        );

        if (!isMounted) {
          return;
        }

        setEvents(eventsWithCounts);
        setEventsError(null);
      } catch (error) {
        console.error("Failed to fetch event slugs:", error);

        if (!isMounted) {
          return;
        }

        setEventSlugs([]);
        setEvents([]);
        setEventsError("Failed to load events.");
      } finally {
        if (isMounted) {
          setIsEventsLoading(false);
        }
      }
    };

    fetchEventSlugs();

    return () => {
      isMounted = false;
    };
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
          <EventsTab
            events={events}
            isLoading={isEventsLoading}
            error={eventsError}
          />
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
