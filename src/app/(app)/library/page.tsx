import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import type { BookStatus } from "@/generated/prisma/client";
import { getBooks, getDashboardStats } from "@/lib/queries";
import type { SortOption } from "@/lib/constants";
import { bookCountLabel } from "@/lib/format";
import { BookCard } from "@/components/book-card";
import { LibraryBookSearch } from "@/components/library-book-search";
import { LibraryFilters } from "@/components/library-filters";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{
  q?: string;
  genre?: string;
  status?: string;
  rating?: string;
  author?: string;
  sort?: string;
}>;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { genres, authors } = await getDashboardStats();

  const books = await getBooks({
    q: params.q,
    genre: params.genre,
    status: params.status as BookStatus | undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    author: params.author,
    sort: (params.sort as SortOption) || "created-desc",
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            Perpustakaan
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1 sm:text-base">
            {bookCountLabel(books.length)} di koleksimu
          </p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/library/new">
            <Plus className="h-4 w-4" />
            Tambah buku
          </Link>
        </Button>
      </div>

      <LibraryBookSearch />

      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
        <LibraryFilters genres={genres} authors={authors} />
      </Suspense>

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">
            Tidak ada buku yang cocok dengan filter.
          </p>
          <Button asChild className="mt-4">
            <Link href="/library/new">Tambah buku pertamamu</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 min-[480px]:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
