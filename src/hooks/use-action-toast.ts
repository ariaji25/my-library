"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";
import { useToast } from "@/components/toast-provider";

type Options = {
  successMessage?: string;
  getSuccessMessage?: (result: Extract<ActionResult, { ok: true }>) => string;
  onSuccess?: (result: Extract<ActionResult, { ok: true }>) => void;
};

export function useActionToast(
  state: ActionResult | null,
  { successMessage, getSuccessMessage, onSuccess }: Options
) {
  const toast = useToast();
  const router = useRouter();
  const handledStateRef = useRef<ActionResult | null>(null);
  const getSuccessMessageRef = useRef(getSuccessMessage);
  const onSuccessRef = useRef(onSuccess);

  getSuccessMessageRef.current = getSuccessMessage;
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!state) return;
    if (handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.ok) {
      const message =
        getSuccessMessageRef.current?.(state) ?? successMessage ?? "";
      if (message) toast.success(message);
      onSuccessRef.current?.(state);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      } else if (state.bookId) {
        router.push(`/books/${state.bookId}`);
      }
      return;
    }

    toast.error(state.error);
  }, [state, successMessage, toast, router]);
}
