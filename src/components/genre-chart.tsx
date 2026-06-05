"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale } from "@/components/locale-provider";

export function GenreChart({
  data,
}: {
  data: { genre: string; count: number }[];
}) {
  const { messages: m } = useLocale();

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {m.reading.genreEmpty}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="genre"
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--card)",
          }}
        />
        <Bar dataKey="count" fill="#e879a9" radius={[0, 6, 6, 0]} className="dark:fill-[#f9a8d4]" />
      </BarChart>
    </ResponsiveContainer>
  );
}
