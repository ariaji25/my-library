"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteReadingLog } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "@/hooks/use-action-toast";
import { useLocale } from "@/components/locale-provider";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  logId: string;
  bookId: string;
};

export function DeleteReadingLogButton({ logId, bookId }: Props) {
  const { messages: m } = useLocale();
  const action = deleteReadingLog.bind(null, logId, bookId);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  useActionToast(state, { successMessage: m.toast.removed });

  return (
    <form action={formAction}>
      <SubmitButton type="submit" variant="ghost" size="icon">
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </SubmitButton>
    </form>
  );
}
