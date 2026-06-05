import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BookStatus } from "@/generated/prisma/client";
import type { Messages } from "@/lib/i18n/messages/en";
import { statusLabel } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStatus(status: string, messages: Messages): string {
  return statusLabel(status as BookStatus, messages);
}
