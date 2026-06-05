import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createBook } from "@/lib/actions";
import { AddBookForm } from "@/components/add-book-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SearchParams = Promise<{
  title?: string;
  author?: string;
  genre?: string;
  year?: string;
  cover?: string;
}>;

export default async function NewBookPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const year = params.year ? Number(params.year) : undefined;

  const defaults = {
    title: params.title,
    author: params.author,
    genre: params.genre,
    publishedYear:
      year && Number.isFinite(year) && year >= 1000 && year <= 2100
        ? year
        : undefined,
    coverImage: params.cover,
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke perpustakaan
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Tambah buku</CardTitle>
        </CardHeader>
        <CardContent>
          <AddBookForm action={createBook} defaults={defaults} />
        </CardContent>
      </Card>
    </div>
  );
}
