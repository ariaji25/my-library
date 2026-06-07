"use client";

import { Trash2 } from "lucide-react";
import { deleteBook } from "@/lib/actions";
import { useLocale } from "@/components/locale-provider";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  bookId: string;
};

export function DeleteBookButton({ bookId }: Props) {
  const { messages: m } = useLocale();
  const action = deleteBook.bind(null, bookId);

  return (
    <ActionForm action={action} successMessage={m.toast.deleted}>
      <SubmitButton variant="destructive">
        <Trash2 className="h-4 w-4" />
        {m.bookForm.deleteBook}
      </SubmitButton>
    </ActionForm>
  );
}
