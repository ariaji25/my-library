import { Skeleton } from "@/components/ui/skeleton";

export function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 sm:h-9" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-full" />
        ))}
        <Skeleton className="h-40 w-full rounded-2xl md:col-span-2" />
        <Skeleton className="h-10 w-full rounded-full md:col-span-2" />
      </div>
    </div>
  );
}
