import axios from "axios";
import { useEffect, useState } from "react";
import { createAdminUser, getAdminUsers, updateAdminUser } from "../../../api";
import { useToast } from "../../../components/toast";
import type { AdminUser } from "../../../types";

type AdminUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedUser?: AdminUser | null;
  onSave?: () => void;
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

export default function AdminUserModal({
  isOpen,
  onClose,
  selectedUser,
  onSave,
}: AdminUserModalProps) {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = Boolean(selectedUser);

  useEffect(() => {
    if (selectedUser) {
      setUsername(selectedUser.username);
      setFullName(selectedUser.full_name || "");
      setIsActive(selectedUser.is_active);
    } else {
      setUsername("");
      setFullName("");
      setIsActive(true);
    }

    setPassword("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSubmitError(null);
  }, [selectedUser, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const checkUsernameUnique = async (
    candidateUsername: string,
  ): Promise<boolean> => {
    const users = await getAdminUsers();
    const candidate = candidateUsername.trim().toLowerCase();

    return !users.some((user) => {
      if (selectedUser && user.id === selectedUser.id) {
        return false;
      }
      return user.username.trim().toLowerCase() === candidate;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setSubmitError("Username is required.");
      return;
    }

    if (!isEditMode && !password.trim()) {
      setSubmitError("Password is required.");
      return;
    }

    const isChangingPassword = Boolean(
      currentPassword.trim() || newPassword.trim() || confirmPassword.trim(),
    );

    if (isEditMode && isChangingPassword) {
      if (!currentPassword.trim()) {
        setSubmitError("Current password is required to set a new password.");
        return;
      }

      if (!newPassword.trim()) {
        setSubmitError("New password is required.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setSubmitError("New password and confirmation must match.");
        return;
      }
    }

    try {
      setIsSaving(true);
      setSubmitError(null);

      const isUnique = await checkUsernameUnique(cleanUsername);
      if (!isUnique) {
        setSubmitError("Username already exists. Choose a different username.");
        return;
      }

      if (isEditMode && selectedUser) {
        await updateAdminUser(selectedUser.id, {
          username: cleanUsername,
          full_name: fullName.trim() || null,
          is_active: isActive,
          current_password: isChangingPassword ? currentPassword : undefined,
          new_password: isChangingPassword ? newPassword : undefined,
        });

        toast.success("Admin updated");
      } else {
        await createAdminUser({
          username: cleanUsername,
          password,
          full_name: fullName.trim() || null,
          is_active: isActive,
        });

        toast.success("Admin created");
      }

      onSave?.();
      onClose();
    } catch (error) {
      const fallback = `Failed to ${isEditMode ? "update" : "create"} admin`;
      const message = getErrorMessage(error, fallback);
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <p className="admin__eyebrow">Admin</p>
            <h3>{isEditMode ? "Edit admin" : "Add admin"}</h3>
          </div>
          <button
            type="button"
            className="admin__button admin__button--ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Close
          </button>
        </div>

        <div className="modal__body">
          <form className="form" id="admin-user-form" onSubmit={handleSubmit}>
            <label className="form__field">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_username"
                disabled={isSaving}
                required
              />
            </label>

            <label className="form__field">
              <span>Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                disabled={isSaving}
              />
            </label>

            <label className="form__field">
              <span>Status</span>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                disabled={isSaving}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            {!isEditMode ? (
              <label className="form__field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial password"
                  disabled={isSaving}
                  required
                />
              </label>
            ) : (
              <>
                <p className="admin__muted" style={{ marginTop: "0.25rem" }}>
                  To change password, provide current password and new password.
                </p>
                <label className="form__field">
                  <span>Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    disabled={isSaving}
                  />
                </label>
                <label className="form__field">
                  <span>New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    disabled={isSaving}
                  />
                </label>
                <label className="form__field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isSaving}
                  />
                </label>
              </>
            )}

            {submitError ? (
              <p className="admin__muted" style={{ color: "#b91c1c" }}>
                {submitError}
              </p>
            ) : null}
          </form>
        </div>

        <div className="modal__footer">
          <button
            type="button"
            className="admin__button admin__button--ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="admin-user-form"
            className="admin__button admin__button--primary"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
