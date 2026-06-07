"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked } from "lucide-react";
import { getNavItems, isNavActive } from "@/lib/nav";
import { SHELL_MAX, SHELL_PX } from "@/lib/layout-shell";
import { cn } from "@/lib/utils";
import { HeaderActions } from "@/components/header-actions";
import { NavLink } from "@/components/nav-link";
import { useLocale } from "@/components/locale-provider";

export function TopNav({ showSignOut = false }: { showSignOut?: boolean }) {
  const pathname = usePathname();
  const { messages } = useLocale();
  const navItems = getNavItems(messages);

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
            {messages.app.name}
          </span>
        </Link>

        <nav
          className="flex items-center gap-0.5"
          aria-label={messages.nav.mainAria}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <NavLink
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
              </NavLink>
            );
          })}
        </nav>

        <HeaderActions showSignOut={showSignOut} />
      </div>
    </header>
  );
}
