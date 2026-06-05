import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BookStatus } from "@/generated/prisma/client";
import { statusLabel } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStatus(status: string): string {
  return statusLabel(status as BookStatus);
}
