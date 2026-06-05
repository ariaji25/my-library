import { format } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { Locale } from "@/lib/i18n";
import type { Messages } from "@/lib/i18n/messages/en";
import { bookCountLabel, interpolate } from "@/lib/i18n";

function dateFnsLocale(locale: Locale) {
  return locale === "id" ? idLocale : enUS;
}

export function formatAppDate(
  date: Date,
  locale: Locale,
  pattern = "d MMM yyyy"
): string {
  return format(date, pattern, { locale: dateFnsLocale(locale) });
}

export function formatAppMonthYear(date: Date, locale: Locale): string {
  return format(date, "MMM yyyy", { locale: dateFnsLocale(locale) });
}

export function formatAppMonthDay(date: Date, locale: Locale): string {
  return format(date, "d MMM", { locale: dateFnsLocale(locale) });
}

export { bookCountLabel };

export function formatChartMonthYear(date: Date, locale: Locale): string {
  return formatAppMonthYear(date, locale);
}

export function formatChartWeekLabel(date: Date, locale: Locale): string {
  return format(date, "d MMM", { locale: dateFnsLocale(locale) });
}

export function exportPagesLine(
  pagesRead: number,
  totalPages: number | null,
  messages: Messages
): string {
  if (totalPages && totalPages > 0) {
    return interpolate(messages.export.pagesOf, {
      read: pagesRead,
      total: totalPages,
    });
  }
  return interpolate(messages.export.pagesOnly, { read: pagesRead });
}
