"use client";

import { useActionState } from "react";
import { format } from "date-fns";
import { updateBook } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "@/hooks/use-action-toast";
import { BOOK_STATUS_VALUES } from "@/lib/constants";
import type { CoverStorageMode } from "@/lib/cover-storage";
import { statusLabel } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";
import { CoverImageFields } from "@/components/cover-image-fields";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BookFields = {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number | null;
  coverImage: string | null;
  status: (typeof BOOK_STATUS_VALUES)[number];
  totalPages: number | null;
  rating: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  review: string | null;
};

type Props = {
  book: BookFields;
  coverStorage: CoverStorageMode;
};

export function EditBookForm({ book, coverStorage }: Props) {
  const { messages: m } = useLocale();
  const boundUpdate = updateBook.bind(null, book.id);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    boundUpdate,
    null
  );

  useActionToast(state, { successMessage: m.bookForm.saveSuccess });

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="grid gap-4 md:grid-cols-2"
    >
      <div className="space-y-2">
        <Label htmlFor="title">{m.common.title}</Label>
        <Input id="title" name="title" defaultValue={book.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">{m.common.author}</Label>
        <Input id="author" name="author" defaultValue={book.author} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="genre">{m.common.genre}</Label>
        <Input id="genre" name="genre" defaultValue={book.genre} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="publishedYear">{m.common.yearPublished}</Label>
        <Input
          id="publishedYear"
          name="publishedYear"
          type="number"
          defaultValue={book.publishedYear ?? ""}
        />
      </div>
      <CoverImageFields
        currentCover={book.coverImage}
        coverStorage={coverStorage}
      />
      <div className="space-y-2">
        <Label htmlFor="status">{m.common.status}</Label>
        <select
          id="status"
          name="status"
          defaultValue={book.status}
          className="flex h-9 w-full rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        >
          {BOOK_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {statusLabel(value, m)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalPages">{m.bookForm.totalPages}</Label>
        <Input
          id="totalPages"
          name="totalPages"
          type="number"
          min={1}
          placeholder={m.bookForm.totalPagesHint}
          defaultValue={book.totalPages ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rating">{m.common.rating} (1–5)</Label>
        <Input
          id="rating"
          name="rating"
          type="number"
          min={1}
          max={5}
          defaultValue={book.rating ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startedAt">{m.bookForm.startedReading}</Label>
        <Input
          id="startedAt"
          name="startedAt"
          type="date"
          defaultValue={
            book.startedAt ? format(book.startedAt, "yyyy-MM-dd") : ""
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="completedAt">{m.bookForm.finishedReading}</Label>
        <Input
          id="completedAt"
          name="completedAt"
          type="date"
          defaultValue={
            book.completedAt ? format(book.completedAt, "yyyy-MM-dd") : ""
          }
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="review">
          {m.bookForm.review} ({m.common.markdownSupported})
        </Label>
        <Textarea
          id="review"
          name="review"
          rows={6}
          defaultValue={book.review ?? ""}
          placeholder={m.bookForm.reviewPlaceholder}
        />
      </div>
      <SubmitButton pendingLabel={m.common.saving}>
        {m.common.saveChanges}
      </SubmitButton>
    </form>
  );
}
