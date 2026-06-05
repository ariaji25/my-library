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

function adminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.trim() || undefined;
}

function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD?.trim() || undefined;
}

export function isAuthEnabled(): boolean {
  return Boolean(adminEmail() && adminPassword());
}

function sessionSigningKey(): string | undefined {
  const email = adminEmail();
  const password = adminPassword();
  if (!email || !password) return undefined;
  return `${email}:${password}`;
}

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = adminEmail();
  const expectedPass = adminPassword();
  if (!expectedEmail || !expectedPass) return false;
  return (
    safeEqual(normalizeEmail(email), normalizeEmail(expectedEmail)) &&
    safeEqual(password, expectedPass)
  );
}

/** Browser-safe origin — Docker/Next bind to 0.0.0.0, which must not appear in redirects. */
export function requestOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0].trim() ||
    request.headers.get("host")?.trim();
  if (host && host !== "0.0.0.0" && !host.startsWith("0.0.0.0:")) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
      "http";
    return `${proto}://${host}`;
  }
  try {
    const url = new URL(request.url);
    if (url.hostname !== "0.0.0.0") return url.origin;
  } catch {
    // fall through
  }
  return "http://localhost:3000";
}

export function requestRedirectUrl(path: string, request: Request): URL {
  return new URL(path, requestOrigin(request));
}

/** HTTPS behind reverse proxy (SwiftWave/Railway) or explicit COOKIE_SECURE=false for HTTP. */
export function cookieSecureFromRequest(request: Request): boolean {
  if (process.env.COOKIE_SECURE === "false") return false;
  if (process.env.NODE_ENV !== "production") return false;
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) {
    return proto.split(",")[0].trim().toLowerCase() === "https";
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return true;
  }
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

export function sessionCookieOptions(secure?: boolean) {
  const useSecure =
    secure ??
    (process.env.NODE_ENV === "production" &&
      process.env.COOKIE_SECURE !== "false");
  return {
    httpOnly: true,
    secure: useSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
