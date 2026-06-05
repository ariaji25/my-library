import type { AiChatMessage } from "@/lib/ai-types";
import { APP_NAME } from "@/lib/constants";

const SYSTEM_PROMPT = `Kamu adalah AI Librarian untuk ${APP_NAME} — aplikasi rak buku pribadi.
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

type CompletionChunk = {
  choices?: {
    delta?: { content?: string };
    message?: { content?: string };
  }[];
};

function extractContentFromChunk(chunk: CompletionChunk): string {
  const choice = chunk.choices?.[0];
  return choice?.delta?.content ?? choice?.message?.content ?? "";
}

function parseSseCompletion(body: string): string {
  let content = "";

  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;

    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;

    try {
      const chunk = JSON.parse(payload) as CompletionChunk;
      content += extractContentFromChunk(chunk);
    } catch {
      // skip malformed SSE lines
    }
  }

  return content.trim();
}

function parseChatCompletionBody(
  body: string,
  contentType: string | null
): string {
  const trimmed = body.trim();
  if (!trimmed) return "";

  const isEventStream =
    contentType?.includes("text/event-stream") || trimmed.startsWith("data:");

  if (isEventStream) {
    return parseSseCompletion(trimmed);
  }

  const data = JSON.parse(trimmed) as CompletionChunk;
  const choice = data.choices?.[0];
  return (choice?.message?.content ?? choice?.delta?.content ?? "").trim();
}

export async function chatWithLibrarian(
  messages: AiChatMessage[],
  libraryContext: string,
  focusedBooksContext?: string | null
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiLibrarianError(
      "AI belum dikonfigurasi. Set OPENAI_API_KEY di server.",
      "NOT_CONFIGURED"
    );
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
        { role: "system", content: SYSTEM_PROMPT },
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
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.6,
      max_tokens: 900,
      stream: false,
    }),
  });

  const raw = await response.text().catch(() => "");

  if (!response.ok) {
    throw new AiLibrarianError(
      raw ? `Permintaan AI gagal: ${raw.slice(0, 200)}` : "Permintaan AI gagal",
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
    throw new AiLibrarianError(
      "Tidak dapat memproses respons AI",
      "INVALID_RESPONSE"
    );
  }

  if (!content) {
    throw new AiLibrarianError("Respons AI kosong", "INVALID_RESPONSE");
  }

  return content;
}
