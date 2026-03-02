import type { AdminTab } from "../../types";

type AdminSidebarProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
};

const tabs: Array<{ key: AdminTab; label: string }> = [
  { key: "events", label: "Events" },
  { key: "eventItems", label: "Event Items" },
  { key: "announcements", label: "Announcements" },
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
}: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <nav className="admin-tabs-vertical" aria-label="Admin sections">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${activeTab === tab.key ? "admin-tab--active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
