import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-8 md:p-10">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-3 h-9 w-64 max-w-full sm:h-10" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-lg" />
        <Skeleton className="mt-6 h-9 w-36 rounded-full" />
      </section>

      <Skeleton className="h-48 w-full rounded-2xl sm:h-56" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl sm:h-28" />
        ))}
      </div>

      <Skeleton className="h-72 w-full rounded-2xl" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>

      <Skeleton className="h-52 w-full rounded-2xl" />
    </div>
  );
}
