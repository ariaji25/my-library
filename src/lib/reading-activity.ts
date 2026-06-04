import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";

export type ReadingLogActivityInput = {
  id: string;
  date: Date;
  pagesRead: number;
  minutesRead: number;
  quoteOfTheDay: string | null;
  book: { id: string; title: string; author: string };
};

export type DailyReadingActivity = {
  date: string;
  pages: number;
  minutes: number;
  sessions: number;
  logs: ReadingLogActivityInput[];
};

export type MonthlyReadingActivityPoint = {
  month: string;
  label: string;
  pages: number;
  minutes: number;
  sessions: number;
  activeDays: number;
};

export type CalendarDayCell = {
  date: string | null;
  day: number | null;
  pages: number;
  minutes: number;
  sessions: number;
  hasQuote: boolean;
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  inMonth: boolean;
};

export type MonthCalendarGrid = {
  year: number;
  month: number;
  monthLabel: string;
  weeks: CalendarDayCell[][];
  maxMinutes: number;
  totals: {
    pages: number;
    minutes: number;
    sessions: number;
    activeDays: number;
  };
};

function dateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function buildDailyReadingMap(
  logs: ReadingLogActivityInput[]
): Map<string, DailyReadingActivity> {
  const map = new Map<string, DailyReadingActivity>();

  for (const log of logs) {
    const key = dateKey(log.date);
    const existing = map.get(key);
    if (existing) {
      existing.pages += log.pagesRead;
      existing.minutes += log.minutesRead;
      existing.sessions += 1;
      existing.logs.push(log);
    } else {
      map.set(key, {
        date: key,
        pages: log.pagesRead,
        minutes: log.minutesRead,
        sessions: 1,
        logs: [log],
      });
    }
  }

  return map;
}

export function buildMonthlyReadingActivity(
  dailyMap: Map<string, DailyReadingActivity>,
  monthCount = 12,
  now = new Date()
): MonthlyReadingActivityPoint[] {
  const months = Array.from({ length: monthCount }, (_, i) => {
    const start = startOfMonth(subMonths(now, monthCount - 1 - i));
    return {
      month: format(start, "yyyy-MM"),
      label: format(start, "MMM yyyy"),
      start,
    };
  });

  return months.map((m) => {
    let pages = 0;
    let minutes = 0;
    let sessions = 0;
    let activeDays = 0;

    for (const [, day] of dailyMap) {
      const d = new Date(day.date);
      if (isSameMonth(d, m.start)) {
        pages += day.pages;
        minutes += day.minutes;
        sessions += day.sessions;
        activeDays += 1;
      }
    }

    return {
      month: m.month,
      label: m.label,
      pages,
      minutes,
      sessions,
      activeDays,
    };
  });
}

function heatLevel(minutes: number, maxMinutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes <= 0) return 0;
  if (maxMinutes <= 0) return 4;
  const ratio = minutes / maxMinutes;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function buildMonthCalendar(
  year: number,
  month: number,
  dailyMap: Map<string, DailyReadingActivity>,
  now = new Date()
): MonthCalendarGrid {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  let maxMinutes = 0;
  let totalPages = 0;
  let totalMinutes = 0;
  let totalSessions = 0;
  let activeDays = 0;

  for (const day of days) {
    const activity = dailyMap.get(dateKey(day));
    if (activity) {
      maxMinutes = Math.max(maxMinutes, activity.minutes);
      totalPages += activity.pages;
      totalMinutes += activity.minutes;
      totalSessions += activity.sessions;
      activeDays += 1;
    }
  }

  const startPad = monthStart.getDay();
  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({
      date: null,
      day: null,
      pages: 0,
      minutes: 0,
      sessions: 0,
      hasQuote: false,
      level: 0,
      isToday: false,
      inMonth: false,
    });
  }

  for (const day of days) {
    const key = dateKey(day);
    const activity = dailyMap.get(key);
    const minutes = activity?.minutes ?? 0;
    const hasQuote =
      activity?.logs.some((l) => l.quoteOfTheDay?.trim()) ?? false;
    cells.push({
      date: key,
      day: day.getDate(),
      pages: activity?.pages ?? 0,
      minutes,
      sessions: activity?.sessions ?? 0,
      hasQuote,
      level: heatLevel(minutes, maxMinutes),
      isToday: isSameDay(day, now),
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      date: null,
      day: null,
      pages: 0,
      minutes: 0,
      sessions: 0,
      hasQuote: false,
      level: 0,
      isToday: false,
      inMonth: false,
    });
  }

  const weeks: CalendarDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return {
    year,
    month,
    monthLabel: format(monthStart, "MMMM yyyy"),
    weeks,
    maxMinutes,
    totals: {
      pages: totalPages,
      minutes: totalMinutes,
      sessions: totalSessions,
      activeDays,
    },
  };
}

export function serializeReadingActivity(logs: ReadingLogActivityInput[]) {
  const dailyMap = buildDailyReadingMap(logs);
  const monthly = buildMonthlyReadingActivity(dailyMap);
  const now = new Date();

  return {
    logs: logs.map((l) => ({
      id: l.id,
      date: dateKey(l.date),
      pagesRead: l.pagesRead,
      minutesRead: l.minutesRead,
      quoteOfTheDay: l.quoteOfTheDay,
      book: l.book,
    })),
    monthly,
    currentMonthKey: format(now, "yyyy-MM"),
    hasActivity: logs.length > 0,
  };
}

export type SerializedReadingActivity = ReturnType<
  typeof serializeReadingActivity
>;
