import {
  Bookmark,
  FolderOpen,
  LayoutDashboard,
  Library,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Messages } from "@/lib/i18n/messages/en";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export function getNavItems(messages: Messages): NavItem[] {
  return [
    {
      href: "/",
      label: messages.nav.dashboard,
      shortLabel: messages.nav.dashboardShort,
      icon: LayoutDashboard,
    },
    {
      href: "/library",
      label: messages.nav.library,
      shortLabel: messages.nav.libraryShort,
      icon: Library,
    },
    {
      href: "/assistant",
      label: messages.nav.assistant,
      shortLabel: messages.nav.assistantShort,
      icon: Sparkles,
    },
    {
      href: "/wishlist",
      label: messages.nav.wishlist,
      shortLabel: messages.nav.wishlistShort,
      icon: Bookmark,
    },
    {
      href: "/collections",
      label: messages.nav.collections,
      shortLabel: messages.nav.collectionsShort,
      icon: FolderOpen,
    },
  ];
}

export function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
