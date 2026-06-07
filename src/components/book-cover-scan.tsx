"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { BookSearchHit } from "@/lib/book-search-types";
import {
  COVER_MAX_BYTES,
  isAllowedCoverFile,
} from "@/lib/cover-upload-constants";
import { CoverFilePicker } from "@/components/cover-file-picker";
import { useLocale } from "@/components/locale-provider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SCAN_TIMEOUT_MS = 90_000;

type Props = {
  onScan: (book: BookSearchHit, file: File) => void;
  onCoverFile?: (file: File) => void;
  aiConfigured?: boolean;
  className?: string;
};

export function BookCoverScan({
  onScan,
  onCoverFile,
  aiConfigured = true,
  className,
}: Props) {
  const { messages: m } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size === 0) {
      setError(m.errors.coverEmpty);
      return;
    }
    if (file.size > COVER_MAX_BYTES) {
      setError(m.errors.coverSize);
      return;
    }
    if (!isAllowedCoverFile(file)) {
      setError(m.errors.coverType);
      return;
    }

    onCoverFile?.(file);

    if (!aiConfigured) {
      setError(m.bookForm.coverScanAiHint);
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);

    try {
      const body = new FormData();
      body.set("cover", file);

      const res = await fetch("/api/books/scan-cover", {
        method: "POST",
        body,
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });

      const data = (await res.json()) as {
        result?: BookSearchHit;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? m.bookForm.coverScanFailed);
        return;
      }

      if (!data.result) {
        setError(m.bookForm.coverScanFailed);
        return;
      }

      onScan(data.result, file);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(m.bookForm.coverScanTimeout);
      } else {
        setError(m.bookForm.coverScanFailed);
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label>{m.bookForm.coverScanLabel}</Label>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5">
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            {loading ? m.bookForm.coverScanning : m.bookForm.coverScanCta}
          </p>
          <CoverFilePicker
            layout="stacked"
            disabled={loading}
            onFile={(file) => void handleFile(file)}
          />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {m.bookForm.uploadHint}
        </p>
      </div>
      {!aiConfigured && (
        <p className="text-xs text-muted-foreground">{m.bookForm.coverScanAiHint}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {aiConfigured && !loading && !error && (
        <p className="text-xs text-muted-foreground">{m.bookForm.coverScanHint}</p>
      )}
    </div>
  );
}
