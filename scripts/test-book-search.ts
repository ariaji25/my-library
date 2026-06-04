/**
 * Quick check that Open Library search + API route work.
 * Usage: npm run test:book-search
 * With dev server: also curls http://localhost:3000/api/books/search?q=test
 */

import { searchExternalBooks } from "../src/lib/book-search";

const query = process.argv[2] ?? "atomic habits";

async function main() {
  console.log(`Open Library search: "${query}"`);
  const results = await searchExternalBooks(query, 3);
  console.log(`→ ${results.length} result(s)`);
  for (const book of results) {
    console.log(`  • ${book.title} — ${book.author} (${book.year ?? "?"})`);
  }

  const base = process.env.APP_URL ?? "http://localhost:3000";
  const apiUrl = `${base}/api/books/search?q=${encodeURIComponent(query)}`;
  console.log(`\nHTTP GET ${apiUrl}`);

  try {
    const res = await fetch(apiUrl);
    const body = (await res.json()) as { results?: unknown[]; error?: string };
    console.log(`→ HTTP ${res.status}, ${body.results?.length ?? 0} result(s)`);
    if (body.error) console.log(`  error: ${body.error}`);
    if (!res.ok) process.exit(1);
  } catch (err) {
    console.error("→ API not reachable (is `npm run dev` running?)", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
