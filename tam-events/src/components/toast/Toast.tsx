import { useEffect, useState, useCallback } from "react";
import type { Toast as ToastType } from "./store/toastStore";

type ToastProps = {
  toast: ToastType;
  onRemove: (id: string) => void;
};

/**
 * Icon mapping for toast types
 */
const TOAST_ICONS: Record<ToastType["type"], string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

/**
 * Individual toast component with auto-dismiss timer
 */
export const Toast = ({ toast, onRemove }: ToastProps) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleClose = useCallback(() => {
    // Trigger remove animation
    setIsRemoving(true);

    // Wait for animation to complete before removing from store
    setTimeout(() => {
      onRemove(toast.id);
    }, 200); // Match animation duration in CSS
  }, [toast.id, onRemove]);

  useEffect(() => {
    // Set up auto-dismiss timer if duration is specified
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleClose]);

  return (
    <div
      className="toast"
      data-type={toast.type}
      data-removing={isRemoving}
      role="status"
      aria-live="polite"
    >
      <span className="toast__icon" aria-hidden="true">
        {TOAST_ICONS[toast.type]}
      </span>
      <p className="toast__message">{toast.message}</p>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        Close
      </button>
    </div>
  );
};
