"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { FolderPlus, ListChecks, Loader2, X } from "lucide-react";
import type { Book } from "@/generated/prisma/client";
import {
  addBooksToCollection,
  createCollectionWithBooks,
} from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { interpolate } from "@/lib/i18n";
import {
  clearSelectedBookIds,
  loadSelectedBookIds,
  saveSelectedBookIds,
} from "@/lib/library-selection-storage";
import { useActionToast } from "@/hooks/use-action-toast";
import { useLocale } from "@/components/locale-provider";
import { BookCard } from "@/components/book-card";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CollectionOption = {
  id: string;
  name: string;
};

type Props = {
  books: Book[];
  collections: CollectionOption[];
  children?: React.ReactNode;
};

type Panel = "none" | "create" | "add";

function SelectedBookIds({ ids }: { ids: Set<string> }) {
  return (
    <>
      {[...ids].map((id) => (
        <input key={id} type="hidden" name="bookIds" value={id} />
      ))}
    </>
  );
}

export function LibraryBookGrid({ books, collections, children }: Props) {
  const { messages: m } = useLocale();
  const [selectMode, setSelectMode] = useState(false);
  const [panel, setPanel] = useState<Panel>("none");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [createState, createAction, createPending] = useActionState<
    ActionResult | null,
    FormData
  >(createCollectionWithBooks, null);
  const [addState, addAction, addPending] = useActionState<
    ActionResult | null,
    FormData
  >(addBooksToCollection, null);

  const getCreateSuccessMessage = useCallback(
    (result: Extract<ActionResult, { ok: true }>) =>
      result.addedCount
        ? interpolate(m.library.collectionCreatedWithBooks, {
            count: result.addedCount,
          })
        : m.toast.added,
    [m]
  );

  const getAddSuccessMessage = useCallback(
    (result: Extract<ActionResult, { ok: true }>) =>
      result.addedCount
        ? interpolate(m.collections.booksAdded, { count: result.addedCount })
        : m.toast.added,
    [m]
  );

  const onCreateSuccess = useCallback(() => {
    clearSelectedBookIds();
    setSelected(new Set());
    setSelectMode(false);
    setPanel("none");
  }, []);

  const onAddSuccess = useCallback(() => {
    clearSelectedBookIds();
    setSelected(new Set());
    setPanel("none");
  }, []);

  useEffect(() => {
    setSelected(loadSelectedBookIds());
  }, []);

  useActionToast(createState, {
    getSuccessMessage: getCreateSuccessMessage,
    onSuccess: onCreateSuccess,
  });

  useActionToast(addState, {
    getSuccessMessage: getAddSuccessMessage,
    onSuccess: onAddSuccess,
  });

  function persistSelection(next: Set<string>) {
    setSelected(next);
    saveSelectedBookIds(next);
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persistSelection(next);
  }

  function selectAllOnPage() {
    const next = new Set(selected);
    for (const book of books) next.add(book.id);
    persistSelection(next);
  }

  function clearSelection() {
    persistSelection(new Set());
  }

  function exitSelectMode() {
    setSelectMode(false);
    setPanel("none");
  }

  const allOnPageSelected =
    books.length > 0 && books.every((book) => selected.has(book.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!selectMode ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSelectMode(true)}
          >
            <ListChecks className="h-4 w-4" />
            {m.library.selectForCollection}
          </Button>
        ) : (
          <>
            <Button type="button" variant="default" size="sm" onClick={exitSelectMode}>
              <X className="h-4 w-4" />
              {m.library.exitSelection}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={selectAllOnPage}
              disabled={books.length === 0 || allOnPageSelected}
            >
              {m.collections.selectAll}
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
            <span className="text-sm text-muted-foreground tabular-nums">
              {interpolate(m.collections.selectedCount, { count: selected.size })}
            </span>
          </>
        )}
      </div>

      {selectMode && (
        <p className="text-sm text-muted-foreground">{m.library.selectionHint}</p>
      )}

      {selectMode && selected.size > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={panel === "create" ? "default" : "secondary"}
            onClick={() => setPanel(panel === "create" ? "none" : "create")}
          >
            <FolderPlus className="h-4 w-4" />
            {m.library.createCollectionFromSelected}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={panel === "add" ? "default" : "secondary"}
            onClick={() => setPanel(panel === "add" ? "none" : "add")}
          >
            {m.library.addToExistingCollection}
          </Button>
        </div>
      )}

      {selectMode && panel === "create" && selected.size > 0 && (
        <Card className={cn("relative", createPending && "pointer-events-none")}>
          {createPending && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[1px]"
              aria-live="polite"
              aria-busy
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-base">
              {m.library.createCollectionTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAction} className="max-w-md space-y-4">
              <SelectedBookIds ids={selected} />
              <fieldset disabled={createPending} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collection-name">
                    {m.common.name} {m.common.required}
                  </Label>
                  <Input
                    id="collection-name"
                    name="name"
                    required
                    placeholder={m.collections.namePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collection-description">
                    {m.common.description}
                  </Label>
                  <Textarea
                    id="collection-description"
                    name="description"
                    rows={2}
                  />
                </div>
                <SubmitButton pendingLabel={m.common.saving}>
                  {m.collections.create} ({selected.size})
                </SubmitButton>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      )}

      {selectMode && panel === "add" && selected.size > 0 && (
        <Card className={cn("relative", addPending && "pointer-events-none")}>
          {addPending && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[1px]"
              aria-live="polite"
              aria-busy
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-base">
              {m.library.addToCollectionTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {collections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {m.library.noCollectionsYet}
              </p>
            ) : (
              <form action={addAction} className="flex flex-wrap gap-3">
                <SelectedBookIds ids={selected} />
                <fieldset
                  disabled={addPending}
                  className="flex min-w-0 flex-1 flex-wrap gap-3"
                >
                  <select
                    name="collectionId"
                    required
                    className="h-9 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 sm:min-w-[220px]"
                    defaultValue=""
                  >
                    <option value="">{m.collections.selectCollection}</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <SubmitButton pendingLabel={m.common.saving}>
                    {m.collections.addSelected} ({selected.size})
                  </SubmitButton>
                </fieldset>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 min-[480px]:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {books.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            priority={index < 6}
            selectable={selectMode}
            selected={selected.has(book.id)}
            onToggleSelect={() => toggleSelect(book.id)}
          />
        ))}
      </div>

      {children}
    </div>
  );
}
