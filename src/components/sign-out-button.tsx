"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="POST">
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={className}
        aria-label="Keluar"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Keluar</span>
      </Button>
    </form>
  );
}
