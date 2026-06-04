import {
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";

const WEEK_OPTS = { weekStartsOn: 0 as const };

export type MonthlyProgressPoint = {
  month: string;
  label: string;
  completed: number;
  started: number;
};

export type WeeklyProgressPoint = {
  week: string;
  label: string;
  completed: number;
  started: number;
};

type BookDates = {
  completedAt: Date | null;
  startedAt: Date | null;
};

function countInInterval(
  books: BookDates[],
  field: "completedAt" | "startedAt",
  start: Date,
  end: Date
): number {
  return books.filter(
    (b) => b[field] && isWithinInterval(b[field]!, { start, end })
  ).length;
}

export function buildWeeklyProgress(
  books: BookDates[],
  weekCount = 12,
  now = new Date()
): WeeklyProgressPoint[] {
  const weeks = Array.from({ length: weekCount }, (_, i) => {
    const start = startOfWeek(subWeeks(now, weekCount - 1 - i), WEEK_OPTS);
    return {
      week: format(start, "yyyy-MM-dd"),
      label: format(start, "MMM d"),
      start,
      end: endOfWeek(start, WEEK_OPTS),
    };
  });

  return weeks.map((w) => ({
    week: w.week,
    label: w.label,
    completed: countInInterval(books, "completedAt", w.start, w.end),
    started: countInInterval(books, "startedAt", w.start, w.end),
  }));
}

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
    completed: countInInterval(books, "completedAt", m.start, m.end),
    started: countInInterval(books, "startedAt", m.start, m.end),
  }));
}

export function getCurrentWeekProgress(
  series: WeeklyProgressPoint[]
): WeeklyProgressPoint | undefined {
  return series[series.length - 1];
}
