import {
  Bookmark,
  FolderOpen,
  LayoutDashboard,
  Library,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/library",
    label: "Library",
    shortLabel: "Library",
    icon: Library,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    shortLabel: "Wishlist",
    icon: Bookmark,
  },
  {
    href: "/collections",
    label: "Collections",
    shortLabel: "Lists",
    icon: FolderOpen,
  },
];

export function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
