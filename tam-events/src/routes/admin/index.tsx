import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";
import AdminLayout from "../../features/admin/AdminLayout";
import AnnouncementsTab from "../../features/admin/AnnouncementsTab";
import AnnouncementModal from "../../features/admin/AnnouncementModal";
import EventItemsTab from "../../features/admin/EventItemsTab";
import EventItemModal from "../../features/admin/EventItemModal";
import EventsTab from "../../features/admin/EventsTab";
import type {
  AdminAnnouncement,
  AdminEvent,
  AdminEventItem,
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
      {
        id: 201,
        eventId: 1,
        title: "Welcome and opening remarks",
        time: "9:00 AM",
        room: "Main Hall",
        speaker: "Dr. Naomi Wells",
        status: "live",
      },
      {
        id: 202,
        eventId: 1,
        title: "Designing for daily momentum",
        time: "10:30 AM",
        room: "Studio A",
        speaker: "Tia Alvarez",
        status: "up-next",
      },
      {
        id: 203,
        eventId: 1,
        title: "Operational craft workshop",
        time: "1:00 PM",
        room: "Workshop B",
        speaker: "Rohan Patel",
        status: "later",
      },
      {
        id: 301,
        eventId: 2,
        title: "Exhibit prep lab",
        time: "9:30 AM",
        room: "Lab 2",
        speaker: "Mila Cheng",
        status: "draft",
      },
    ],
    [],
  );

  const announcements: AdminAnnouncement[] = useMemo(
    () => [
      {
        id: 1,
        title: "Badge pickup moved",
        body: "Registration is now at Ballroom B. Doors open at 7:30 AM.",
        tone: "warning",
        starts: "Feb 7, 7:00 AM",
        ends: "Feb 7, 11:00 AM",
      },
      {
        id: 2,
        title: "Shuttle standby",
        body: "Afternoon shuttles pause at 4:30 PM. Plan early exits.",
        tone: "info",
        starts: "Feb 7, 2:00 PM",
        ends: "Feb 7, 6:00 PM",
      },
    ],
    [],
  );

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

  const openAnnouncementModal = () => {
    setSelectedItem(null);
    setActiveModal("announcement");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
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
            eventItems={eventItems}
            onEditItem={openEventItemModal}
            onNewItem={() => openEventItemModal()}
          />
        )}
        {tab === "announcements" && (
          <AnnouncementsTab
            announcements={announcements}
            onNewAnnouncement={openAnnouncementModal}
          />
        )}
      </AdminLayout>

      <EventItemModal
        isOpen={activeModal === "event-item"}
        onClose={closeModal}
        selectedItem={selectedItem}
        events={events}
      />
      <AnnouncementModal
        isOpen={activeModal === "announcement"}
        onClose={closeModal}
      />
    </>
  );
}
