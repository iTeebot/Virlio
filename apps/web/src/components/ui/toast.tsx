"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "error" | "success" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  removeAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Listeners for imperative toast calls outside React component tree
type ToastListener = (toast: Omit<ToastItem, "id">) => void;
type RemoveListener = (id: string) => void;

const listeners: Set<ToastListener> = new Set();
const removeListeners: Set<RemoveListener> = new Set();

/**
 * Imperative toast function to trigger toasts anywhere in the codebase.
 */
export const toast = {
  show: (message: string, options?: { type?: ToastType; title?: string; duration?: number }) => {
    const toastData: Omit<ToastItem, "id"> = {
      message,
      type: options?.type || "info",
      title: options?.title,
      duration: options?.duration ?? 5000,
    };
    listeners.forEach((listener) => listener(toastData));
  },
  error: (message: string, title?: string, duration?: number) => {
    toast.show(message, { type: "error", title, duration });
  },
  success: (message: string, title?: string, duration?: number) => {
    toast.show(message, { type: "success", title, duration });
  },
  warning: (message: string, title?: string, duration?: number) => {
    toast.show(message, { type: "warning", title, duration });
  },
  info: (message: string, title?: string, duration?: number) => {
    toast.show(message, { type: "info", title, duration });
  },
  dismiss: (id: string) => {
    removeListeners.forEach((listener) => listener(id));
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toastData: Omit<ToastItem, "id">): string => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toastData, id };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 toasts

      const duration = toastData.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const removeAll = useCallback(() => {
    setToasts([]);
  }, []);

  useEffect(() => {
    const handleAdd = (toastData: Omit<ToastItem, "id">) => {
      addToast(toastData);
    };
    const handleRemove = (id: string) => {
      removeToast(id);
    };

    listeners.add(handleAdd);
    removeListeners.add(handleRemove);

    return () => {
      listeners.delete(handleAdd);
      removeListeners.delete(handleRemove);
    };
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const variantStyles = {
    error: {
      container: "bg-red-50 border-red-200 text-red-900",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
      closeBtn: "text-red-400 hover:text-red-700 hover:bg-red-100",
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      closeBtn: "text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      closeBtn: "text-amber-400 hover:text-amber-700 hover:bg-amber-100",
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
      closeBtn: "text-blue-400 hover:text-blue-700 hover:bg-blue-100",
    },
  };

  const style = variantStyles[toast.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${style.container}`}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-bold tracking-tight uppercase mb-0.5">{toast.title}</h4>
        )}
        <p className="text-xs sm:text-sm font-medium leading-snug break-words">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className={`p-1 rounded-lg transition-colors shrink-0 ${style.closeBtn}`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
