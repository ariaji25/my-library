"use client";

import { addBookToCollectionForm } from "@/lib/actions";
import { useLocale } from "@/components/locale-provider";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";

type BookOption = {
  id: string;
  title: string;
  author: string;
};

type Props = {
  collectionId: string;
  books: BookOption[];
};

export function AddBookToCollectionForm({ collectionId, books }: Props) {
  const { messages: m } = useLocale();
  const action = addBookToCollectionForm.bind(null, collectionId);

  return (
    <ActionForm
      action={action}
      successMessage={m.toast.added}
      className="flex flex-wrap gap-3"
    >
      <select
        name="bookId"
        className="h-9 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 sm:min-w-[200px]"
        required
      >
        <option value="">{m.common.selectBook}</option>
        {books.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title} — {b.author}
          </option>
        ))}
      </select>
      <SubmitButton>{m.common.add}</SubmitButton>
    </ActionForm>
  );
}
