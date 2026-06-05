import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
} from "@/lib/i18n";

export async function POST(request: Request) {
  let locale = DEFAULT_LOCALE;

  try {
    const body = (await request.json()) as { locale?: string };
    if (isLocale(body.locale)) {
      locale = body.locale;
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
