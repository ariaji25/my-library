"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import {
  downloadReadingProgressPng,
  type ReadingProgressExportData,
} from "@/lib/export-reading-progress-png";
import { Button } from "@/components/ui/button";

type Props = ReadingProgressExportData & {
  sessionCount: number;
};

export function ReadingProgressExport({ sessionCount, ...data }: Props) {
  const [exporting, setExporting] = useState(false);

  if (sessionCount === 0) return null;

  async function handleExport() {
    setExporting(true);
    try {
      downloadReadingProgressPng(data);
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
      aria-label={exporting ? "Sharing…" : "Share reading progress"}
      title="Share as PNG"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
