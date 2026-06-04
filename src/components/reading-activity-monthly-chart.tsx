"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyReadingActivityPoint } from "@/lib/reading-activity";
import { formatReadingDuration } from "@/lib/reading-stats";

export function ReadingActivityMonthlyChart({
  data,
  compact = false,
}: {
  data: MonthlyReadingActivityPoint[];
  compact?: boolean;
}) {
  const hasActivity = data.some(
    (d) => d.pages > 0 || d.minutes > 0 || d.sessions > 0
  );

  if (!hasActivity) {
    return (
      <p
        className={
          compact
            ? "py-4 text-center text-xs text-muted-foreground"
            : "py-8 text-center text-sm text-muted-foreground"
        }
      >
        Log reading sessions on your books to see monthly activity.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    label: d.label,
    pages: d.pages,
    hours: Math.round((d.minutes / 60) * 10) / 10,
    minutes: d.minutes,
    activeDays: d.activeDays,
  }));

  const height = compact ? 140 : 260;
  const tickSize = compact ? 9 : 11;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: tickSize }}
          interval="preserveStartEnd"
          tickFormatter={(value: string) => value.replace(/\s\d{4}$/, "")}
        />
        <YAxis
          yAxisId="pages"
          allowDecimals={false}
          tick={{ fontSize: tickSize }}
          width={compact ? 24 : 32}
        />
        <YAxis
          yAxisId="time"
          orientation="right"
          allowDecimals={false}
          tick={{ fontSize: tickSize }}
          width={compact ? 28 : 36}
          tickFormatter={(v) => `${v}h`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--card)",
          }}
          formatter={(value, name, item) => {
            const payload = item.payload as { minutes: number; activeDays: number };
            if (name === "hours") {
              return [formatReadingDuration(payload.minutes), "Reading time"];
            }
            if (name === "pages") return [value ?? 0, "Pages"];
            return [value ?? 0, String(name)];
          }}
          labelFormatter={(label) => label}
        />
        {!compact && (
          <Legend
            formatter={(value) =>
              value === "pages"
                ? "Pages"
                : value === "hours"
                  ? "Reading time"
                  : value
            }
          />
        )}
        <Line
          yAxisId="pages"
          type="monotone"
          dataKey="pages"
          name="pages"
          stroke="#e879a9"
          strokeWidth={2}
          dot={{ r: compact ? 2 : 3, fill: "#e879a9" }}
          activeDot={{ r: compact ? 4 : 5 }}
        />
        <Line
          yAxisId="time"
          type="monotone"
          dataKey="hours"
          name="hours"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={{ r: compact ? 2 : 3, fill: "#a78bfa" }}
          activeDot={{ r: compact ? 4 : 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
