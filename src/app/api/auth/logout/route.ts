import { NextResponse } from "next/server";
import { requestRedirectUrl, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(requestRedirectUrl("/login", request));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
