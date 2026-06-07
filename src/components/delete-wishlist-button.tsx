"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteWishlistItem } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "@/hooks/use-action-toast";
import { useLocale } from "@/components/locale-provider";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  itemId: string;
};

export function DeleteWishlistButton({ itemId }: Props) {
  const { messages: m } = useLocale();
  const action = deleteWishlistItem.bind(null, itemId);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  useActionToast(state, { successMessage: m.toast.removed });

  return (
    <form action={formAction}>
      <SubmitButton type="submit" variant="ghost" size="icon">
        <Trash2 className="h-4 w-4" />
      </SubmitButton>
    </form>
  );
}
