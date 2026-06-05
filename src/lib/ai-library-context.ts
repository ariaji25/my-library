import { format, subMonths } from "date-fns";
import { fetchBookSynopsis } from "@/lib/book-synopsis";
import { prisma } from "@/lib/prisma";

function clip(text: string | null | undefined, max = 240): string | null {
  if (!text?.trim()) return null;
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export async function buildLibraryContextForAi(): Promise<string> {
  const since = subMonths(new Date(), 6);

  const [books, wishlist, readingLogs, collections, stats] = await Promise.all([
    prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        genre: true,
        status: true,
        rating: true,
        review: true,
        totalPages: true,
        startedAt: true,
        completedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 80,
    }),
    prisma.wishlistItem.findMany({
      select: { title: true, author: true, priority: true, notes: true },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 30,
    }),
    prisma.readingLog.findMany({
      where: { date: { gte: since } },
      select: {
        date: true,
        pagesRead: true,
        minutesRead: true,
        quoteOfTheDay: true,
        book: { select: { title: true, author: true } },
      },
      orderBy: { date: "desc" },
      take: 40,
    }),
    prisma.collection.findMany({
      select: {
        name: true,
        description: true,
        books: {
          select: { book: { select: { title: true, author: true } } },
          take: 12,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: "COMPLETED" } }),
      prisma.book.count({ where: { status: "READING" } }),
      prisma.book.count({ where: { status: "NOT_STARTED" } }),
      prisma.wishlistItem.count(),
    ]),
  ]);

  const [total, completed, reading, notStarted, wishlistCount] = stats;

  const payload = {
    summary: {
      totalBooks: total,
      completed,
      currentlyReading: reading,
      notStarted,
      wishlistItems: wishlistCount,
    },
    books: books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      genre: b.genre,
      status: b.status,
      rating: b.rating,
      totalPages: b.totalPages,
      startedAt: b.startedAt ? format(b.startedAt, "yyyy-MM-dd") : null,
      completedAt: b.completedAt ? format(b.completedAt, "yyyy-MM-dd") : null,
      reviewExcerpt: clip(b.review),
    })),
    wishlist: wishlist.map((w) => ({
      title: w.title,
      author: w.author,
      priority: w.priority,
      notes: clip(w.notes, 120),
    })),
    recentReadingSessions: readingLogs.map((log) => ({
      date: format(log.date, "yyyy-MM-dd"),
      book: `${log.book.title} — ${log.book.author}`,
      pagesRead: log.pagesRead,
      minutesRead: log.minutesRead,
      quote: clip(log.quoteOfTheDay, 160),
    })),
    collections: collections.map((c) => ({
      name: c.name,
      description: clip(c.description, 120),
      books: c.books.map((cb) => `${cb.book.title} (${cb.book.author})`),
    })),
  };

  return JSON.stringify(payload, null, 2);
}

export async function searchBooksForMention(q: string, limit = 8) {
  const query = q.trim();
  if (!query) return [];

  return prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, author: true },
    orderBy: { title: "asc" },
    take: limit,
  });
}

export async function buildFocusedBooksContext(
  bookIds: string[]
): Promise<string | null> {
  const ids = [...new Set(bookIds)].slice(0, 5);
  if (ids.length === 0) return null;

  const books = await prisma.book.findMany({
    where: { id: { in: ids } },
    include: {
      quotes: { orderBy: { id: "asc" }, take: 12 },
      readingLogs: { orderBy: { date: "desc" }, take: 20 },
    },
  });

  if (books.length === 0) return null;

  const external = await Promise.all(
    books.map((b) => fetchBookSynopsis(b.title, b.author))
  );

  const payload = books.map((b, i) => {
    const ol = external[i];
    return {
      id: b.id,
      title: b.title,
      author: b.author,
      genre: b.genre,
      status: b.status,
      rating: b.rating,
      totalPages: b.totalPages,
      publishedYear: b.publishedYear,
      startedAt: b.startedAt ? format(b.startedAt, "yyyy-MM-dd") : null,
      completedAt: b.completedAt ? format(b.completedAt, "yyyy-MM-dd") : null,
      review: clip(b.review, 1200),
      quotes: b.quotes.map((q) => clip(q.content, 300)),
      readingSessions: b.readingLogs.map((log) => ({
        date: format(log.date, "yyyy-MM-dd"),
        pagesRead: log.pagesRead,
        minutesRead: log.minutesRead,
        quote: clip(log.quoteOfTheDay, 200),
      })),
      externalSynopsis: ol.synopsis,
      externalSynopsisSource: ol.source,
      externalSubjects: ol.subjects.length > 0 ? ol.subjects : undefined,
    };
  });

  return JSON.stringify({ focusedBooks: payload }, null, 2);
}
