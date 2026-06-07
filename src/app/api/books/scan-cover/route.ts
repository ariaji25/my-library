import { NextResponse } from "next/server";
import { AiLibrarianError } from "@/lib/ai-librarian";
import { scanBookCover } from "@/lib/book-cover-scan";
import { getLocale, getMessages } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const locale = await getLocale();
  const m = getMessages(locale);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: m.errors.somethingWrong }, { status: 400 });
  }

  const file = formData.get("cover");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: m.errors.coverEmpty }, { status: 400 });
  }

  try {
    const result = await scanBookCover(file, locale);
    return NextResponse.json(
      { result },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    if (err instanceof AiLibrarianError) {
      const status =
        err.code === "NOT_CONFIGURED"
          ? 503
          : err.code === "INVALID_RESPONSE"
            ? 422
            : 502;
      return NextResponse.json({ error: err.message }, { status });
    }

    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json({ error: m.errors.somethingWrong }, { status: 500 });
  }
}
