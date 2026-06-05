import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getCollection, getBooks } from "@/lib/queries";
import {
  addBookToCollectionForm,
  deleteCollection,
  removeBookFromCollection,
} from "@/lib/actions";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { messages: m } = await getTranslations();
  const { id } = await params;
  const [collection, allBooks] = await Promise.all([
    getCollection(id),
    getBooks(),
  ]);

  if (!collection) notFound();

  const inCollection = new Set(collection.books.map((b) => b.bookId));
  const available = allBooks.filter((b) => !inCollection.has(b.id));

  return (
    <div className="space-y-8">
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {m.collections.all}
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-2 text-muted-foreground">{collection.description}</p>
        )}
      </div>

      {available.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{m.collections.addBook}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addBookToCollectionForm.bind(null, id)} className="flex flex-wrap gap-3">
              <select
                name="bookId"
                className="h-9 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 sm:min-w-[200px]"
                required
              >
                <option value="">{m.common.selectBook}</option>
                {available.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author}
                  </option>
                ))}
              </select>
              <Button type="submit">{m.common.add}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {collection.books.length === 0 ? (
        <p className="text-muted-foreground">{m.collections.emptyCollection}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collection.books.map(({ book }) => (
            <Card key={book.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={book.coverImage || PLACEHOLDER_COVER}
                    alt={book.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/books/${book.id}`}
                    className="font-medium hover:text-primary line-clamp-2"
                  >
                    {book.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <form
                    action={removeBookFromCollection.bind(null, id, book.id)}
                    className="mt-2"
                  >
                    <Button type="submit" variant="ghost" size="sm">
                      {m.common.remove}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <form action={deleteCollection.bind(null, id)}>
        <Button type="submit" variant="destructive">
          <Trash2 className="h-4 w-4" />
          {m.collections.delete}
        </Button>
      </form>
    </div>
  );
}
