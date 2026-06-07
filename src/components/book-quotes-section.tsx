"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { addQuote, deleteQuote } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "@/hooks/use-action-toast";
import { useLocale } from "@/components/locale-provider";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";

type Quote = {
  id: string;
  content: string;
};

type Props = {
  bookId: string;
  quotes: Quote[];
};

function DeleteQuoteButton({
  quoteId,
  bookId,
}: {
  quoteId: string;
  bookId: string;
}) {
  const { messages: m } = useLocale();
  const action = deleteQuote.bind(null, quoteId, bookId);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  useActionToast(state, { successMessage: m.toast.removed });

  return (
    <form action={formAction}>
      <SubmitButton type="submit" variant="ghost" size="icon">
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </SubmitButton>
    </form>
  );
}

export function BookQuotesSection({ bookId, quotes }: Props) {
  const { messages: m } = useLocale();
  const addAction = addQuote.bind(null, bookId);

  return (
    <div className="space-y-4">
      {quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{m.bookForm.noQuotes}</p>
      ) : (
        <ul className="space-y-4">
          {quotes.map((quote) => (
            <li
              key={quote.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border/80 bg-muted/40 p-3 sm:gap-4 sm:p-4"
            >
              <p className="text-sm italic leading-relaxed">
                &ldquo;{quote.content}&rdquo;
              </p>
              <DeleteQuoteButton quoteId={quote.id} bookId={bookId} />
            </li>
          ))}
        </ul>
      )}
      <ActionForm
        action={addAction}
        successMessage={m.toast.added}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <Input
          name="content"
          placeholder={m.bookForm.addQuote}
          className="flex-1"
          required
        />
        <SubmitButton>{m.common.add}</SubmitButton>
      </ActionForm>
    </div>
  );
}
