import { NextResponse } from "next/server";
import { searchBooksForMention } from "@/lib/ai-library-context";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ books: [] });
  }

  const books = await searchBooksForMention(q);
  return NextResponse.json({ books });
}
