const USER_AGENT = "ArindasLibrary/1.0 (personal bookshelf)";
const FETCH_TIMEOUT_MS = 6000;

function clip(text: string, max = 1500): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function parseOpenLibraryDescription(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) {
    return clip(raw);
  }
  if (raw && typeof raw === "object" && "value" in raw) {
    const value = String((raw as { value: unknown }).value ?? "").trim();
    return value ? clip(value) : null;
  }
  return null;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type SearchHit = {
  docs?: {
    key?: string;
    first_sentence?: string[];
  }[];
};

type WorkRecord = {
  description?: unknown;
  subjects?: string[];
  first_sentence?: unknown;
};

function parseFirstSentence(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return clip(raw, 400);
  if (Array.isArray(raw) && typeof raw[0] === "string") return clip(raw[0], 400);
  return null;
}

/**
 * Fetches a public synopsis for a book from Open Library (description, subjects, opening line).
 * Returns null when no match or no text is available.
 */
export async function fetchBookSynopsis(
  title: string,
  author: string
): Promise<{
  synopsis: string | null;
  subjects: string[];
  source: "open_library" | null;
}> {
  const searchUrl = new URL("https://openlibrary.org/search.json");
  searchUrl.searchParams.set("title", title.trim());
  searchUrl.searchParams.set("author", author.trim());
  searchUrl.searchParams.set("limit", "1");
  searchUrl.searchParams.set("fields", "key,first_sentence");

  const search = await fetchJson<SearchHit>(searchUrl.toString());
  const doc = search?.docs?.[0];
  const workKey = doc?.key;
  if (!workKey) {
    return { synopsis: null, subjects: [], source: null };
  }

  const work = await fetchJson<WorkRecord>(
    `https://openlibrary.org${workKey}.json`
  );

  const description =
    parseOpenLibraryDescription(work?.description) ??
    parseFirstSentence(work?.first_sentence) ??
    (doc.first_sentence?.[0] ? clip(doc.first_sentence[0], 400) : null);

  const subjects = (work?.subjects ?? [])
    .filter((s) => typeof s === "string" && s.length > 0 && s.length <= 64)
    .slice(0, 8);

  if (!description && subjects.length === 0) {
    return { synopsis: null, subjects: [], source: null };
  }

  const synopsisParts: string[] = [];
  if (description) synopsisParts.push(description);
  if (subjects.length > 0) {
    synopsisParts.push(`Themes/subjects: ${subjects.join(", ")}`);
  }

  return {
    synopsis: synopsisParts.join("\n\n"),
    subjects,
    source: "open_library",
  };
}
