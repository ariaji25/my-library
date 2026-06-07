import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBook } from "@/lib/queries";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { interpolate } from "@/lib/i18n";
import { getCoverStorageMode } from "@/lib/cover-storage";
import { getTranslations } from "@/lib/i18n/server";
import { formatAppDate } from "@/lib/format";
import { EditBookForm } from "@/components/edit-book-form";
import { BookStatusButtons } from "@/components/book-status-buttons";
import { BookQuotesSection } from "@/components/book-quotes-section";
import { DeleteBookButton } from "@/components/delete-book-button";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import { ReadingLogSection } from "@/components/reading-log-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { locale, messages: m } = await getTranslations();
  const coverStorage = getCoverStorageMode();
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const cover = book.coverImage || PLACEHOLDER_COVER;

  return (
    <div className="space-y-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {m.bookForm.backToLibrary}
      </Link>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[min(240px,100%)_1fr]">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[200px] overflow-hidden rounded-2xl border border-border/80 shadow-md shadow-primary/10 sm:max-w-[240px] lg:mx-0">
          <Image
            src={cover}
            alt={book.title}
            fill
            className="object-cover"
            sizes="240px"
            unoptimized
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{book.title}</h1>
            <p className="mt-1 text-base text-muted-foreground sm:mt-2 sm:text-lg">{book.author}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusBadge status={book.status} />
              <span className="text-sm text-muted-foreground">{book.genre}</span>
              {book.publishedYear && (
                <span className="text-sm text-muted-foreground">
                  · {book.publishedYear}
                </span>
              )}
              <StarRating rating={book.rating} size="md" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/assistant?book=${id}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary transition hover:bg-primary/15 sm:text-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {m.bookForm.askAi}
            </Link>
          </div>

          <BookStatusButtons bookId={id} currentStatus={book.status} />

          {(book.startedAt || book.completedAt) && (
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {book.startedAt && (
                <span>
                  {interpolate(m.bookForm.startedOn, {
                    date: formatAppDate(book.startedAt, locale),
                  })}
                </span>
              )}
              {book.completedAt && (
                <span>
                  {interpolate(m.bookForm.finishedOn, {
                    date: formatAppDate(book.completedAt, locale),
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{m.bookForm.editDetails}</CardTitle>
        </CardHeader>
        <CardContent>
          <EditBookForm book={book} coverStorage={coverStorage} />
        </CardContent>
      </Card>

      <ReadingLogSection
        bookId={book.id}
        title={book.title}
        author={book.author}
        totalPages={book.totalPages}
        logs={book.readingLogs}
      />

      {book.review && (
        <Card>
          <CardHeader>
            <CardTitle>{m.bookForm.reviewPreview}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{book.review}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{m.bookForm.favoriteQuotes}</CardTitle>
        </CardHeader>
        <CardContent>
          <BookQuotesSection bookId={id} quotes={book.quotes} />
        </CardContent>
      </Card>

      <DeleteBookButton bookId={id} />
    </div>
  );
}
