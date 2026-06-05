import type { BookStatus, WishlistPriority } from "@/generated/prisma/client";

export const BOOK_STATUS_VALUES: BookStatus[] = [
  "NOT_STARTED",
  "READING",
  "COMPLETED",
  "WISHLIST",
];

export const WISHLIST_PRIORITY_VALUES: WishlistPriority[] = [
  "HIGH",
  "MEDIUM",
  "LOW",
];

export const SORT_OPTIONS = [
  "title-asc",
  "title-desc",
  "rating-desc",
  "rating-asc",
  "created-desc",
  "created-asc",
  "year-desc",
  "year-asc",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop";
