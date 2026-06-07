import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import type { BookStatus } from "@/generated/prisma/client";
import { getBooksPaginated, getDashboardStats } from "@/lib/queries";
import type { SortOption } from "@/lib/constants";
import { bookCountInCollection } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import { BookCard } from "@/components/book-card";
import { LibraryBookSearch } from "@/components/library-book-search";
import { LibraryFilters } from "@/components/library-filters";
import { LibraryPagination } from "@/components/library-pagination";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{
  q?: string;
  genre?: string;
  status?: string;
  rating?: string;
  author?: string;
  sort?: string;
  page?: string;
}>;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { messages: m } = await getTranslations();
  const params = await searchParams;
  const { genres, authors } = await getDashboardStats();

  const page = params.page ? Math.max(1, Number(params.page) || 1) : 1;
  const { books, total, totalPages } = await getBooksPaginated({
    q: params.q,
    genre: params.genre,
    status: params.status as BookStatus | undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    author: params.author,
    sort: (params.sort as SortOption) || "created-desc",
    page,
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            {m.library.title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1 sm:text-base">
            {bookCountInCollection(total, m)}
          </p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/library/new">
            <Plus className="h-4 w-4" />
            {m.library.addBook}
          </Link>
        </Button>
      </div>

      <LibraryBookSearch />

      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
        <LibraryFilters genres={genres} authors={authors} />
      </Suspense>

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">{m.library.noMatch}</p>
          <Button asChild className="mt-4">
            <Link href="/library/new">{m.library.addFirst}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 min-[480px]:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} priority={index < 6} />
            ))}
          </div>
          <Suspense fallback={null}>
            <LibraryPagination page={page} totalPages={totalPages} total={total} />
          </Suspense>
        </>
      )}
    </div>
  );
}
