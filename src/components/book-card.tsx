import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/generated/prisma/client";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";

export function BookCard({
  book,
  priority = false,
}: {
  book: Book;
  priority?: boolean;
}) {
  const cover = book.coverImage || PLACEHOLDER_COVER;

  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm shadow-primary/5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted/50">
        <Image
          src={cover}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 380px) 50vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          loading={priority ? undefined : "lazy"}
          priority={priority}
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary sm:text-[0.9rem]">
          {book.title}
        </h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {book.author}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-1">
          <span className="text-[0.65rem] font-medium text-muted-foreground sm:text-xs">
            {book.genre}
          </span>
          <StarRating rating={book.rating} />
        </div>
        <StatusBadge status={book.status} />
      </div>
    </Link>
  );
}
