import { create } from "zustand";

/**
 * Toast type variants
 */
export type ToastType = "info" | "success" | "warning" | "error";

/**
 * Individual toast model
 */
export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // milliseconds, undefined means default (5000ms)
};

/**
 * Toast state shape
 */
type ToastState = {
  // State
  toasts: Toast[];

  // Actions
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
};

/**
 * Generate unique toast ID
 */
const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Global toast store using Zustand
 */
export const useToastStore = create<ToastState>((set) => ({
  // Initial state
  toasts: [],

  // Add a new toast and return its ID
  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  // Remove a toast by ID
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  // Clear all toasts
  clearAll: () => {
    set({ toasts: [] });
  },
}));
