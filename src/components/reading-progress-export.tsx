"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import {
  downloadReadingProgressPng,
  type ReadingProgressExportData,
} from "@/lib/export-reading-progress-png";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";

type Props = ReadingProgressExportData & {
  sessionCount: number;
};

export function ReadingProgressExport({ sessionCount, ...data }: Props) {
  const { messages: m } = useLocale();
  const [exporting, setExporting] = useState(false);

  if (sessionCount === 0) return null;

  async function handleExport() {
    setExporting(true);
    try {
      downloadReadingProgressPng(data, m);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      disabled={exporting}
      onClick={handleExport}
      aria-label={exporting ? m.aria.sharing : m.aria.shareProgress}
      title={m.reading.sharePng}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
