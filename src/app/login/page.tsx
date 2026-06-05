import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { BookMarked } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";
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
import { HeaderActions } from "@/components/header-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  if (!isAuthEnabled()) {
    redirect("/");
  }

  const { messages: m } = await getTranslations();
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
      <div className="absolute right-4 top-4">
        <HeaderActions />
      </div>
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <BookMarked className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">{m.app.name}</CardTitle>
          <CardDescription>{m.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/login" method="POST" className="space-y-4">
            <input type="hidden" name="next" value={next} />
            {showError && (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {m.login.invalidCredentials}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{m.common.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{m.common.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {m.common.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {m.login.protected}{" "}
        <Link href="/" className="underline-offset-2 hover:underline">
          {m.login.appLogin}
        </Link>
      </p>
    </div>
  );
}
