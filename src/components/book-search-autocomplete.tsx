"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";
import type { BookSearchHit } from "@/lib/book-search-types";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (book: BookSearchHit) => void;
  label?: string;
  placeholder?: string;
  className?: string;
};

export function BookSearchAutocomplete({
  onSelect,
  label = "Search books",
  placeholder = "Title or author…",
  className,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setOpen(true);

    try {
      const res = await fetch(
        `/api/books/search?q=${encodeURIComponent(trimmed)}`,
        { credentials: "same-origin", cache: "no-store" }
      );
      const data = (await res.json()) as {
        results?: BookSearchHit[];
        error?: string;
      };

      if (requestId !== requestIdRef.current) return;

      if (!res.ok) {
        setResults([]);
        setError(data.error ?? "Search failed");
        return;
      }

      setResults(data.results ?? []);
      setActiveIndex(-1);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setError("Search failed");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function scheduleSearch(value: string) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      requestIdRef.current += 1;
      setLoading(false);
      setResults([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(value);
    }, 300);
  }

  function pick(book: BookSearchHit) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    requestIdRef.current += 1;
    onSelect(book);
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    setLoading(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      pick(results[activeIndex]!);
      return;
    }

    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList =
    open && query.trim().length >= 2 && (loading || error !== null || results.length > 0);

  return (
    <div ref={rootRef} className={cn("relative space-y-2", className)}>
      <Label htmlFor={listId}>{label}</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={listId}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
          className="pl-9"
          onFocus={() => {
            setOpen(true);
            if (query.trim().length >= 2) {
              scheduleSearch(query);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                setOpen(false);
              }
            }, 150);
          }}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            scheduleSearch(value);
          }}
          onKeyDown={onKeyDown}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {showList && (
          <ul
            id={`${listId}-listbox`}
            role="listbox"
            className="absolute top-full z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg"
          >
            {error && (
              <li className="px-3 py-2 text-sm text-destructive">{error}</li>
            )}
            {!error && !loading && results.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No books found
              </li>
            )}
            {results.map((book, index) => (
              <li
                key={book.id}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  className={cn(
                    "flex w-full gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/70",
                    index === activeIndex && "bg-muted/70"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(book)}
                >
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted/50">
                    <Image
                      src={book.coverUrl ?? PLACEHOLDER_COVER}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium leading-snug">
                      {book.title}
                    </p>
                    <p className="line-clamp-1 text-muted-foreground">
                      {book.author}
                      {book.year ? ` · ${book.year}` : ""}
                      {book.genre ? ` · ${book.genre}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Open Library — select a book to autofill the add form
      </p>
    </div>
  );
}
