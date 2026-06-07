export type ActionResult =
  | { ok: true; redirectTo?: string; bookId?: string }
  | { ok: false; error: string };
