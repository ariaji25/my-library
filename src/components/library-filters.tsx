"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/search-input";
import { BOOK_STATUS_VALUES, SORT_OPTIONS } from "@/lib/constants";
import { sortLabel, statusLabel } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";
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
  const { messages: m } = useLocale();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/library?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {m.library.filterCollection}
        </p>
        <SearchInput placeholder={m.library.searchBooks} />
      </div>

      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-2">
        <select
          className={selectClass}
          defaultValue={params.get("sort") ?? "created-desc"}
          onChange={(e) => update("sort", e.target.value)}
          aria-label={m.common.sort}
        >
          {SORT_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {sortLabel(value, m)}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          defaultValue={params.get("genre") ?? ""}
          onChange={(e) => update("genre", e.target.value)}
          aria-label={m.common.filterGenre}
        >
          <option value="">{m.common.allGenres}</option>
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
          aria-label={m.common.filterStatus}
        >
          <option value="">{m.common.allStatuses}</option>
          {BOOK_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {statusLabel(value, m)}
            </option>
          ))}
        </select>

        <select
          className={cn(selectClass, "min-[420px]:col-span-2 sm:col-span-1")}
          defaultValue={params.get("rating") ?? ""}
          onChange={(e) => update("rating", e.target.value)}
          aria-label={m.common.filterRating}
        >
          <option value="">{m.common.allRatings}</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={String(r)}>
              {r} {m.common.stars}
            </option>
          ))}
        </select>

        <select
          className={cn(selectClass, "sm:min-w-[10rem]")}
          defaultValue={params.get("author") ?? ""}
          onChange={(e) => update("author", e.target.value)}
          aria-label={m.common.filterAuthor}
        >
          <option value="">{m.common.allAuthors}</option>
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
