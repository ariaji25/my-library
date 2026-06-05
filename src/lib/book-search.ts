import type { BookSearchHit } from "@/lib/book-search-types";

export type { BookSearchHit } from "@/lib/book-search-types";

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
};

type OpenLibraryResponse = {
  docs?: OpenLibraryDoc[];
};

const SKIP_SUBJECT =
  /^(Accessible book|Protected DAISY|Librivox|Audiobook|Fiction in English)/i;

function pickGenre(subjects?: string[]): string {
  if (!subjects?.length) return "Fiction";
  const match = subjects.find(
    (s) => s.length > 0 && s.length <= 48 && !SKIP_SUBJECT.test(s)
  );
  return match ?? "Fiction";
}

function normalizeDoc(doc: OpenLibraryDoc): BookSearchHit | null {
  const title = doc.title?.trim();
  const author = doc.author_name?.[0]?.trim();
  if (!title || !author) return null;

  const id = doc.key ?? `${title}-${author}`;
  const coverUrl = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : undefined;

  return {
    id,
    title,
    author,
    year: doc.first_publish_year,
    genre: pickGenre(doc.subject),
    coverUrl,
  };
}

export async function searchExternalBooks(
  query: string,
  limit = 8
): Promise<BookSearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    "key,title,author_name,first_publish_year,cover_i,subject"
  );

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "ArindasLibrary/1.0 (personal bookshelf)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const { getLocale, getMessages } = await import("@/lib/i18n/server");
    const m = getMessages(await getLocale());
    throw new Error(m.errors.bookSearchFailed);
  }

  const data = (await res.json()) as OpenLibraryResponse;
  const hits: BookSearchHit[] = [];

  for (const doc of data.docs ?? []) {
    const hit = normalizeDoc(doc);
    if (hit) hits.push(hit);
  }

  return hits;
}
