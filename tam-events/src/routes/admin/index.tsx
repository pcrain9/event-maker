import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";
import AdminLayout from "../../features/admin/admin-layout";
import AnnouncementsTab from "../../features/admin/announcements-tab";
import AnnouncementModal from "../../features/admin/announcement-modal";
import AdminUserModal from "../../features/admin/admin-user-modal";
import EventCreateModal from "../../features/admin/event-create-modal";
import EventModal from "../../features/admin/event-modal";
import { useToast } from "../../components/toast";
import EventItemsTab, {
  type EventItemsTabRef,
} from "../../features/admin/event-items-tab";
import EventItemModal from "../../features/admin/event-item-modal";
import EventsTab from "../../features/admin/events-tab";
import UsersTab from "../../features/admin/users-tab";
import { deleteEvent, getEventBySlug, getEvents } from "../../api";
import type {
  AdminUser,
  AdminEvent,
  AdminEventItem,
  AdminAnnouncement,
  AdminTab,
  EventResponse,
} from "../../types";

const DEFAULT_TAB: AdminTab = "events";

const normalizeAdminTab = (value: string | null): AdminTab => {
  if (
    value === "events" ||
    value === "eventItems" ||
    value === "announcements" ||
    value === "users"
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
  const toast = useToast();
  const tab = normalizeAdminTab(searchParams.get("tab"));
  const [activeModal, setActiveModal] = useState<
    | "event-item"
    | "announcement"
    | "event"
    | "event-create"
    | "admin-user"
    | null
  >(null);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [selectedItem, setSelectedItem] = useState<AdminEventItem | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AdminAnnouncement | null>(null);
  const [selectedAdminUser, setSelectedAdminUser] = useState<AdminUser | null>(
    null,
  );
  const [announcementsRefreshKey, setAnnouncementsRefreshKey] = useState(0);
  const [usersRefreshKey, setUsersRefreshKey] = useState(0);
  const eventItemsTabRef = useRef<EventItemsTabRef>(null);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const tabLabelByKey: Record<AdminTab, string> = {
      events: "Events",
      eventItems: "Event Items",
      announcements: "Announcements",
      users: "Users",
    };

    document.title = `${tabLabelByKey[tab]} | Admin | TAM Events`;
  }, [tab]);

  // Fetch event slugs from API
  const [eventSlugs, setEventSlugs] = useState<
    Array<{ id: number; slug: string; title: string }>
  >([]);

  const fetchEventSlugs = useCallback(async () => {
    setIsEventsLoading(true);

    try {
      const response = await getEvents();
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
              footer_links: detail.footer_links,
              color_scheme: detail.color_scheme,
            } satisfies AdminEvent;
          } catch (error) {
            console.error(
              `Failed to fetch event details for ${event.slug}:`,
              error,
            );
            return {
              id: event.id,
              slug: event.slug,
              title: event.title,
              status: "draft",
              itemsCount: 0,
              footer_links: null,
              color_scheme: undefined,
            } satisfies AdminEvent;
          }
        }),
      );

      setEvents(eventsWithCounts);
      setEventsError(null);
    } catch (error) {
      console.error("Failed to fetch event slugs:", error);
      setEventSlugs([]);
      setEvents([]);
      setEventsError("Failed to load events.");
    } finally {
      setIsEventsLoading(false);
    }
  }, []);

  // Fetch event summaries and item counts on component mount
  useEffect(() => {
    void fetchEventSlugs();
  }, [fetchEventSlugs]);

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
        setSelectedEvent(null);
        setSelectedItem(null);
        setSelectedAnnouncement(null);
        setSelectedAdminUser(null);
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

  const openEventModal = (event: AdminEvent) => {
    setSelectedEvent(event);
    setActiveModal("event");
  };

  const openEventCreateModal = () => {
    setActiveModal("event-create");
  };

  const openAnnouncementModal = (announcement?: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement ?? null);
    setActiveModal("announcement");
  };

  const openAdminUserModal = (adminUser?: AdminUser) => {
    setSelectedAdminUser(adminUser ?? null);
    setActiveModal("admin-user");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedEvent(null);
    setSelectedItem(null);
    setSelectedAnnouncement(null);
    setSelectedAdminUser(null);
  };

  const handleDeleteEvent = async (event: AdminEvent) => {
    const confirmed = window.confirm(`Delete event \"${event.title}\"?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteEvent(event.id);
      toast.success("Event deleted");
      await fetchEventSlugs();
    } catch (error) {
      console.error("Failed to delete event", error);
      toast.error("Failed to delete event");
    }
  };

  const handleEventSave = (updatedEvent: EventResponse) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === updatedEvent.id
          ? {
              ...event,
              footer_links: updatedEvent.footer_links,
              color_scheme: updatedEvent.color_scheme,
            }
          : event,
      ),
    );
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
            onNewEvent={openEventCreateModal}
            onEditEvent={openEventModal}
            onDeleteEvent={handleDeleteEvent}
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
        {tab === "users" && (
          <UsersTab
            onNewUser={() => openAdminUserModal()}
            onEditUser={(adminUser) => openAdminUserModal(adminUser)}
            currentUserId={user?.id}
            refreshKey={usersRefreshKey}
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
      <EventModal
        isOpen={activeModal === "event"}
        onClose={closeModal}
        selectedEvent={selectedEvent}
        onSave={(updatedEvent) => {
          handleEventSave(updatedEvent);
        }}
      />
      <EventCreateModal
        isOpen={activeModal === "event-create"}
        onClose={closeModal}
        onSave={() => {
          closeModal();
          void fetchEventSlugs();
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
      <AdminUserModal
        isOpen={activeModal === "admin-user"}
        onClose={closeModal}
        selectedUser={selectedAdminUser}
        onSave={() => {
          setUsersRefreshKey((current) => current + 1);
        }}
      />
    </>
  );
}
