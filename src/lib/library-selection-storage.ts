"use client";

const KEY = "library-selected-book-ids";

export function loadSelectedBookIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveSelectedBookIds(ids: Set<string>) {
  sessionStorage.setItem(KEY, JSON.stringify([...ids]));
}

export function clearSelectedBookIds() {
  sessionStorage.removeItem(KEY);
}
