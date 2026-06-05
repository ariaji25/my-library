import { NextResponse } from "next/server";
import {
  cookieSecureFromRequest,
  createSessionToken,
  isAuthEnabled,
  requestRedirectUrl,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.redirect(requestRedirectUrl("/", request));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/");
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  if (!verifyCredentials(email, password)) {
    const params = new URLSearchParams({ error: "invalid" });
    params.set("next", next);
    return NextResponse.redirect(
      requestRedirectUrl(`/login?${params.toString()}`, request)
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.redirect(requestRedirectUrl(next, request));
  response.cookies.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(cookieSecureFromRequest(request))
  );
  return response;
}
