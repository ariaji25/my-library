import type { BookStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
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
  return <Badge variant={variants[status]}>{formatStatus(status)}</Badge>;
}
