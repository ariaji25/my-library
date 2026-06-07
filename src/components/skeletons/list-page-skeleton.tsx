import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  /** Number of list cards below the add form */
  cards?: number;
};

export function ListPageSkeleton({ cards = 4 }: Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 sm:h-9" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <Skeleton className="h-56 w-full rounded-2xl sm:h-48" />

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
