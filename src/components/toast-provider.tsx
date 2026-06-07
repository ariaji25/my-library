"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (message: string) => push(message, "success"),
      error: (message: string) => push(message, "error"),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] right-3 z-[100] flex w-[min(100%,20rem)] flex-col gap-2 md:bottom-4 md:right-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
              toast.variant === "success"
                ? "border-primary/30 bg-card/95 text-foreground"
                : "border-rose-300/60 bg-card/95 text-foreground dark:border-rose-500/40"
            )}
          >
            {toast.variant === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
