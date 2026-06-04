export type ReadingLogSummary = {
  pagesRead: number;
  minutesRead: number;
  sessionCount: number;
  currentPage: number;
  percentComplete: number | null;
};

export type ReadingLogRow = {
  pagesRead: number;
  minutesRead: number;
};

export function summarizeReadingLogs(
  logs: ReadingLogRow[],
  totalPages: number | null | undefined
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
    currentPage,
    percentComplete,
  };
}

export function formatReadingDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}
