import { NextResponse } from "next/server";
import {
  buildFocusedBooksContext,
  buildLibraryContextForAi,
} from "@/lib/ai-library-context";
import {
  AiLibrarianError,
  chatWithLibrarian,
  isAiConfigured,
} from "@/lib/ai-librarian";
import type { AiChatMessage } from "@/lib/ai-types";
import { getLocale, getMessages } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const MAX_MESSAGES = 12;
const MAX_CONTENT_LEN = 2000;

function parseMessages(body: unknown): AiChatMessage[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) return null;

  const messages: AiChatMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const content = String((item as { content?: unknown }).content ?? "").trim();
    if ((role !== "user" && role !== "assistant") || !content) continue;
    if (content.length > MAX_CONTENT_LEN) return null;
    messages.push({ role, content });
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return null;
  }

  return messages;
}

function parseBookIds(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const raw = (body as { bookIds?: unknown }).bookIds;
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw
        .map((id) => String(id ?? "").trim())
        .filter((id) => id.length > 0 && id.length <= 64)
    ),
  ].slice(0, 5);
}

export async function POST(request: Request) {
  const locale = await getLocale();
  const m = getMessages(locale);

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: m.errors.aiNotConfigured },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: m.errors.invalidJson }, { status: 400 });
  }

  const messages = parseMessages(body);
  if (!messages) {
    return NextResponse.json(
      { error: m.errors.invalidMessages },
      { status: 400 }
    );
  }

  const bookIds = parseBookIds(body);

  try {
    const [libraryContext, focusedBooksContext] = await Promise.all([
      buildLibraryContextForAi(),
      buildFocusedBooksContext(bookIds),
    ]);
    const reply = await chatWithLibrarian(
      messages,
      libraryContext,
      focusedBooksContext,
      locale
    );
    return NextResponse.json({ message: { role: "assistant", content: reply } });
  } catch (err) {
    if (err instanceof AiLibrarianError) {
      const status =
        err.code === "NOT_CONFIGURED"
          ? 503
          : err.code === "API_ERROR"
            ? 502
            : 500;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[ai/chat]", err);
    return NextResponse.json(
      { error: m.errors.somethingWrong },
      { status: 500 }
    );
  }
}
