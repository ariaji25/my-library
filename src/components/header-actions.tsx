"use client";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function HeaderActions({ showSignOut = false }: { showSignOut?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {showSignOut ? <SignOutButton /> : null}
      <ThemeToggle />
    </div>
  );
}
