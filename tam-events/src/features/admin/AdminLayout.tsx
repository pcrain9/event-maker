import type { ReactNode } from "react";
import type { AdminTab } from "../../types";
import AdminSidebar from "./AdminSidebar";

type AdminLayoutProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  userName?: string;
  userFullName?: string | null;
  children: ReactNode;
};

export default function AdminLayout({
  activeTab,
  onTabChange,
  onLogout,
  userName,
  userFullName,
  children,
}: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="admin-content">
        <div className="admin-logout">
          <div className="admin-logout__identity">
            <p className="admin__eyebrow">Logged in as</p>
            <p className="admin__list-title">
              {userName || "Admin User"}
              {userFullName ? <span> ({userFullName})</span> : null}
            </p>
          </div>
          <button
            type="button"
            className="admin__button admin__button--ghost"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
        <div className="admin-content__inner">{children}</div>
      </main>
    </div>
  );
}
