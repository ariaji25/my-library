export const SESSION_COOKIE = "library_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function encoder() {
  return new TextEncoder();
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAuthEnabled(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

function sessionSigningKey(): string | undefined {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return undefined;
  return `${email}:${password}`;
}

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPass) return false;
  return (
    safeEqual(normalizeEmail(email), normalizeEmail(expectedEmail)) &&
    safeEqual(password, expectedPass)
  );
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(message));
  return bytesToBase64Url(sig);
}

export async function createSessionToken(): Promise<string> {
  const secret = sessionSigningKey();
  if (!secret) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC);
  const sig = await hmacSign(exp, secret);
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !isAuthEnabled()) return !isAuthEnabled();
  const secret = sessionSigningKey();
  if (!secret) return false;

  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;

  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = await hmacSign(exp, secret);
  const validSig = safeEqual(sig, expectedSig);
  const expNum = Number(exp);
  const notExpired =
    Number.isFinite(expNum) && expNum > Math.floor(Date.now() / 1000);
  return validSig && notExpired;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
