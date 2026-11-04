import { create } from "zustand";

export type ToastTone = "info" | "success" | "error";
export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, tone?: ToastTone, durationMs?: number) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, tone = "info", durationMs = 4000) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, tone }] }));
    window.setTimeout(() => get().dismiss(id), durationMs);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  info: (m: string) => useToastStore.getState().push(m, "info"),
  success: (m: string) => useToastStore.getState().push(m, "success"),
  error: (m: string) => useToastStore.getState().push(m, "error", 6000),
};
