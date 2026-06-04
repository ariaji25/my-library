import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createBook } from "@/lib/actions";
import { BOOK_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add a book</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBook} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" name="author" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Input id="genre" name="genre" required placeholder="Fiction" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishedYear">Year published</Label>
              <Input
                id="publishedYear"
                name="publishedYear"
                type="number"
                min={1000}
                max={2100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover image URL</Label>
              <Input id="coverImage" name="coverImage" type="url" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="flex h-9 w-full rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                defaultValue="NOT_STARTED"
              >
                {BOOK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              Save book
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
