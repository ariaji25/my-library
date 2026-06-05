"use client";

import { useEffect, useRef, useState } from "react";
import { BookMarked, X } from "lucide-react";
import type { AiMentionBook } from "@/lib/ai-types";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  books: AiMentionBook[];
  onChange: (books: AiMentionBook[]) => void;
  disabled?: boolean;
};

export function AiBookMentionPicker({ books, onChange, disabled }: Props) {
  const { messages: t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AiMentionBook[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/ai/books?q=${encodeURIComponent(q)}`
        );
        const data = (await res.json()) as { books?: AiMentionBook[] };
        setResults(data.books ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [open, query]);

  function addBook(book: AiMentionBook) {
    if (books.some((b) => b.id === book.id) || books.length >= 3) return;
    onChange([...books, book]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function removeBook(id: string) {
    onChange(books.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-2">
      {books.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {books.map((book) => (
            <span
              key={book.id}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/30 bg-primary/10 py-1 pl-2.5 pr-1 text-xs text-foreground sm:text-sm"
            >
              <BookMarked className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">
                {book.title}
                <span className="text-muted-foreground"> · {book.author}</span>
              </span>
              <button
                type="button"
                onClick={() => removeBook(book.id)}
                disabled={disabled}
                className="rounded-full p-0.5 hover:bg-primary/20"
                aria-label={interpolate(t.aria.removeBook, { title: book.title })}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full text-xs sm:text-sm"
          disabled={disabled || books.length >= 3}
          onClick={() => setOpen((v) => !v)}
        >
          <BookMarked className="mr-1.5 h-3.5 w-3.5" />
          {t.assistant.mentionBook}
        </Button>

        {open && (
          <div className="absolute bottom-full left-0 z-20 mb-2 w-full min-w-[min(100%,20rem)] rounded-xl border border-border bg-card p-2 shadow-lg">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.assistant.mentionSearch}
              autoFocus
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            />
            <ul className="mt-2 max-h-48 overflow-y-auto">
              {loading && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {t.assistant.searching}
                </li>
              )}
              {!loading && query.trim() && results.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {t.assistant.bookNotFound}
                </li>
              )}
              {results.map((book) => {
                const added = books.some((b) => b.id === book.id);
                return (
                  <li key={book.id}>
                    <button
                      type="button"
                      disabled={added}
                      onClick={() => addBook(book)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted/70",
                        added && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className="font-medium">{book.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {book.author}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1 px-1 text-[0.65rem] text-muted-foreground">
              {t.assistant.mentionHint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
