"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parse } from "date-fns";
import { ChevronLeft, ChevronRight, Flame, Quote } from "lucide-react";
import {
  buildDailyReadingMap,
  buildMonthCalendar,
  type SerializedReadingActivity,
} from "@/lib/reading-activity";
import { formatAppMonthDay, formatAppMonthYear } from "@/lib/format";
import { formatReadingDuration } from "@/lib/reading-stats";
import { ReadingActivityMonthlyChart } from "@/components/reading-activity-monthly-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const HEAT_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted/40",
  1: "bg-primary/30",
  2: "bg-primary/50",
  3: "bg-primary/70",
  4: "bg-primary",
};

type Props = SerializedReadingActivity;

export function ReadingActivityDashboard({
  logs,
  monthly,
  currentMonthKey,
  hasActivity,
}: Props) {
  const dailyMap = useMemo(() => {
    const inputs = logs.map((l) => ({
      id: l.id,
      date: parse(l.date, "yyyy-MM-dd", new Date()),
      pagesRead: l.pagesRead,
      minutesRead: l.minutesRead,
      quoteOfTheDay: l.quoteOfTheDay,
      book: l.book,
    }));
    return buildDailyReadingMap(inputs);
  }, [logs]);

  const [viewKey, setViewKey] = useState(currentMonthKey);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const viewDate = parse(`${viewKey}-01`, "yyyy-MM-dd", new Date());
  const calendar = useMemo(
    () =>
      buildMonthCalendar(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        dailyMap
      ),
    [viewDate, dailyMap]
  );

  const currentMonthStats = monthly.find((m) => m.month === viewKey);
  const selectedDay = selectedDate ? dailyMap.get(selectedDate) : null;

  function shiftMonth(delta: number) {
    const d = parse(`${viewKey}-01`, "yyyy-MM-dd", new Date());
    const next = new Date(d.getFullYear(), d.getMonth() + delta, 1);
    const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    setViewKey(nextKey);
    setSelectedDate(null);
  }

  if (!hasActivity) {
    return (
      <Card className="border-border/80">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Aktivitas membaca</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5">
          <p className="rounded-xl border border-dashed border-border/80 py-6 text-center text-xs text-muted-foreground">
            Catat bacaan di buku untuk mengisi kalendermu.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-2 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Aktivitas membaca</CardTitle>
          {currentMonthStats && (
            <p className="text-xs tabular-nums text-muted-foreground">
              <span className="font-medium text-foreground">
                {currentMonthStats.pages}
              </span>{" "}
              hal ·{" "}
              <span className="font-medium text-foreground">
                {formatReadingDuration(currentMonthStats.minutes)}
              </span>{" "}
              · {currentMonthStats.activeDays} hari
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 sm:px-5">
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => shiftMonth(-1)}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium">
              {formatAppMonthYear(viewDate)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => shiftMonth(1)}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 justify-items-center gap-0.5 text-[10px] text-muted-foreground">
            {WEEKDAYS.map((d, i) => (
              <span key={`${d}-${i}`} className="w-7 text-center">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 justify-items-center gap-x-0.5 gap-y-1">
            {calendar.weeks.flat().map((cell, i) => {
              if (!cell.inMonth || cell.day == null) {
                return (
                  <div
                    key={`pad-${i}`}
                    className="h-7 w-7 shrink-0"
                    aria-hidden
                  />
                );
              }

              const isSelected = selectedDate === cell.date;
              const active = cell.sessions > 0;
              const Icon = cell.hasQuote ? Quote : Flame;

              return (
                <button
                  key={cell.date ?? i}
                  type="button"
                  onClick={() =>
                    cell.date &&
                    setSelectedDate(
                      selectedDate === cell.date ? null : cell.date
                    )
                  }
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition",
                    active ? HEAT_CLASS[cell.level] : "bg-transparent",
                    active && "text-primary-foreground hover:opacity-90",
                    !active && "text-muted-foreground/50 hover:bg-muted/60",
                    cell.isToday && "ring-1 ring-ring",
                    isSelected && "ring-1 ring-foreground/50"
                  )}
                  title={
                    active
                      ? `${cell.day} · ${cell.pages} halaman · ${formatReadingDuration(cell.minutes)}`
                      : `${cell.day}`
                  }
                >
                  {active ? (
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  ) : (
                    <span className="text-[10px] tabular-nums">{cell.day}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/50">
                <Flame className="h-2.5 w-2.5 text-primary-foreground" />
              </span>
              baca
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/50">
                <Quote className="h-2.5 w-2.5 text-primary-foreground" />
              </span>
              kutipan
            </span>
          </div>

          {selectedDay ? (
            <div className="rounded-xl border border-border/80 bg-muted/30 px-3 py-2">
              <p className="text-xs font-medium">
                {formatAppMonthDay(
                  parse(selectedDay.date, "yyyy-MM-dd", new Date())
                )}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {selectedDay.pages} hal ·{" "}
                  {formatReadingDuration(selectedDay.minutes)}
                </span>
              </p>
              <ul className="mt-1.5 space-y-1">
                {selectedDay.logs.map((log) => (
                  <li key={log.id} className="text-xs">
                    <Link
                      href={`/books/${log.book.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {log.book.title}
                    </Link>
                    <span className="text-muted-foreground">
                      {" "}
                      · {log.pagesRead} hal ·{" "}
                      {formatReadingDuration(log.minutesRead)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="border-t border-border/80 pt-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            12 bulan terakhir
          </p>
          <ReadingActivityMonthlyChart data={monthly} compact />
        </section>
      </CardContent>
    </Card>
  );
}
