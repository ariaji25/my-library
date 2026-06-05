import type { Messages } from "@/lib/i18n/messages/en";

export type ReadingLogSummary = {
  pagesRead: number;
  minutesRead: number;
  sessionCount: number;
  percentComplete: number | null;
  currentPage: number;
};

export type ReadingLogRow = {
  pagesRead: number;
  minutesRead: number;
};

export function summarizeReadingLogs(
  logs: ReadingLogRow[],
  totalPages: number | null
): ReadingLogSummary {
  const pagesRead = logs.reduce((sum, log) => sum + log.pagesRead, 0);
  const minutesRead = logs.reduce((sum, log) => sum + log.minutesRead, 0);
  const currentPage = pagesRead;
  const percentComplete =
    totalPages && totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : null;

  return {
    pagesRead,
    minutesRead,
    sessionCount: logs.length,
    percentComplete,
    currentPage,
  };
}

export function formatReadingDuration(
  minutes: number,
  messages: Messages
): string {
  if (minutes < 60) return `${minutes} ${messages.duration.minutes}`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours} ${messages.duration.hours}`;
  return `${hours} ${messages.duration.hours} ${remainder} ${messages.duration.minutes}`;
}
