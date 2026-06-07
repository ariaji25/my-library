export type ActionResult =
  | { ok: true; redirectTo?: string; bookId?: string; addedCount?: number }
  | { ok: false; error: string };
