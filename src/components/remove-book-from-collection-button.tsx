"use client";

import { useActionState } from "react";
import { removeBookFromCollection } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "@/hooks/use-action-toast";
import { useLocale } from "@/components/locale-provider";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  collectionId: string;
  bookId: string;
};

export function RemoveBookFromCollectionButton({
  collectionId,
  bookId,
}: Props) {
  const { messages: m } = useLocale();
  const action = removeBookFromCollection.bind(null, collectionId, bookId);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  useActionToast(state, { successMessage: m.toast.removed });

  return (
    <form action={formAction} className="mt-2">
      <SubmitButton type="submit" variant="ghost" size="sm">
        {m.common.remove}
      </SubmitButton>
    </form>
  );
}
