"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

export function MobileNav() {
  const pathname = usePathname();
  const { messages } = useLocale();
  const navItems = getNavItems(messages);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 shrink-0 border-t border-border/80 bg-card/95 backdrop-blur-md md:hidden"
      aria-label={messages.nav.mainAria}
    >
      <div
        className="flex h-14 items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navItems.map(({ href, shortLabel, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  active && "bg-primary/15"
                )}
              >
                <Icon
                  className="h-[1.125rem] w-[1.125rem]"
                  strokeWidth={active ? 2.25 : 2}
                />
              </span>
              <span className="max-w-full truncate text-[0.625rem] font-semibold leading-none">
                {shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
