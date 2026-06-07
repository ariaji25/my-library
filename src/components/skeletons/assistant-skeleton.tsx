import { Skeleton } from "@/components/ui/skeleton";

export function AssistantSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="mt-1 h-4 w-5/6 max-w-xl" />
      </section>

      <div className="flex min-h-[min(70dvh,560px)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card">
        <div className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex justify-end">
            <Skeleton className="h-16 w-3/5 max-w-sm rounded-2xl rounded-br-sm" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-24 w-4/5 max-w-md rounded-2xl rounded-bl-sm" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-16 w-2/3 max-w-sm rounded-2xl rounded-bl-sm" />
          </div>
        </div>
        <div className="border-t border-border/80 p-4">
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
