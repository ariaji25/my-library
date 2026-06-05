import {
  Bookmark,
  FolderOpen,
  LayoutDashboard,
  Library,
  Sparkles,
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
    label: "Beranda",
    shortLabel: "Beranda",
    icon: LayoutDashboard,
  },
  {
    href: "/library",
    label: "Perpustakaan",
    shortLabel: "Buku",
    icon: Library,
  },
  {
    href: "/assistant",
    label: "AI Pustakawan",
    shortLabel: "AI",
    icon: Sparkles,
  },
  {
    href: "/wishlist",
    label: "Daftar keinginan",
    shortLabel: "Keinginan",
    icon: Bookmark,
  },
  {
    href: "/collections",
    label: "Koleksi",
    shortLabel: "Koleksi",
    icon: FolderOpen,
  },
];

export function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
