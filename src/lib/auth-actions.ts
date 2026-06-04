"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  createSessionToken,
  isAuthEnabled,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/auth";

export async function login(formData: FormData) {
  if (!isAuthEnabled()) {
    redirect("/");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!verifyCredentials(email, password)) {
    const params = new URLSearchParams({ error: "invalid" });
    if (next && next.startsWith("/")) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }

  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());

  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
