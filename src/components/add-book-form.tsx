"use client";

import { useRef, useState } from "react";
import type { BookSearchHit } from "@/lib/book-search-types";
import { BOOK_STATUSES } from "@/lib/constants";
import { BookSearchAutocomplete } from "@/components/book-search-autocomplete";
import { CoverImageFields } from "@/components/cover-image-fields";
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
};

export function AddBookForm({ action, defaults }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [coverPreview, setCoverPreview] = useState(defaults?.coverImage);
  const [coverKey, setCoverKey] = useState(
    defaults?.coverImage ? "initial" : "empty"
  );

  function applySearchHit(book: BookSearchHit) {
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
    if (book.coverUrl) {
      set("coverImage", book.coverUrl);
      setCoverPreview(book.coverUrl);
      setCoverKey(book.id);
    }
  }

  return (
    <div className="space-y-6">
      <BookSearchAutocomplete
        label="Look up a book"
        placeholder="Search title or author to autofill…"
        onSelect={applySearchHit}
      />

      <form
        ref={formRef}
        action={action}
        encType="multipart/form-data"
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={defaults?.title}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            name="author"
            required
            defaultValue={defaults?.author}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">Genre *</Label>
          <Input
            id="genre"
            name="genre"
            required
            placeholder="Fiction"
            defaultValue={defaults?.genre}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedYear">Year published</Label>
          <Input
            id="publishedYear"
            name="publishedYear"
            type="number"
            min={1000}
            max={2100}
            defaultValue={defaults?.publishedYear ?? ""}
          />
        </div>
        <CoverImageFields key={coverKey} currentCover={coverPreview} />
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            className="flex h-9 w-full rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            defaultValue="NOT_STARTED"
          >
            {BOOK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">
          Save book
        </Button>
      </form>
    </div>
  );
}
