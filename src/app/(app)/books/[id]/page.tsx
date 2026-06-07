import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBook } from "@/lib/queries";
import {
  addQuote,
  deleteBook,
  deleteQuote,
  updateBook,
  updateBookStatus,
} from "@/lib/actions";
import { BOOK_STATUS_VALUES, PLACEHOLDER_COVER } from "@/lib/constants";
import { interpolate, statusLabel } from "@/lib/i18n";
import { getCoverStorageMode } from "@/lib/cover-storage";
import { getTranslations } from "@/lib/i18n/server";
import { formatAppDate } from "@/lib/format";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CoverImageFields } from "@/components/cover-image-fields";
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
  const updateWithId = updateBook.bind(null, id);

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

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {BOOK_STATUS_VALUES.map((value) => (
              <form key={value} action={updateBookStatus.bind(null, id, value)}>
                <Button
                  type="submit"
                  variant={book.status === value ? "default" : "secondary"}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {statusLabel(value, m)}
                </Button>
              </form>
            ))}
          </div>

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
          <form
            action={updateWithId}
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
                  book.startedAt
                    ? format(book.startedAt, "yyyy-MM-dd")
                    : ""
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
                  book.completedAt
                    ? format(book.completedAt, "yyyy-MM-dd")
                    : ""
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
            <Button type="submit">{m.common.saveChanges}</Button>
          </form>
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
        <CardContent className="space-y-4">
          {book.quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{m.bookForm.noQuotes}</p>
          ) : (
            <ul className="space-y-4">
              {book.quotes.map((quote) => (
                <li
                  key={quote.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/80 bg-muted/40 p-3 sm:gap-4 sm:p-4"
                >
                  <p className="text-sm italic leading-relaxed">
                    &ldquo;{quote.content}&rdquo;
                  </p>
                  <form action={deleteQuote.bind(null, quote.id, id)}>
                    <Button type="submit" variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={addQuote.bind(null, id)} className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="content"
              placeholder={m.bookForm.addQuote}
              className="flex-1"
            />
            <Button type="submit">{m.common.add}</Button>
          </form>
        </CardContent>
      </Card>

      <form action={deleteBook.bind(null, id)}>
        <Button type="submit" variant="destructive">
          <Trash2 className="h-4 w-4" />
          {m.bookForm.deleteBook}
        </Button>
      </form>
    </div>
  );
}
