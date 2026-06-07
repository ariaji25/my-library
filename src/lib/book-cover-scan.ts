import {
  lookupBookByIsbn,
  searchExternalBooks,
  type BookSearchHit,
} from "@/lib/book-search";
import {
  CoverScanError,
  getCoverScanConfig,
} from "@/lib/cover-scan-ai";
import {
  COVER_MAX_BYTES,
  coverMimeType,
  isAllowedCoverFile,
} from "@/lib/cover-upload-constants";
import { getMessages, type Locale } from "@/lib/i18n";

type VisionExtraction = {
  title?: string | null;
  author?: string | null;
  genre?: string | null;
  year?: number | null;
  isbn?: string | null;
};

function normalizeIsbn(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const clean = value.replace(/[^0-9Xx]/g, "");
  return clean.length >= 10 ? clean : undefined;
}

function normalizeYear(value: number | null | undefined): number | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  const year = Math.round(value);
  return year >= 1000 && year <= 2100 ? year : undefined;
}

function visionPrompt(locale: Locale): string {
  if (locale === "en") {
    return `Read this book cover image. Extract visible metadata from the cover, spine, or barcode.
Return JSON only with these keys:
- title (string or null)
- author (string or null)
- genre (string or null — one short category, e.g. Fiction, Science, Biography)
- year (number or null — publication year if visible)
- isbn (string or null — digits only, include check digit if readable)

Use null for fields you cannot determine. Do not guess plot or content not shown on the cover.`;
  }

  return `Baca gambar sampul buku ini. Ekstrak metadata yang terlihat dari sampul, punggung buku, atau barcode.
Kembalikan JSON saja dengan kunci:
- title (string atau null)
- author (string atau null)
- genre (string atau null — satu kategori singkat, mis. Fiksi, Sains, Biografi)
- year (number atau null — tahun terbit jika terlihat)
- isbn (string atau null — hanya digit, sertakan digit cek jika terbaca)

Gunakan null untuk field yang tidak bisa ditentukan. Jangan mengarang plot atau isi yang tidak terlihat di sampul.`;
}

async function extractFromCoverImage(
  bytes: Buffer,
  mimeType: string,
  locale: Locale
): Promise<VisionExtraction> {
  const m = getMessages(locale);
  const config = getCoverScanConfig();
  if (!config) {
    throw new CoverScanError(m.errors.coverScanNotConfiguredServer, "NOT_CONFIGURED");
  }

  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt(locale) },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "low" },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 400,
    }),
  });

  const raw = await response.text().catch(() => "");

  if (!response.ok) {
    throw new CoverScanError(
      raw
        ? `${m.errors.coverScanRequestFailed}: ${raw.slice(0, 200)}`
        : m.errors.coverScanRequestFailed,
      "API_ERROR"
    );
  }

  let parsed: VisionExtraction;
  try {
    const json = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("empty");
    }
    parsed = JSON.parse(content) as VisionExtraction;
  } catch {
    throw new CoverScanError(m.errors.coverScanParseFailed, "INVALID_RESPONSE");
  }

  return parsed;
}

function hitFromVision(extracted: VisionExtraction): BookSearchHit | null {
  const title = extracted.title?.trim();
  const author = extracted.author?.trim();
  if (!title || !author) return null;

  const id = `scan-${title}-${author}`;
  const genre = extracted.genre?.trim() || "Fiction";

  return {
    id,
    title,
    author,
    genre,
    year: normalizeYear(extracted.year),
  };
}

async function enrichFromOpenLibrary(
  extracted: VisionExtraction
): Promise<BookSearchHit | null> {
  const isbn = normalizeIsbn(extracted.isbn);
  if (isbn) {
    const byIsbn = await lookupBookByIsbn(isbn);
    if (byIsbn) return byIsbn;
  }

  const title = extracted.title?.trim();
  const author = extracted.author?.trim();
  if (!title || !author) return null;

  const query = `${title} ${author}`;
  const hits = await searchExternalBooks(query, 3);
  if (hits.length === 0) return null;

  const titleLower = title.toLowerCase();
  const authorLower = author.toLowerCase();
  const match =
    hits.find(
      (hit) =>
        hit.title.toLowerCase().includes(titleLower) ||
        titleLower.includes(hit.title.toLowerCase())
    ) ??
    hits.find((hit) => hit.author.toLowerCase().includes(authorLower)) ??
    hits[0];

  return match ?? null;
}

export function validateCoverScanFile(file: File, locale: Locale): void {
  const m = getMessages(locale);
  if (file.size === 0) {
    throw new Error(m.errors.coverEmpty);
  }
  if (file.size > COVER_MAX_BYTES) {
    throw new Error(m.errors.coverSize);
  }
  if (!isAllowedCoverFile(file)) {
    throw new Error(m.errors.coverType);
  }
}

export async function scanBookCover(
  file: File,
  locale: Locale
): Promise<BookSearchHit> {
  validateCoverScanFile(file, locale);

  const bytes = Buffer.from(await file.arrayBuffer());
  const extracted = await extractFromCoverImage(
    bytes,
    coverMimeType(file),
    locale
  );

  const enriched = await enrichFromOpenLibrary(extracted);
  if (enriched) {
    return { ...enriched, coverUrl: undefined };
  }

  const visionHit = hitFromVision(extracted);
  if (visionHit) return visionHit;

  const m = getMessages(locale);
  throw new CoverScanError(m.errors.coverScanUnreadable, "INVALID_RESPONSE");
}
