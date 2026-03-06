import { useToastStore } from "./store/toastStore";
import type { ToastType } from "./store/toastStore";

/**
 * Convenience hook for triggering toasts
 *
 * @example
 * const toast = useToast();
 * toast.success("Changes saved successfully!");
 * toast.error("Failed to load data");
 * toast.info("New update available", { duration: 10000 });
 */
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  const createToast = (type: ToastType, message: string, duration?: number) => {
    return addToast({
      type,
      message,
      duration,
    });
  };

  return {
    success: (message: string, duration?: number) =>
      createToast("success", message, duration),
    error: (message: string, duration?: number) =>
      createToast("error", message, duration),
    warning: (message: string, duration?: number) =>
      createToast("warning", message, duration),
    info: (message: string, duration?: number) =>
      createToast("info", message, duration),
  };
};
