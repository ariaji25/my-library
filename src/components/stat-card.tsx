import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary sm:h-10 sm:w-10">
          <Icon className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
            {value}
          </p>
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
