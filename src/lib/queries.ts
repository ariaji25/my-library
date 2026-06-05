import type { BookStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SortOption } from "@/lib/constants";
import {
  buildWeeklyProgress,
  getCurrentWeekProgress,
} from "@/lib/monthly-progress";
import { getLocale } from "@/lib/i18n/server";
import { serializeReadingActivity } from "@/lib/reading-activity";
import { subMonths } from "date-fns";

export type BookFilters = {
  q?: string;
  genre?: string;
  status?: BookStatus;
  rating?: number;
  author?: string;
  sort?: SortOption;
};

function buildOrderBy(sort: SortOption = "created-desc"): Prisma.BookOrderByWithRelationInput {
  switch (sort) {
    case "title-asc":
      return { title: "asc" };
    case "title-desc":
      return { title: "desc" };
    case "rating-desc":
      return { rating: "desc" };
    case "rating-asc":
      return { rating: "asc" };
    case "created-asc":
      return { createdAt: "asc" };
    case "year-desc":
      return { publishedYear: "desc" };
    case "year-asc":
      return { publishedYear: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getBooks(filters: BookFilters = {}) {
  const { q, genre, status, rating, author, sort } = filters;

  const where: Prisma.BookWhereInput = {
    ...(genre && { genre }),
    ...(status && { status }),
    ...(rating != null && { rating }),
    ...(author && { author: { contains: author } }),
    ...(q && {
      OR: [
        { title: { contains: q } },
        { author: { contains: q } },
        { genre: { contains: q } },
        { review: { contains: q } },
      ],
    }),
  };

  return prisma.book.findMany({
    where,
    orderBy: buildOrderBy(sort),
    include: { quotes: true },
  });
}

export async function getBook(id: string) {
  return prisma.book.findUnique({
    where: { id },
    include: {
      quotes: { orderBy: { id: "asc" } },
      readingLogs: { orderBy: { date: "desc" } },
      collections: true,
    },
  });
}

export async function getDashboardStats() {
  const locale = await getLocale();
  const [total, read, reading, unread, wishlistBooks, books, wishlistCount] =
    await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: "COMPLETED" } }),
      prisma.book.count({ where: { status: "READING" } }),
      prisma.book.count({ where: { status: "NOT_STARTED" } }),
      prisma.book.count({ where: { status: "WISHLIST" } }),
      prisma.book.findMany({
        select: {
          genre: true,
          status: true,
          title: true,
          createdAt: true,
          completedAt: true,
          startedAt: true,
          review: true,
          author: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.wishlistItem.count(),
    ]);

  const completedPct = total > 0 ? Math.round((read / total) * 100) : 0;

  const genreMap = new Map<string, number>();
  for (const b of books) {
    genreMap.set(b.genre, (genreMap.get(b.genre) ?? 0) + 1);
  }
  const genreDistribution = [...genreMap.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const lastAdded = await prisma.book.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, author: true, createdAt: true },
  });

  const lastCompleted = await prisma.book.findFirst({
    where: { status: "COMPLETED", completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    select: { id: true, title: true, author: true, completedAt: true },
  });

  const latestReview = await prisma.book.findFirst({
    where: { review: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, review: true, updatedAt: true },
  });

  const genres = [...new Set(books.map((b) => b.genre))].sort();
  const authors = [...new Set(books.map((b) => b.author))].sort();

  const bookDates = books.map((b) => ({
    completedAt: b.completedAt,
    startedAt: b.startedAt,
  }));
  const weeklyProgress = buildWeeklyProgress(bookDates, locale);
  const currentWeek = getCurrentWeekProgress(weeklyProgress);

  const quoteOfTheDay = await prisma.readingLog.findFirst({
    where: { quoteOfTheDay: { not: null } },
    orderBy: { date: "desc" },
    select: {
      quoteOfTheDay: true,
      date: true,
      book: { select: { id: true, title: true, author: true } },
    },
  });

  const readingLogs = await prisma.readingLog.findMany({
    where: { date: { gte: subMonths(new Date(), 12) } },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      pagesRead: true,
      minutesRead: true,
      quoteOfTheDay: true,
      book: { select: { id: true, title: true, author: true } },
    },
  });

  const readingActivity = serializeReadingActivity(readingLogs, locale);

  return {
    total,
    read,
    reading,
    unread,
    wishlistBooks,
    wishlistCount,
    completedPct,
    genreDistribution,
    lastAdded,
    lastCompleted,
    latestReview,
    genres,
    authors,
    weeklyProgress,
    currentWeek,
    quoteOfTheDay,
    readingActivity,
  };
}

export async function getWishlistItems() {
  return prisma.wishlistItem.findMany({
    orderBy: [
      { priority: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getCollections() {
  return prisma.collection.findMany({
    include: { books: { include: { book: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCollection(id: string) {
  return prisma.collection.findUnique({
    where: { id },
    include: { books: { include: { book: true } } },
  });
}
