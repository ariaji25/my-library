import { Skeleton } from "@/components/ui/skeleton";

export function CollectionDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-36" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-44 rounded-full" />
    </div>
  );
}
