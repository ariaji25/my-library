"use client";

import Link from "next/link";
import { BookMarked } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { SHELL_MAX, SHELL_PX } from "@/lib/layout-shell";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 shrink-0 border-b border-border/80 bg-card/95 backdrop-blur-md md:hidden">
      <div
        className={cn(SHELL_MAX, SHELL_PX, "flex h-12 items-center justify-between")}
        style={{ marginTop: "env(safe-area-inset-top, 0px)" }}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <BookMarked className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-heading truncate text-base font-semibold leading-none">
            {APP_NAME}
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
