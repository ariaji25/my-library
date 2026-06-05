import type { BookStatus, WishlistPriority } from "@/generated/prisma/client";

export const APP_NAME = "Perpustakaan Arinda";

export const BOOK_STATUSES: { value: BookStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "Belum dibaca" },
  { value: "READING", label: "Sedang dibaca" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "WISHLIST", label: "Daftar keinginan" },
];

export const WISHLIST_PRIORITIES: { value: WishlistPriority; label: string }[] =
  [
    { value: "HIGH", label: "Tinggi" },
    { value: "MEDIUM", label: "Sedang" },
    { value: "LOW", label: "Rendah" },
  ];

export const SORT_OPTIONS = [
  { value: "title-asc", label: "Judul A–Z" },
  { value: "title-desc", label: "Judul Z–A" },
  { value: "rating-desc", label: "Rating (tertinggi)" },
  { value: "rating-asc", label: "Rating (terendah)" },
  { value: "created-desc", label: "Terbaru ditambahkan" },
  { value: "created-asc", label: "Terlama ditambahkan" },
  { value: "year-desc", label: "Tahun terbit (terbaru)" },
  { value: "year-asc", label: "Tahun terbit (terlama)" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop";

const STATUS_LABEL_MAP = Object.fromEntries(
  BOOK_STATUSES.map((s) => [s.value, s.label])
) as Record<BookStatus, string>;

const PRIORITY_LABEL_MAP = Object.fromEntries(
  WISHLIST_PRIORITIES.map((p) => [p.value, p.label])
) as Record<WishlistPriority, string>;

export function statusLabel(status: BookStatus): string {
  return STATUS_LABEL_MAP[status] ?? status;
}

export function priorityLabel(priority: WishlistPriority): string {
  return PRIORITY_LABEL_MAP[priority] ?? priority;
}
