"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked } from "lucide-react";
import { NAV_ITEMS, isNavActive } from "@/lib/nav";
import { SHELL_MAX, SHELL_PX } from "@/lib/layout-shell";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden shrink-0 border-b border-border/80 bg-card/95 backdrop-blur-md md:block">
      <div
        className={cn(
          SHELL_MAX,
          SHELL_PX,
          "flex h-14 items-center justify-between gap-4"
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full py-1 pr-2 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <BookMarked className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
          <span className="font-heading text-lg font-semibold leading-none">
            My Library
          </span>
        </Link>

        <nav
          className="flex items-center gap-0.5"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={active ? 2.25 : 2}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
