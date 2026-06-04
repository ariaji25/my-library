import type { BookStatus, WishlistPriority } from "@/generated/prisma/client";

export const APP_NAME = "Arinda's Library";

export const BOOK_STATUSES: { value: BookStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "READING", label: "Reading" },
  { value: "COMPLETED", label: "Completed" },
  { value: "WISHLIST", label: "Wishlist" },
];

export const WISHLIST_PRIORITIES: { value: WishlistPriority; label: string }[] = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export const SORT_OPTIONS = [
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "rating-desc", label: "Rating (highest)" },
  { value: "rating-asc", label: "Rating (lowest)" },
  { value: "created-desc", label: "Date added (newest)" },
  { value: "created-asc", label: "Date added (oldest)" },
  { value: "year-desc", label: "Year published (newest)" },
  { value: "year-asc", label: "Year published (oldest)" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop";
