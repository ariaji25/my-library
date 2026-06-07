"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "@/hooks/use-action-toast";

type Props = {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  successMessage: string;
  className?: string;
  encType?: string;
  children: React.ReactNode;
};

export function ActionForm({
  action,
  successMessage,
  className,
  encType,
  children,
}: Props) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  useActionToast(state, { successMessage });

  return (
    <form
      action={formAction}
      className={className}
      encType={encType}
    >
      {children}
    </form>
  );
}
