"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";
import { useToast } from "@/components/toast-provider";

type Options = {
  successMessage: string;
  onSuccess?: (result: Extract<ActionResult, { ok: true }>) => void;
};

export function useActionToast(
  state: ActionResult | null,
  { successMessage, onSuccess }: Options
) {
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      toast.success(successMessage);
      onSuccess?.(state);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      } else if (state.bookId) {
        router.push(`/books/${state.bookId}`);
      }
      return;
    }

    toast.error(state.error);
  }, [state, successMessage, toast, router, onSuccess]);
}
