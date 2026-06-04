"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/search-input";
import { BOOK_STATUSES, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  genres: string[];
  authors: string[];
};

const selectClass =
  "h-9 w-full min-w-0 rounded-full border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 sm:w-auto sm:min-w-[9rem]";

export function LibraryFilters({ genres, authors }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/library?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <SearchInput placeholder="Search title, author, genre, review..." />

      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-2">
        <select
          className={selectClass}
          defaultValue={params.get("sort") ?? "created-desc"}
          onChange={(e) => update("sort", e.target.value)}
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          defaultValue={params.get("genre") ?? ""}
          onChange={(e) => update("genre", e.target.value)}
          aria-label="Filter by genre"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          defaultValue={params.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {BOOK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          className={cn(selectClass, "min-[420px]:col-span-2 sm:col-span-1")}
          defaultValue={params.get("rating") ?? ""}
          onChange={(e) => update("rating", e.target.value)}
          aria-label="Filter by rating"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={String(r)}>
              {r} stars
            </option>
          ))}
        </select>

        <select
          className={cn(selectClass, "sm:min-w-[10rem]")}
          defaultValue={params.get("author") ?? ""}
          onChange={(e) => update("author", e.target.value)}
          aria-label="Filter by author"
        >
          <option value="">All authors</option>
          {authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
