import { NextResponse } from "next/server";
import { searchExternalBooks } from "@/lib/book-search";
import { getLocale, getMessages } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchExternalBooks(q, 8);
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    const m = getMessages(await getLocale());
    return NextResponse.json(
      { error: m.errors.searchFailed },
      { status: 502 }
    );
  }
}
