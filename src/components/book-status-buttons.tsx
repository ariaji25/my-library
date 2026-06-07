"use client";

import { useActionState } from "react";
import type { BookStatus } from "@/generated/prisma/client";
import { updateBookStatus } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { BOOK_STATUS_VALUES } from "@/lib/constants";
import { statusLabel } from "@/lib/i18n";
import { useActionToast } from "@/hooks/use-action-toast";
import { useLocale } from "@/components/locale-provider";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  bookId: string;
  currentStatus: BookStatus;
};

function StatusButton({
  bookId,
  status,
  currentStatus,
}: {
  bookId: string;
  status: BookStatus;
  currentStatus: BookStatus;
}) {
  const { messages: m } = useLocale();
  const action = updateBookStatus.bind(null, bookId, status);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  useActionToast(state, { successMessage: m.toast.updated });

  return (
    <form action={formAction}>
      <SubmitButton
        variant={currentStatus === status ? "default" : "secondary"}
        size="sm"
        className="text-xs sm:text-sm"
      >
        {statusLabel(status, m)}
      </SubmitButton>
    </form>
  );
}

export function BookStatusButtons({ bookId, currentStatus }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {BOOK_STATUS_VALUES.map((value) => (
        <StatusButton
          key={value}
          bookId={bookId}
          status={value}
          currentStatus={currentStatus}
        />
      ))}
    </div>
  );
}
