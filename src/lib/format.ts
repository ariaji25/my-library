import { format } from "date-fns";
import { id } from "date-fns/locale";

const DATE_LOCALE = { locale: id };

export function formatAppDate(
  date: Date,
  pattern = "d MMM yyyy"
): string {
  return format(date, pattern, DATE_LOCALE);
}

export function formatAppMonthYear(date: Date): string {
  return format(date, "MMM yyyy", DATE_LOCALE);
}

export function formatAppMonthDay(date: Date): string {
  return format(date, "d MMM", DATE_LOCALE);
}

export function bookCountLabel(count: number): string {
  return `${count} buku`;
}

export function formatChartMonthYear(date: Date): string {
  return format(date, "MMM yyyy", DATE_LOCALE);
}

export function formatChartWeekLabel(date: Date): string {
  return format(date, "d MMM", DATE_LOCALE);
}
