import { useToastStore } from "./store/toastStore";
import { Toast } from "./Toast";

/**
 * Toast container component that renders all active toasts
 * Should be mounted once at the app root level
 */
export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};
