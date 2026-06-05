import type { BookStatus, WishlistPriority } from "@/generated/prisma/client";
import type { SortOption } from "@/lib/constants";
import { en, type Messages } from "@/lib/i18n/messages/en";
import { id } from "@/lib/i18n/messages/id";

export type { Messages };

export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "locale";

const MESSAGES: Record<Locale, Messages> = { en, id };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "id" || value === "en";
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? "")
  );
}

export function bookCountLabel(count: number, messages: Messages): string {
  return interpolate(messages.bookCount, { count });
}

export function bookCountInCollection(
  count: number,
  messages: Messages
): string {
  return interpolate(messages.bookCountInCollection, { count });
}

export function statusLabel(status: BookStatus, messages: Messages): string {
  return messages.bookStatus[status] ?? status;
}

export function priorityLabel(
  priority: WishlistPriority,
  messages: Messages
): string {
  return messages.wishlistPriority[priority] ?? priority;
}

export function sortLabel(sort: SortOption, messages: Messages): string {
  return messages.sort[sort] ?? sort;
}

export function errorMessage(
  key: keyof Messages["errors"],
  locale?: Locale
): string {
  const loc = locale ?? DEFAULT_LOCALE;
  return MESSAGES[loc].errors[key];
}
