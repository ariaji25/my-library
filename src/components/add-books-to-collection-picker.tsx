"use client";

import { useActionState, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { addBookToCollectionForm } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { interpolate } from "@/lib/i18n";
import { useActionToast } from "@/hooks/use-action-toast";
import { useLocale } from "@/components/locale-provider";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type BookOption = {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
};

type Props = {
  collectionId: string;
  books: BookOption[];
};

export function AddBooksToCollectionPicker({ collectionId, books }: Props) {
  const { messages: m } = useLocale();
  const action = addBookToCollectionForm.bind(null, collectionId);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const getSuccessMessage = useCallback(
    (result: Extract<ActionResult, { ok: true }>) =>
      result.addedCount
        ? interpolate(m.collections.booksAdded, { count: result.addedCount })
        : m.toast.added,
    [m]
  );

  const onSuccess = useCallback(() => setSelected(new Set()), []);

  useActionToast(state, {
    getSuccessMessage,
    onSuccess,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    );
  }, [books, query]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((b) => selected.has(b.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const book of filtered) next.add(book.id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  if (books.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {m.collections.noAvailableBooks}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className={cn("relative space-y-4", pending && "pointer-events-none")}
    >
      {pending && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <p className="text-sm text-muted-foreground">{m.collections.addBookHint}</p>

      <fieldset disabled={pending} className="space-y-4">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={m.collections.searchAvailable}
        aria-label={m.collections.searchAvailable}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={selectAllFiltered}
          disabled={filtered.length === 0 || allFilteredSelected}
        >
          {m.collections.selectAll}
          {filtered.length < books.length && query.trim()
            ? ` (${filtered.length})`
            : null}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          disabled={selected.size === 0}
        >
          {m.collections.clearSelection}
        </Button>
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">
          {interpolate(m.collections.selectedCount, { count: selected.size })}
        </span>
      </div>

      <ul
        className="max-h-80 space-y-1 overflow-y-auto rounded-2xl border border-border/80 p-2"
        role="listbox"
        aria-multiselectable
        aria-label={m.collections.addBook}
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {m.search.notFound}
          </li>
        ) : (
          filtered.map((book) => {
            const checked = selected.has(book.id);
            return (
              <li key={book.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50",
                    checked && "bg-primary/5"
                  )}
                >
                  <input
                    type="checkbox"
                    name="bookIds"
                    value={book.id}
                    checked={checked}
                    onChange={() => toggle(book.id)}
                    className="h-4 w-4 shrink-0 rounded border-border accent-primary"
                  />
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted/40">
                    <Image
                      src={book.coverImage || PLACEHOLDER_COVER}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-2 text-sm font-medium leading-snug">
                      {book.title}
                    </span>
                    <span className="block line-clamp-1 text-xs text-muted-foreground">
                      {book.author}
                    </span>
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>

      <SubmitButton
        disabled={selected.size === 0}
        pendingLabel={m.common.saving}
      >
        {m.collections.addSelected}
        {selected.size > 0 ? ` (${selected.size})` : null}
      </SubmitButton>
      </fieldset>
    </form>
  );
}
