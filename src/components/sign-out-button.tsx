"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export function SignOutButton({ className }: { className?: string }) {
  const { messages } = useLocale();

  return (
    <form action="/api/auth/logout" method="POST">
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={className}
        aria-label={messages.common.signOut}
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">{messages.common.signOut}</span>
      </Button>
    </form>
  );
}
