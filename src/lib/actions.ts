"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BookStatus, WishlistPriority } from "@/generated/prisma/client";
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
  const coverImage = String(formData.get("coverImage") ?? "").trim() || null;
  const status = (formData.get("status") as BookStatus) || "NOT_STARTED";

  if (!title || !author || !genre) {
    throw new Error("Title, author, and genre are required");
  }

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
  const coverImage = String(formData.get("coverImage") ?? "").trim() || null;
  const status = formData.get("status") as BookStatus;
  const rating = formData.get("rating") ? Number(formData.get("rating")) : null;
  const review = String(formData.get("review") ?? "").trim() || null;
  const startedAt = formData.get("startedAt")
    ? new Date(String(formData.get("startedAt")))
    : null;
  const completedAt = formData.get("completedAt")
    ? new Date(String(formData.get("completedAt")))
    : null;

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
  await prisma.book.delete({ where: { id } });
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
