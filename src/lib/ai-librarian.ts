import type { AiChatMessage } from "@/lib/ai-types";
import { getMessages, type Locale } from "@/lib/i18n";

function systemPrompt(locale: Locale): string {
  const appName = getMessages(locale).app.name;

  if (locale === "en") {
    return `You are the AI Librarian for ${appName} — a personal bookshelf app.
Help the owner understand their collection, pick what to read next, summarize reviews, and reflect on reading habits.

Tone:
- Reply in friendly, casual English — like chatting with a book-loving friend.
- Keep it warm and concise; light emoji is fine when it fits.

Content rules:
- Use the library data in context. Do not invent books, numbers, or plot details.
- For mentioned books, \`externalSynopsis\` from Open Library may be used for plot/theme questions.
- \`review\`, \`quotes\`, and \`readingSessions\` belong to the user — prioritize those for opinions and progress.
- Do not claim full text or chapter-by-chapter knowledge; only public synopsis + their logged data.
- If synopsis/data is missing, say so honestly.
- Recommend mainly from their library or wishlist unless they ask otherwise.
- Max ~300 words per answer unless they ask for more detail.`;
  }

  return `Kamu adalah AI Librarian untuk ${appName} — aplikasi rak buku pribadi.
Bantu pemiliknya paham koleksinya, pilih bacaan berikutnya, ringkas review, dan refleksi kebiasaan baca.

Gaya bahasa:
- Selalu jawab dalam Bahasa Indonesia santai (casual), seperti ngobrol sama teman pecinta buku.
- Pakai "kamu", hindari bahasa terlalu formal (jangan "Anda", "Silakan", "demikian", dll.).
- Boleh pakai emoji ringan sesekali kalau pas, tapi jangan berlebihan.
- Kalau user nulis dalam bahasa lain, tetap jawab Indonesia santai kecuali diminta sebaliknya.

Aturan isi:
- Pakai data library di context. Jangan mengarang buku, angka, atau alur cerita.
- Untuk buku yang disebut, \`externalSynopsis\` dari Open Library boleh dipakai untuk pertanyaan plot/tema.
- \`review\`, \`quotes\`, dan \`readingSessions\` milik user — utamakan itu kalau bahas pendapat atau progress baca mereka.
- Jangan klaim punya teks lengkap atau per-bab; cuma sinopsis publik + data yang mereka catat.
- Kalau sinopsis/data kosong, bilang jujur.
- Rekomendasi utamakan dari library atau wishlist mereka, kecuali diminta saran di luar itu.
- Maksimal ~300 kata per jawaban, kecuali diminta lebih detail.`;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export class AiLibrarianError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_CONFIGURED" | "API_ERROR" | "INVALID_RESPONSE"
  ) {
    super(message);
    this.name = "AiLibrarianError";
  }
}

function parseChatCompletionBody(
  raw: string,
  contentType: string | null
): string {
  if (contentType?.includes("text/event-stream")) {
    let content = "";
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") break;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{
            delta?: { content?: string };
            message?: { content?: string };
          }>;
        };
        const choice = parsed.choices?.[0];
        content +=
          choice?.message?.content ?? choice?.delta?.content ?? "";
      } catch {
        /* skip malformed SSE chunk */
      }
    }
    return content.trim();
  }

  const json = JSON.parse(raw) as {
    choices?: Array<{
      message?: { content?: string };
      delta?: { content?: string };
    }>;
  };
  const choice = json.choices?.[0];
  return (choice?.message?.content ?? choice?.delta?.content ?? "").trim();
}

export async function chatWithLibrarian(
  messages: AiChatMessage[],
  libraryContext: string,
  focusedBooksContext: string | null | undefined,
  locale: Locale
): Promise<string> {
  const m = getMessages(locale);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiLibrarianError(m.errors.aiNotConfiguredServer, "NOT_CONFIGURED");
  }

  const model = process.env.AI_MODEL?.trim() || "gpt-4o-mini";
  const baseUrl = (
    process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt(locale) },
        {
          role: "user",
          content: [
            `Library data (JSON):\n${libraryContext}`,
            focusedBooksContext
              ? `\nUser mentioned these books — prioritize them in your answer:\n${focusedBooksContext}`
              : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
      ],
      temperature: 0.6,
      max_tokens: 900,
      stream: false,
    }),
  });

  const raw = await response.text().catch(() => "");

  if (!response.ok) {
    throw new AiLibrarianError(
      raw
        ? `${m.errors.aiRequestFailed}: ${raw.slice(0, 200)}`
        : m.errors.aiRequestFailed,
      "API_ERROR"
    );
  }

  let content: string;
  try {
    content = parseChatCompletionBody(
      raw,
      response.headers.get("content-type")
    );
  } catch {
    throw new AiLibrarianError(m.errors.aiParseFailed, "INVALID_RESPONSE");
  }

  if (!content) {
    throw new AiLibrarianError(m.errors.aiEmpty, "INVALID_RESPONSE");
  }

  return content;
}
