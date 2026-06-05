import { Trash2 } from "lucide-react";
import { getWishlistItems } from "@/lib/queries";
import { createWishlistItem, deleteWishlistItem } from "@/lib/actions";
import { WISHLIST_PRIORITIES, priorityLabel } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const priorityVariant = {
  HIGH: "warning" as const,
  MEDIUM: "default" as const,
  LOW: "secondary" as const,
};

export default async function WishlistPage() {
  const items = await getWishlistItems();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Daftar keinginan
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1 sm:text-base">
          Buku yang ingin kamu beli atau baca berikutnya
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah ke daftar keinginan</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createWishlistItem} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Penulis *</Label>
              <Input id="author" name="author" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioritas</Label>
              <select
                id="priority"
                name="priority"
                className="flex h-9 w-full rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                defaultValue="MEDIUM"
              >
                {WISHLIST_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
            <Button type="submit">Tambah buku</Button>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Daftar keinginanmu masih kosong.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <Badge variant={priorityVariant[item.priority]}>
                      {priorityLabel(item.priority)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.author}
                  </p>
                  {item.notes && (
                    <p className="mt-3 text-sm leading-relaxed">{item.notes}</p>
                  )}
                </div>
                <form action={deleteWishlistItem.bind(null, item.id)}>
                  <Button type="submit" variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
