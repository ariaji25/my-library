"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Link>;

function NavLinkPendingOverlay() {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 animate-pulse rounded-[inherit] bg-primary/15"
    />
  );
}

export function NavLink({ className, children, ...props }: Props) {
  return (
    <Link className={cn("relative", className)} {...props}>
      {children}
      <NavLinkPendingOverlay />
    </Link>
  );
}
