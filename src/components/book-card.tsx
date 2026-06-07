import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Book } from "@/generated/prisma/client";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type Props = {
  book: Book;
  priority?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
};

function BookCardContent({
  book,
  priority,
  selectable,
  selected,
}: Omit<Props, "onToggleSelect">) {
  const cover = book.coverImage || PLACEHOLDER_COVER;

  return (
    <>
      <div className="relative aspect-[2/3] overflow-hidden bg-muted/50">
        <Image
          src={cover}
          alt={book.title}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            !selectable && "group-hover:scale-[1.03]"
          )}
          sizes="(max-width: 380px) 50vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          loading={priority ? undefined : "lazy"}
          priority={priority}
          unoptimized
        />
        {selectable && (
          <span
            className={cn(
              "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-card/90 shadow-sm transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/80 text-transparent"
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <h3
          className={cn(
            "line-clamp-2 text-sm font-semibold leading-snug sm:text-[0.9rem]",
            !selectable && "group-hover:text-primary"
          )}
        >
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
    </>
  );
}

export function BookCard({
  book,
  priority = false,
  selectable = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const className = cn(
    "group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm shadow-primary/5 transition-all",
    selectable
      ? cn(
          "cursor-pointer hover:border-primary/40",
          selected && "border-primary ring-2 ring-primary/20"
        )
      : "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onToggleSelect}
        aria-pressed={selected}
        className={cn(className, "text-left")}
      >
        <BookCardContent
          book={book}
          priority={priority}
          selectable={selectable}
          selected={selected}
        />
      </button>
    );
  }

  return (
    <Link href={`/books/${book.id}`} className={className}>
      <BookCardContent book={book} priority={priority} />
    </Link>
  );
}
