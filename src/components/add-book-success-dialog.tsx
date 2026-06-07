"use client";

import Link from "next/link";
import { BookPlus, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  bookId: string | null;
  onAddAnother: () => void;
};

export function AddBookSuccessDialog({ open, bookId, onAddAnother }: Props) {
  const { messages: m } = useLocale();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onAddAnother()}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 sm:mx-0">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>{m.bookForm.saveSuccessTitle}</DialogTitle>
          <DialogDescription>{m.bookForm.saveSuccessPrompt}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-stretch">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onAddAnother}
          >
            <BookPlus className="h-4 w-4" />
            {m.bookForm.addAnotherBook}
          </Button>
          {bookId && (
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/books/${bookId}`}>{m.bookForm.viewBookDetail}</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
