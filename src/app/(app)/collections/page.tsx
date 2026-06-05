import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { getCollections } from "@/lib/queries";
import { createCollection } from "@/lib/actions";
import { bookCountLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Koleksi
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1 sm:text-base">
          Kelompok buku pilihan dari perpustakaanmu
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Koleksi baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCollection} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Nama *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Buku terbaik 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <Button type="submit">Buat koleksi</Button>
          </form>
        </CardContent>
      </Card>

      {collections.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Belum ada koleksi. Buat satu untuk mengelompokkan bacaan favoritmu.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Link key={col.id} href={`/collections/${col.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <FolderOpen className="h-8 w-8 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-medium">{col.name}</h3>
                      {col.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {col.description}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-muted-foreground">
                        {bookCountLabel(col.books.length)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
