"use client";

import { useRef, useState } from "react";
import type { BookSearchHit } from "@/lib/book-search-types";
import { attachCoverToForm } from "@/lib/attach-cover-to-form";
import { BOOK_STATUS_VALUES } from "@/lib/constants";
import type { CoverStorageMode } from "@/lib/cover-storage";
import { statusLabel } from "@/lib/i18n";
import { BookCoverScan } from "@/components/book-cover-scan";
import { BookSearchAutocomplete } from "@/components/book-search-autocomplete";
import { CoverImageFields } from "@/components/cover-image-fields";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AddBookFormDefaults = {
  title?: string;
  author?: string;
  genre?: string;
  publishedYear?: number;
  coverImage?: string;
};

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaults?: AddBookFormDefaults;
  coverScanConfigured?: boolean;
  coverStorage?: CoverStorageMode;
};

export function AddBookForm({
  action,
  defaults,
  coverScanConfigured,
  coverStorage = "disk",
}: Props) {
  const { messages: m } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [coverPreview, setCoverPreview] = useState(defaults?.coverImage);
  const [coverKey, setCoverKey] = useState(
    defaults?.coverImage ? "initial" : "empty"
  );
  const [coverError, setCoverError] = useState<string | null>(null);

  async function applyCoverFile(file: File) {
    const form = formRef.current;
    if (!form) return;

    setCoverError(null);
    const result = await attachCoverToForm(form, file, coverStorage, {
      messages: {
        coverEmpty: m.errors.coverEmpty,
        coverSize: m.errors.coverSize,
        coverType: m.errors.coverType,
        coverInlineTooLarge: m.errors.coverInlineTooLarge,
      },
    });

    if (result.error) {
      setCoverError(result.error);
      return;
    }

    setCoverPreview(result.preview);
  }

  function applyBookHit(book: BookSearchHit, coverFile?: File) {
    const form = formRef.current;
    if (!form) return;

    const set = (name: string, value: string) => {
      const el = form.elements.namedItem(name);
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        el.value = value;
      }
    };

    set("title", book.title);
    set("author", book.author);
    set("genre", book.genre);
    if (book.year) set("publishedYear", String(book.year));

    if (coverFile) {
      void applyCoverFile(coverFile);
    } else if (book.coverUrl) {
      set("coverImage", book.coverUrl);
      setCoverPreview(book.coverUrl);
      setCoverKey(book.id);
    }
  }

  return (
    <div className="space-y-6">
      <BookCoverScan
        coverScanConfigured={coverScanConfigured}
        onCoverFile={(file) => void applyCoverFile(file)}
        onScan={(book, file) => applyBookHit(book, file)}
      />

      <BookSearchAutocomplete
        label={m.bookForm.lookup}
        placeholder={m.bookForm.searchAutofill}
        onSelect={(book) => applyBookHit(book)}
      />

      {coverError && (
        <p className="text-sm text-destructive">{coverError}</p>
      )}

      <form
        ref={formRef}
        action={action}
        encType="multipart/form-data"
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="title">{m.common.title} {m.common.required}</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={defaults?.title}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">{m.common.author} {m.common.required}</Label>
          <Input
            id="author"
            name="author"
            required
            defaultValue={defaults?.author}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">{m.common.genre} {m.common.required}</Label>
          <Input
            id="genre"
            name="genre"
            required
            placeholder={m.bookForm.fictionPlaceholder}
            defaultValue={defaults?.genre}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedYear">{m.common.yearPublished}</Label>
          <Input
            id="publishedYear"
            name="publishedYear"
            type="number"
            min={1000}
            max={2100}
            defaultValue={defaults?.publishedYear ?? ""}
          />
        </div>
        <CoverImageFields
          key={coverKey}
          currentCover={coverPreview}
          coverStorage={coverStorage}
        />
        <div className="space-y-2">
          <Label htmlFor="status">{m.common.status}</Label>
          <select
            id="status"
            name="status"
            className="flex h-9 w-full rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            defaultValue="NOT_STARTED"
          >
            {BOOK_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {statusLabel(value, m)}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">
          {m.bookForm.saveBook}
        </Button>
      </form>
    </div>
  );
}
