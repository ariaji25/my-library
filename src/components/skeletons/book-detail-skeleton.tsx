import { Skeleton } from "@/components/ui/skeleton";

export function BookDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-32" />

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[min(240px,100%)_1fr]">
        <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[200px] rounded-2xl sm:max-w-[240px] lg:mx-0" />
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-5 w-48" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="h-80 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  );
}
