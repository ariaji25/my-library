"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale } from "@/components/locale-provider";

export type WeeklyProgressChartPoint = {
  label: string;
  completed: number;
  started: number;
};

export function WeeklyProgressChart({
  data,
}: {
  data: WeeklyProgressChartPoint[];
}) {
  const { messages: m } = useLocale();
  const hasActivity = data.some((d) => d.completed > 0 || d.started > 0);

  if (!hasActivity) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {m.reading.weeklyEmpty}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--card)",
          }}
          formatter={(value, name) => [
            value ?? 0,
            name === "completed" ? m.reading.chartFinished : m.reading.chartStarted,
          ]}
        />
        <Legend
          formatter={(value) =>
            value === "completed" ? m.reading.chartFinished : m.reading.chartStarted
          }
        />
        <Bar
          dataKey="completed"
          name="completed"
          fill="#e879a9"
          radius={[4, 4, 0, 0]}
          className="dark:fill-[#f9a8d4]"
        />
        <Bar
          dataKey="started"
          name="started"
          fill="#a78bfa"
          radius={[4, 4, 0, 0]}
          className="dark:fill-[#c4b5fd]"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
