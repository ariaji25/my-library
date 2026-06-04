import {
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
  subMonths,
} from "date-fns";

export type MonthlyProgressPoint = {
  month: string;
  label: string;
  completed: number;
  started: number;
};

type BookDates = {
  completedAt: Date | null;
  startedAt: Date | null;
};

export function buildMonthlyProgress(
  books: BookDates[],
  monthCount = 12,
  now = new Date()
): MonthlyProgressPoint[] {
  const months = Array.from({ length: monthCount }, (_, i) => {
    const start = startOfMonth(subMonths(now, monthCount - 1 - i));
    return {
      month: format(start, "yyyy-MM"),
      label: format(start, "MMM yyyy"),
      start,
      end: endOfMonth(start),
    };
  });

  return months.map((m) => ({
    month: m.month,
    label: m.label,
    completed: books.filter(
      (b) =>
        b.completedAt &&
        isWithinInterval(b.completedAt, { start: m.start, end: m.end })
    ).length,
    started: books.filter(
      (b) =>
        b.startedAt &&
        isWithinInterval(b.startedAt, { start: m.start, end: m.end })
    ).length,
  }));
}

export function getCurrentMonthProgress(
  series: MonthlyProgressPoint[]
): MonthlyProgressPoint | undefined {
  return series[series.length - 1];
}
