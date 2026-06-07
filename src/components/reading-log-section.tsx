import { Clock, Quote } from "lucide-react";
import type { ReadingLog } from "@/generated/prisma/client";
import { getTranslations } from "@/lib/i18n/server";
import { formatAppDate } from "@/lib/format";
import {
  formatReadingDuration,
  summarizeReadingLogs,
} from "@/lib/reading-stats";
import { ReadingLogForm } from "@/components/reading-log-form";
import { DeleteReadingLogButton } from "@/components/delete-reading-log-button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingProgressExport } from "@/components/reading-progress-export";

type Props = {
  bookId: string;
  title: string;
  author: string;
  totalPages: number | null;
  logs: ReadingLog[];
};

export async function ReadingLogSection({
  bookId,
  title,
  totalPages,
  logs,
}: Props) {
  const { locale, messages: m } = await getTranslations();
  const stats = summarizeReadingLogs(logs, totalPages);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{m.reading.progressTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {m.reading.progressSubtitle}
          </p>
        </div>
        <ReadingProgressExport
          bookName={title}
          pagesRead={stats.pagesRead}
          totalPages={totalPages}
          minutesRead={stats.minutesRead}
          quote={
            logs.find((l) => l.quoteOfTheDay?.trim())?.quoteOfTheDay?.trim() ??
            null
          }
          sessionCount={stats.sessionCount}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.sessionCount > 0 && (
          <div className="grid gap-4 rounded-2xl border border-border/80 bg-muted/30 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {m.reading.pagesLogged}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {stats.pagesRead}
                {totalPages ? (
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / {totalPages}
                  </span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {m.reading.timeReading}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatReadingDuration(stats.minutesRead, m)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {m.common.sessions}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {stats.sessionCount}
              </p>
            </div>
          </div>
        )}

        {stats.percentComplete != null && (
          <div className="space-y-2">
            <div className="flex items-end justify-between text-sm">
              <span className="text-muted-foreground">{m.reading.bookProgress}</span>
              <span className="font-semibold tabular-nums">
                {stats.percentComplete}%
              </span>
            </div>
            <Progress value={stats.percentComplete} className="h-2" />
          </div>
        )}

        <ReadingLogForm bookId={bookId} />

        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{m.reading.noSessions}</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="rounded-2xl border border-border/80 bg-muted/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="font-medium">
                        {formatAppDate(log.date, locale)}
                      </span>
                      <span className="text-muted-foreground">
                        {log.pagesRead} {m.common.pages}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatReadingDuration(log.minutesRead, m)}
                      </span>
                    </div>
                    {log.quoteOfTheDay && (
                      <p className="flex gap-2 text-sm italic leading-relaxed text-foreground/90">
                        <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                        <span>&ldquo;{log.quoteOfTheDay}&rdquo;</span>
                      </p>
                    )}
                  </div>
                  <DeleteReadingLogButton logId={log.id} bookId={bookId} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
