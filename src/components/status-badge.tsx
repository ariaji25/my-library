"use client";

import type { BookStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";
import { formatStatus } from "@/lib/utils";

const variants: Record<
  BookStatus,
  "default" | "secondary" | "success" | "warning" | "outline"
> = {
  NOT_STARTED: "secondary",
  READING: "warning",
  COMPLETED: "success",
  WISHLIST: "outline",
};

export function StatusBadge({ status }: { status: BookStatus }) {
  const { messages } = useLocale();
  return (
    <Badge variant={variants[status]}>{formatStatus(status, messages)}</Badge>
  );
}
