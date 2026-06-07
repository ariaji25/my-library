"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  total: number;
};

function pageHref(searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const q = params.toString();
  return q ? `/library?${q}` : "/library";
}

export function LibraryPagination({ page, totalPages, total }: Props) {
  const { messages: m } = useLocale();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label={m.library.pagination}
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        {m.library.pageOf
          .replace("{page}", String(page))
          .replace("{totalPages}", String(totalPages))
          .replace("{total}", String(total))}
      </p>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="secondary"
          size="sm"
          disabled={!prev}
          className={cn(!prev && "pointer-events-none opacity-50")}
        >
          <Link href={prev ? pageHref(searchParams, prev) : "#"}>
            <ChevronLeft className="h-4 w-4" />
            {m.library.prevPage}
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="sm"
          disabled={!next}
          className={cn(!next && "pointer-events-none opacity-50")}
        >
          <Link href={next ? pageHref(searchParams, next) : "#"}>
            {m.library.nextPage}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
