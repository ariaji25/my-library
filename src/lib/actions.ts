"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BookStatus, WishlistPriority } from "@/generated/prisma/client";
import {
  deleteUploadedCover,
  resolveCoverFromFormData,
} from "@/lib/cover-upload";
import { prisma } from "@/lib/prisma";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/wishlist");
  revalidatePath("/collections");
}

export async function createBook(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const genre = String(formData.get("genre") ?? "").trim();
  const publishedYear = formData.get("publishedYear")
    ? Number(formData.get("publishedYear"))
    : null;
  const status = (formData.get("status") as BookStatus) || "NOT_STARTED";

  if (!title || !author || !genre) {
    throw new Error("Title, author, and genre are required");
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
  redirect(`/books/${book.id}`);
}

export async function updateBook(id: string, formData: FormData) {
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
      ...(status === "COMPLETED" && !completedAt && { completedAt: new Date() }),
    },
  });

  revalidatePath(`/books/${id}`);
  revalidateAll();
}

export async function deleteBook(id: string) {
  const book = await prisma.book.findUnique({
    where: { id },
    select: { coverImage: true },
  });
  await prisma.book.delete({ where: { id } });
  await deleteUploadedCover(book?.coverImage);
  revalidateAll();
  redirect("/library");
}

export async function updateBookStatus(id: string, status: BookStatus) {
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
}

export async function addQuote(bookId: string, formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await prisma.quote.create({ data: { bookId, content } });
  revalidatePath(`/books/${bookId}`);
}

export async function deleteQuote(quoteId: string, bookId: string) {
  await prisma.quote.delete({ where: { id: quoteId } });
  revalidatePath(`/books/${bookId}`);
}

export async function addReadingLog(bookId: string, formData: FormData) {
  const dateRaw = String(formData.get("date") ?? "").trim();
  const pagesRaw = formData.get("pagesRead");
  const minutesRaw = formData.get("minutesRead");
  const quoteOfTheDay =
    String(formData.get("quoteOfTheDay") ?? "").trim() || null;

  const pagesRead = Number(pagesRaw);
  const minutesRead = Number(minutesRaw);

  if (!dateRaw) throw new Error("Date is required");
  if (!Number.isFinite(pagesRead) || pagesRead < 1) {
    throw new Error("Pages read must be at least 1");
  }
  if (!Number.isFinite(minutesRead) || minutesRead < 1) {
    throw new Error("Reading time must be at least 1 minute");
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
      data: { status: "READING", startedAt: book.startedAt ?? new Date(dateRaw) },
    });
    revalidateAll();
  }

  revalidatePath(`/books/${bookId}`);
}

export async function deleteReadingLog(logId: string, bookId: string) {
  await prisma.readingLog.delete({ where: { id: logId } });
  revalidatePath(`/books/${bookId}`);
}

export async function createWishlistItem(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const priority = (formData.get("priority") as WishlistPriority) || "MEDIUM";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!title || !author) throw new Error("Title and author are required");

  await prisma.wishlistItem.create({ data: { title, author, priority, notes } });
  revalidatePath("/wishlist");
  revalidatePath("/");
}

export async function deleteWishlistItem(id: string) {
  await prisma.wishlistItem.delete({ where: { id } });
  revalidatePath("/wishlist");
  revalidatePath("/");
}

export async function createCollection(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) throw new Error("Name is required");

  const collection = await prisma.collection.create({
    data: { name, description },
  });

  revalidatePath("/collections");
  redirect(`/collections/${collection.id}`);
}

export async function deleteCollection(id: string) {
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/collections");
  redirect("/collections");
}

export async function addBookToCollectionForm(
  collectionId: string,
  formData: FormData
) {
  const bookId = String(formData.get("bookId") ?? "");
  if (bookId) await addBookToCollection(collectionId, bookId);
}

export async function addBookToCollection(collectionId: string, bookId: string) {
  await prisma.collectionBook.upsert({
    where: { collectionId_bookId: { collectionId, bookId } },
    create: { collectionId, bookId },
    update: {},
  });
  revalidatePath(`/collections/${collectionId}`);
}

export async function removeBookFromCollection(collectionId: string, bookId: string) {
  await prisma.collectionBook.delete({
    where: { collectionId_bookId: { collectionId, bookId } },
  });
  revalidatePath(`/collections/${collectionId}`);
}
