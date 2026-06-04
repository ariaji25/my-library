import type { PrismaClient } from "../src/generated/prisma/client";

/** Stable IDs so seed is safe to run repeatedly (upsert, no duplicates). */
const SEED = {
  books: {
    atomicHabits: "seed-book-atomic-habits",
    deepWork: "seed-book-deep-work",
    midnightLibrary: "seed-book-midnight-library",
    projectHailMary: "seed-book-project-hail-mary",
    sapiens: "seed-book-sapiens",
    psychologyOfMoney: "seed-book-psychology-of-money",
    dune: "seed-book-dune",
    educated: "seed-book-educated",
  },
  collections: {
    productivity: "seed-collection-productivity",
    lifeChanging: "seed-collection-life-changing",
  },
  quotes: {
    atomic1: "seed-quote-atomic-1",
    atomic2: "seed-quote-atomic-2",
    midnight1: "seed-quote-midnight-1",
  },
  wishlist: {
    creativeAct: "seed-wishlist-creative-act",
    thinkingFast: "seed-wishlist-thinking-fast",
    nameOfTheWind: "seed-wishlist-name-of-the-wind",
  },
} as const;

const seedBooks = [
  {
    id: SEED.books.atomicHabits,
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    publishedYear: 2018,
    coverImage:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    status: "COMPLETED" as const,
    rating: 5,
    review:
      "A practical guide to building better habits. Small changes compound into remarkable results.",
    completedAt: new Date("2025-11-15"),
    startedAt: new Date("2025-10-01"),
  },
  {
    id: SEED.books.deepWork,
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Productivity",
    publishedYear: 2016,
    coverImage:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    status: "READING" as const,
    rating: 4,
    startedAt: new Date("2026-01-10"),
  },
  {
    id: SEED.books.midnightLibrary,
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    publishedYear: 2020,
    coverImage:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    status: "COMPLETED" as const,
    rating: 4,
    review: "Thought-provoking exploration of life's infinite possibilities.",
    completedAt: new Date("2025-08-20"),
    startedAt: new Date("2025-08-01"),
  },
  {
    id: SEED.books.projectHailMary,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    publishedYear: 2021,
    coverImage:
      "https://images.unsplash.com/photo-1532012197267-da84d1271d0d?w=400&h=600&fit=crop",
    status: "NOT_STARTED" as const,
  },
  {
    id: SEED.books.sapiens,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "History",
    publishedYear: 2011,
    coverImage:
      "https://images.unsplash.com/photo-1524995997942-a1c2e315a42f?w=400&h=600&fit=crop",
    status: "COMPLETED" as const,
    rating: 5,
    review:
      "A sweeping narrative of human history from cognitive revolution to present.",
    completedAt: new Date("2024-12-01"),
    startedAt: new Date("2024-09-01"),
  },
  {
    id: SEED.books.psychologyOfMoney,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Finance",
    publishedYear: 2020,
    coverImage:
      "https://images.unsplash.com/photo-1589998055854-a5cb59c93a3c?w=400&h=600&fit=crop",
    status: "WISHLIST" as const,
  },
  {
    id: SEED.books.dune,
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    publishedYear: 1965,
    coverImage:
      "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop",
    status: "NOT_STARTED" as const,
  },
  {
    id: SEED.books.educated,
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    publishedYear: 2018,
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    status: "READING" as const,
    rating: 3,
    startedAt: new Date("2026-02-01"),
  },
];

const seedQuotes = [
  {
    id: SEED.quotes.atomic1,
    bookId: SEED.books.atomicHabits,
    content:
      "You do not rise to the level of your goals. You fall to the level of your systems.",
  },
  {
    id: SEED.quotes.atomic2,
    bookId: SEED.books.atomicHabits,
    content:
      "Every action you take is a vote for the type of person you wish to become.",
  },
  {
    id: SEED.quotes.midnight1,
    bookId: SEED.books.midnightLibrary,
    content:
      "The only way to learn is to live. And the only way to live is to keep trying.",
  },
];

const seedCollections = [
  {
    id: SEED.collections.productivity,
    name: "Productivity Collection",
    description: "Books on focus, habits, and getting things done.",
  },
  {
    id: SEED.collections.lifeChanging,
    name: "Life Changing Books",
    description: "Books that shifted how I see the world.",
  },
];

const seedCollectionBooks = [
  {
    collectionId: SEED.collections.productivity,
    bookId: SEED.books.atomicHabits,
  },
  {
    collectionId: SEED.collections.productivity,
    bookId: SEED.books.deepWork,
  },
  {
    collectionId: SEED.collections.lifeChanging,
    bookId: SEED.books.midnightLibrary,
  },
  {
    collectionId: SEED.collections.lifeChanging,
    bookId: SEED.books.sapiens,
  },
];

const seedWishlist = [
  {
    id: SEED.wishlist.creativeAct,
    title: "The Creative Act",
    author: "Rick Rubin",
    priority: "HIGH" as const,
    notes: "Recommended by several friends.",
  },
  {
    id: SEED.wishlist.thinkingFast,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    priority: "MEDIUM" as const,
  },
  {
    id: SEED.wishlist.nameOfTheWind,
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    priority: "LOW" as const,
    notes: "Epic fantasy — save for vacation.",
  },
];

export type SeedOptions = {
  /** Wipe all data before seeding (only for `npm run db:seed -- --reset` style usage) */
  reset?: boolean;
};

export type SeedResult = {
  books: { created: number; existing: number };
  quotes: { created: number; existing: number };
  collections: { created: number; existing: number };
  collectionBooks: { created: number; existing: number };
  wishlist: { created: number; existing: number };
};

export async function seedDatabase(
  prisma: PrismaClient,
  options: SeedOptions = {}
): Promise<SeedResult> {
  if (options.reset) {
    await prisma.quote.deleteMany();
    await prisma.collectionBook.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.book.deleteMany();
    await prisma.wishlistItem.deleteMany();
  }

  const result: SeedResult = {
    books: { created: 0, existing: 0 },
    quotes: { created: 0, existing: 0 },
    collections: { created: 0, existing: 0 },
    collectionBooks: { created: 0, existing: 0 },
    wishlist: { created: 0, existing: 0 },
  };

  for (const book of seedBooks) {
    const existing = await prisma.book.findUnique({ where: { id: book.id } });
    if (existing) {
      result.books.existing++;
      continue;
    }
    await prisma.book.create({ data: book });
    result.books.created++;
  }

  for (const quote of seedQuotes) {
    const existing = await prisma.quote.findUnique({ where: { id: quote.id } });
    if (existing) {
      result.quotes.existing++;
      continue;
    }
    await prisma.quote.create({ data: quote });
    result.quotes.created++;
  }

  for (const collection of seedCollections) {
    const existing = await prisma.collection.findUnique({
      where: { id: collection.id },
    });
    if (existing) {
      result.collections.existing++;
      continue;
    }
    await prisma.collection.create({ data: collection });
    result.collections.created++;
  }

  for (const link of seedCollectionBooks) {
    const existing = await prisma.collectionBook.findUnique({
      where: {
        collectionId_bookId: {
          collectionId: link.collectionId,
          bookId: link.bookId,
        },
      },
    });
    if (existing) {
      result.collectionBooks.existing++;
      continue;
    }
    await prisma.collectionBook.create({ data: link });
    result.collectionBooks.created++;
  }

  for (const item of seedWishlist) {
    const existing = await prisma.wishlistItem.findUnique({
      where: { id: item.id },
    });
    if (existing) {
      result.wishlist.existing++;
      continue;
    }
    await prisma.wishlistItem.create({ data: item });
    result.wishlist.created++;
  }

  return result;
}

export function formatSeedResult(result: SeedResult): string {
  const parts = [
    `books +${result.books.created}/${result.books.existing} exist`,
    `quotes +${result.quotes.created}/${result.quotes.existing} exist`,
    `collections +${result.collections.created}/${result.collections.existing} exist`,
    `links +${result.collectionBooks.created}/${result.collectionBooks.existing} exist`,
    `wishlist +${result.wishlist.created}/${result.wishlist.existing} exist`,
  ];
  return parts.join(", ");
}
