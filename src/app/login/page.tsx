import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Auth env vars exist only at runtime — must not prerender redirect to "/" at build.
export const dynamic = "force-dynamic";
import { BookMarked } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { isAuthEnabled, SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  if (!isAuthEnabled()) {
    redirect("/");
  }

  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";
  const showError = params.error === "invalid";

  const jar = await cookies();
  if (await verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    redirect(next);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-6">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <BookMarked className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">{APP_NAME}</CardTitle>
          <CardDescription>Masuk untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/login" method="POST" className="space-y-4">
            <input type="hidden" name="next" value={next} />
            {showError && (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                Email atau kata sandi tidak valid.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Dilindungi dengan{" "}
        <Link href="/" className="underline-offset-2 hover:underline">
          login aplikasi
        </Link>
      </p>
    </div>
  );
}
