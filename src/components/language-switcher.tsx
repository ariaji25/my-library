"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, messages } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border/80 bg-muted/40 p-0.5 text-xs font-semibold",
        className
      )}
      role="group"
      aria-label={messages.language.label}
    >
      {(["id", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          onClick={() => setLocale(code)}
          className={cn(
            "rounded-full px-2 py-1 transition-colors",
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={locale === code}
        >
          {messages.language[code]}
        </button>
      ))}
    </div>
  );
}
