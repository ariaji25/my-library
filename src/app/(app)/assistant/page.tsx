import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AiLibrarianChat } from "@/components/ai-librarian-chat";
import { isAiConfigured } from "@/lib/ai-librarian";
import { getTranslations } from "@/lib/i18n/server";
import { getBook } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const { messages: m } = await getTranslations();
  const configured = isAiConfigured();
  const params = await searchParams;
  const bookId = params.book?.trim();

  let initialBook: { id: string; title: string; author: string } | undefined;
  if (bookId) {
    const book = await getBook(bookId);
    if (book) {
      initialBook = {
        id: book.id,
        title: book.title,
        author: book.author,
      };
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
          {m.assistant.badge}
        </p>
        <h1 className="font-heading mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <Sparkles className="h-7 w-7 text-primary" />
          {m.assistant.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {m.assistant.subtitle}
        </p>
        {initialBook && (
          <p className="mt-2 text-sm text-foreground">
            {m.assistant.discussing}{" "}
            <Link
              href={`/books/${initialBook.id}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {initialBook.title}
            </Link>{" "}
            {m.assistant.by} {initialBook.author}
          </p>
        )}
      </section>

      <AiLibrarianChat configured={configured} initialBook={initialBook} />
    </div>
  );
}
