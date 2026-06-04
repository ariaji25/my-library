"use client";

import { useRouter } from "next/navigation";
import { BookSearchAutocomplete } from "@/components/book-search-autocomplete";
import type { BookSearchHit } from "@/lib/book-search-types";

export function LibraryBookSearch() {
  const router = useRouter();

  function onSelect(book: BookSearchHit) {
    const params = new URLSearchParams();
    params.set("title", book.title);
    params.set("author", book.author);
    params.set("genre", book.genre);
    if (book.year) params.set("year", String(book.year));
    if (book.coverUrl) params.set("cover", book.coverUrl);
    router.push(`/library/new?${params.toString()}`);
  }

  return (
    <div className="overflow-visible rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <BookSearchAutocomplete
        label="Find & add a book (Open Library)"
        placeholder="Search by title or author…"
        onSelect={onSelect}
      />
    </div>
  );
}
