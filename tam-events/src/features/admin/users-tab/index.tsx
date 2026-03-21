import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { deleteAdminUser, getAdminUsers } from "../../../api";
import { useToast } from "../../../components/toast";
import type { AdminUser } from "../../../types";
import { formatShortDateTime } from "../../../utils/date";

type UsersTabProps = {
  onNewUser: () => void;
  onEditUser: (user: AdminUser) => void;
  currentUserId?: number;
  refreshKey?: number;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { detail?: string } | undefined)?.detail ||
      fallback
    );
  }
  return fallback;
};

export default function UsersTab({
  onNewUser,
  onEditUser,
  currentUserId,
  refreshKey = 0,
}: UsersTabProps) {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch admin users", fetchError);
      setUsers([]);
      setError(getErrorMessage(fetchError, "Failed to load admin users"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers, refreshKey]);

  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Delete admin user "${user.username}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(user.id);
      await deleteAdminUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.success("Admin deleted");
    } catch (deleteError) {
      console.error("Failed to delete admin", deleteError);
      toast.error(getErrorMessage(deleteError, "Failed to delete admin"));
    } finally {
      setDeletingUserId(null);
    }
  };

  const activeAdminCount = users.filter((user) => user.is_active).length;

  const getDeleteDisabledReason = (user: AdminUser): string | null => {
    if (currentUserId === user.id) {
      return "You cannot delete your own account";
    }

    if (user.is_active && activeAdminCount <= 1) {
      return "You cannot delete the last active admin";
    }

    return null;
  };

  return (
    <section className="admin-tab-content">
      <div className="admin__panel-header">
        <h2>Admins</h2>
        <div className="admin__actions">
          <button
            type="button"
            className="admin__button admin__button--primary"
            onClick={onNewUser}
          >
            Add admin
          </button>
        </div>
      </div>

      <div className="admin__card">
        <div className="admin__card-header">
          <div>
            <h3>Admin accounts</h3>
          </div>
        </div>

        {isLoading ? (
          <p className="admin__muted" style={{ padding: "1rem" }}>
            Loading admins...
          </p>
        ) : error ? (
          <p
            className="admin__muted"
            style={{ padding: "1rem", color: "#b91c1c" }}
          >
            {error}
          </p>
        ) : users.length === 0 ? (
          <p className="admin__muted" style={{ padding: "1rem" }}>
            No admin users found.
          </p>
        ) : (
          <ul className="admin__list">
            {users.map((user) => {
              const deleteDisabledReason = getDeleteDisabledReason(user);
              const isDeleteBlocked = Boolean(deleteDisabledReason);

              return (
                <li key={user.id} className="admin__list-item">
                  <div>
                    <p className="admin__list-title">
                      {user.username}
                      {currentUserId === user.id ? " (you)" : ""}
                    </p>
                    <p className="admin__muted">
                      {user.full_name || "No full name"} • Created{" "}
                      {formatShortDateTime(new Date(user.created_at))}
                    </p>
                  </div>
                  <div className="admin__list-meta">
                    <span
                      className="admin__pill"
                      data-tone={user.is_active ? "live" : "draft"}
                    >
                      {user.is_active ? "active" : "inactive"}
                    </span>
                    <button
                      type="button"
                      className="admin__button admin__button--ghost"
                      onClick={() => onEditUser(user)}
                      disabled={deletingUserId === user.id}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin__button admin__button--ghost"
                      onClick={() => void handleDelete(user)}
                      disabled={deletingUserId === user.id || isDeleteBlocked}
                      title={deleteDisabledReason || undefined}
                    >
                      {deletingUserId === user.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
