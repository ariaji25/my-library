import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  className,
}: {
  rating?: number | null;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!rating) return null;

  const iconClass = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            i < rating
              ? "fill-rose-400 text-rose-400"
              : "fill-transparent text-muted-foreground/35"
          )}
        />
      ))}
    </div>
  );
}
