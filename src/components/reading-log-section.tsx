import { format } from "date-fns";
import { Clock, Quote, Trash2 } from "lucide-react";
import type { ReadingLog } from "@/generated/prisma/client";
import { addReadingLog, deleteReadingLog } from "@/lib/actions";
import { getTranslations } from "@/lib/i18n/server";
import { formatAppDate } from "@/lib/format";
import {
  formatReadingDuration,
  summarizeReadingLogs,
} from "@/lib/reading-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const today = format(new Date(), "yyyy-MM-dd");

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

        <form
          action={addReadingLog.bind(null, bookId)}
          className="grid gap-4 rounded-2xl border border-border/80 p-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="reading-date">{m.common.date}</Label>
            <Input
              id="reading-date"
              name="date"
              type="date"
              defaultValue={today}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pagesRead">{m.reading.pagesRead}</Label>
            <Input
              id="pagesRead"
              name="pagesRead"
              type="number"
              min={1}
              placeholder={`${m.common.example} 25`}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutesRead">{m.reading.readingTimeMinutes}</Label>
            <Input
              id="minutesRead"
              name="minutesRead"
              type="number"
              min={1}
              placeholder={`${m.common.example} 45`}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="quoteOfTheDay">{m.reading.quoteOfDay}</Label>
            <Textarea
              id="quoteOfTheDay"
              name="quoteOfTheDay"
              rows={2}
              placeholder={m.reading.quotePlaceholder}
            />
          </div>
          <Button type="submit" className="sm:col-span-2 sm:w-fit">
            {m.bookForm.logReading}
          </Button>
        </form>

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
                  <form action={deleteReadingLog.bind(null, log.id, bookId)}>
                    <Button type="submit" variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
