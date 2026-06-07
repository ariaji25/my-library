"use server";

import { revalidatePath } from "next/cache";
import type { BookStatus, WishlistPriority } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  deleteUploadedCover,
  resolveCoverFromFormData,
} from "@/lib/cover-upload";
import { getLocale, getMessages } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

async function actionMessages() {
  return getMessages(await getLocale());
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/wishlist");
  revalidatePath("/collections");
}

function fail(err: unknown, fallback: string): ActionResult {
  return {
    ok: false,
    error: err instanceof Error ? err.message : fallback,
  };
}

export async function createBook(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const genre = String(formData.get("genre") ?? "").trim();
    const publishedYear = formData.get("publishedYear")
      ? Number(formData.get("publishedYear"))
      : null;
    const status = (formData.get("status") as BookStatus) || "NOT_STARTED";

    if (!title || !author || !genre) {
      return { ok: false, error: m.errors.titleAuthorGenre };
    }

    const coverImage = await resolveCoverFromFormData(formData);

    const book = await prisma.book.create({
      data: {
        title,
        author,
        genre,
        publishedYear,
        coverImage,
        status,
      },
    });

    revalidateAll();
    return { ok: true, bookId: book.id };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function updateBook(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const genre = String(formData.get("genre") ?? "").trim();
    const publishedYear = formData.get("publishedYear")
      ? Number(formData.get("publishedYear"))
      : null;
    const status = formData.get("status") as BookStatus;
    const rating = formData.get("rating") ? Number(formData.get("rating")) : null;
    const totalPagesRaw = formData.get("totalPages");
    const totalPages =
      totalPagesRaw && String(totalPagesRaw).trim()
        ? Number(totalPagesRaw)
        : null;
    const review = String(formData.get("review") ?? "").trim() || null;
    const startedAt = formData.get("startedAt")
      ? new Date(String(formData.get("startedAt")))
      : null;
    const completedAt = formData.get("completedAt")
      ? new Date(String(formData.get("completedAt")))
      : null;

    if (!title || !author || !genre) {
      return { ok: false, error: m.errors.titleAuthorGenre };
    }

    const existing = await prisma.book.findUnique({
      where: { id },
      select: { coverImage: true },
    });
    const coverImage = await resolveCoverFromFormData(
      formData,
      existing?.coverImage
    );

    await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        genre,
        publishedYear,
        coverImage,
        status,
        rating: rating && rating >= 1 && rating <= 5 ? rating : null,
        totalPages:
          totalPages && Number.isFinite(totalPages) && totalPages > 0
            ? Math.round(totalPages)
            : null,
        review,
        startedAt,
        completedAt,
        ...(status === "READING" && !startedAt && { startedAt: new Date() }),
        ...(status === "COMPLETED" && !completedAt && {
          completedAt: new Date(),
        }),
      },
    });

    revalidatePath(`/books/${id}`);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function deleteBook(
  id: string,
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const book = await prisma.book.findUnique({
      where: { id },
      select: { coverImage: true },
    });
    await prisma.book.delete({ where: { id } });
    await deleteUploadedCover(book?.coverImage);
    revalidateAll();
    return { ok: true, redirectTo: "/library" };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function updateBookStatus(
  id: string,
  status: BookStatus,
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const data: {
      status: BookStatus;
      startedAt?: Date;
      completedAt?: Date;
    } = { status };

    if (status === "READING") data.startedAt = new Date();
    if (status === "COMPLETED") data.completedAt = new Date();

    await prisma.book.update({ where: { id }, data });
    revalidatePath(`/books/${id}`);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function addQuote(
  bookId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const content = String(formData.get("content") ?? "").trim();
    if (!content) {
      return { ok: false, error: m.errors.quoteRequired };
    }

    await prisma.quote.create({ data: { bookId, content } });
    revalidatePath(`/books/${bookId}`);
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function deleteQuote(
  quoteId: string,
  bookId: string,
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    await prisma.quote.delete({ where: { id: quoteId } });
    revalidatePath(`/books/${bookId}`);
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function addReadingLog(
  bookId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const dateRaw = String(formData.get("date") ?? "").trim();
    const pagesRaw = formData.get("pagesRead");
    const minutesRaw = formData.get("minutesRead");
    const quoteOfTheDay =
      String(formData.get("quoteOfTheDay") ?? "").trim() || null;

    const pagesRead = Number(pagesRaw);
    const minutesRead = Number(minutesRaw);

    if (!dateRaw) return { ok: false, error: m.errors.dateRequired };
    if (!Number.isFinite(pagesRead) || pagesRead < 1) {
      return { ok: false, error: m.errors.pagesMin };
    }
    if (!Number.isFinite(minutesRead) || minutesRead < 1) {
      return { ok: false, error: m.errors.timeMin };
    }

    await prisma.readingLog.create({
      data: {
        bookId,
        date: new Date(dateRaw),
        pagesRead: Math.round(pagesRead),
        minutesRead: Math.round(minutesRead),
        quoteOfTheDay,
      },
    });

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { status: true, startedAt: true },
    });
    if (book && book.status === "NOT_STARTED") {
      await prisma.book.update({
        where: { id: bookId },
        data: {
          status: "READING",
          startedAt: book.startedAt ?? new Date(dateRaw),
        },
      });
      revalidateAll();
    }

    revalidatePath(`/books/${bookId}`);
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function deleteReadingLog(
  logId: string,
  bookId: string,
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    await prisma.readingLog.delete({ where: { id: logId } });
    revalidatePath(`/books/${bookId}`);
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function createWishlistItem(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const priority = (formData.get("priority") as WishlistPriority) || "MEDIUM";
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!title || !author) {
      return { ok: false, error: m.errors.titleAuthor };
    }

    await prisma.wishlistItem.create({ data: { title, author, priority, notes } });
    revalidatePath("/wishlist");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function deleteWishlistItem(
  id: string,
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    await prisma.wishlistItem.delete({ where: { id } });
    revalidatePath("/wishlist");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

function parseBookIds(formData: FormData): string[] {
  return [
    ...new Set(
      formData
        .getAll("bookIds")
        .map((id) => String(id).trim())
        .filter(Boolean)
    ),
  ];
}

export async function createCollection(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    if (!name) return { ok: false, error: m.errors.nameRequired };

    const collection = await prisma.collection.create({
      data: { name, description },
    });

    revalidatePath("/collections");
    return { ok: true, redirectTo: `/collections/${collection.id}` };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function createCollectionWithBooks(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    const bookIds = parseBookIds(formData);

    if (!name) return { ok: false, error: m.errors.nameRequired };
    if (bookIds.length === 0) {
      return { ok: false, error: m.errors.selectBooksRequired };
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        books: {
          create: bookIds.map((bookId) => ({ bookId })),
        },
      },
    });

    revalidatePath("/collections");
    revalidatePath(`/collections/${collection.id}`);
    revalidatePath("/library");
    return {
      ok: true,
      redirectTo: `/collections/${collection.id}`,
      addedCount: bookIds.length,
    };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function addBooksToCollection(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const collectionId = String(formData.get("collectionId") ?? "").trim();
    const bookIds = parseBookIds(formData);

    if (!collectionId) {
      return { ok: false, error: m.errors.selectCollectionRequired };
    }
    if (bookIds.length === 0) {
      return { ok: false, error: m.errors.selectBooksRequired };
    }

    await prisma.collectionBook.createMany({
      data: bookIds.map((bookId) => ({ collectionId, bookId })),
      skipDuplicates: true,
    });

    revalidatePath(`/collections/${collectionId}`);
    revalidatePath("/collections");
    revalidatePath("/library");
    return { ok: true, addedCount: bookIds.length };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function deleteCollection(
  id: string,
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    await prisma.collection.delete({ where: { id } });
    revalidatePath("/collections");
    return { ok: true, redirectTo: "/collections" };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function addBookToCollectionForm(
  collectionId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    const bookIds = parseBookIds(formData);

    if (bookIds.length === 0) {
      return { ok: false, error: m.errors.selectBooksRequired };
    }

    await prisma.collectionBook.createMany({
      data: bookIds.map((bookId) => ({ collectionId, bookId })),
      skipDuplicates: true,
    });

    revalidatePath(`/collections/${collectionId}`);
    revalidatePath("/collections");
    revalidatePath("/library");
    return { ok: true, addedCount: bookIds.length };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}

export async function removeBookFromCollection(
  collectionId: string,
  bookId: string,
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const m = await actionMessages();

  try {
    await prisma.collectionBook.delete({
      where: { collectionId_bookId: { collectionId, bookId } },
    });
    revalidatePath(`/collections/${collectionId}`);
    return { ok: true };
  } catch (err) {
    return fail(err, m.errors.somethingWrong);
  }
}
