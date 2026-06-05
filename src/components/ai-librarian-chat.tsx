"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { AiChatMessage, AiMentionBook } from "@/lib/ai-types";
import { AiBookMentionPicker } from "@/components/ai-book-mention-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Buku apa yang cocok kubaca selanjutnya?",
  "Gimana kebiasaan bacaku belakangan ini?",
  "Dari wishlist, mana yang sebaiknya diprioritaskan?",
  "Genre apa yang paling dominan di koleksiku?",
];

type Props = {
  configured: boolean;
  initialBook?: AiMentionBook;
};

export function AiLibrarianChat({ configured, initialBook }: Props) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [mentionedBooks, setMentionedBooks] = useState<AiMentionBook[]>(
    initialBook ? [initialBook] : []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atQuery, setAtQuery] = useState<string | null>(null);
  const [atResults, setAtResults] = useState<AiMentionBook[]>([]);
  const [atLoading, setAtLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seededInitial = useRef(false);

  useEffect(() => {
    if (!initialBook || seededInitial.current) return;
    seededInitial.current = true;
    setMentionedBooks([initialBook]);
  }, [initialBook]);

  useEffect(() => {
    if (atQuery === null) {
      setAtResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setAtLoading(true);
      try {
        const q = atQuery.trim();
        if (!q) {
          setAtResults([]);
          return;
        }
        const res = await fetch(`/api/ai/books?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { books?: AiMentionBook[] };
        setAtResults(data.books ?? []);
      } catch {
        setAtResults([]);
      } finally {
        setAtLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [atQuery]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function syncAtQuery(value: string) {
    const match = value.match(/@([^\s@]*)$/);
    setAtQuery(match ? match[1] : null);
  }

  function addMentionedBook(book: AiMentionBook) {
    setMentionedBooks((prev) => {
      if (prev.some((b) => b.id === book.id) || prev.length >= 3) return prev;
      return [...prev, book];
    });
  }

  function pickAtMention(book: AiMentionBook) {
    addMentionedBook(book);
    setInput((prev) => prev.replace(/@([^\s@]*)$/, "").trimEnd());
    setAtQuery(null);
    setAtResults([]);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !configured) return;

    setError(null);
    const userMessage: AiChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setAtQuery(null);
    setLoading(true);
    scrollToBottom();

    const bookIds = mentionedBooks.map((b) => b.id);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, bookIds }),
      });

      const data = (await res.json()) as {
        message?: AiChatMessage;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Permintaan gagal");
      }

      if (!data.message?.content) {
        throw new Error("Respons kosong");
      }

      setMessages((prev) => [...prev, data.message!]);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const bookSuggestion =
    initialBook && mentionedBooks.some((b) => b.id === initialBook.id)
      ? `Ringkas review dan progress bacaku untuk ${initialBook.title}.`
      : null;

  return (
    <div className="flex min-h-[min(70vh,640px)] flex-col rounded-2xl border border-border/80 bg-card shadow-sm shadow-primary/5">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && (
          <div className="space-y-4 py-4 text-center sm:py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">
                Tanya AI Pustakawan
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sebut buku pakai <strong>@</strong> atau tombol mention — bisa
                bahas sinopsis, review, kutipan, dan progress baca kamu.
              </p>
            </div>
            {configured ? (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {bookSuggestion && (
                  <button
                    type="button"
                    onClick={() => sendMessage(bookSuggestion)}
                    className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-left text-xs text-foreground transition hover:bg-primary/15 sm:text-sm"
                  >
                    {bookSuggestion}
                  </button>
                )}
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-foreground transition hover:border-primary/40 hover:bg-primary/5 sm:text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                Set <code className="text-xs">OPENAI_API_KEY</code> di
                environment supaya AI Pustakawan aktif.
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[min(100%,34rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/80 bg-muted/40 text-foreground"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Lagi mikir…
            </div>
          </div>
        )}

        {error && (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="space-y-2 border-t border-border/80 p-4 sm:p-5">
        <AiBookMentionPicker
          books={mentionedBooks}
          onChange={setMentionedBooks}
          disabled={!configured || loading}
        />

        <form
          className="relative flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
        >
          {atQuery !== null && (
            <ul className="absolute bottom-full left-0 z-20 mb-2 max-h-40 w-full overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-lg">
              {atLoading && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Mencari…
                </li>
              )}
              {!atLoading && atQuery.trim() && atResults.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Buku tidak ketemu
                </li>
              )}
              {atResults.map((book) => (
                <li key={book.id}>
                  <button
                    type="button"
                    onClick={() => pickAtMention(book)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/70"
                  >
                    <span className="font-medium">{book.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {book.author}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              syncAtQuery(e.target.value);
            }}
            placeholder={
              configured
                ? "Tanya apa aja… ketik @ buat sebut buku"
                : "AI belum dikonfigurasi"
            }
            disabled={!configured || loading}
            rows={2}
            className="min-h-[2.75rem] resize-none rounded-2xl"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
              if (e.key === "Escape") {
                setAtQuery(null);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full"
            disabled={!configured || loading || !input.trim()}
            aria-label="Kirim pesan"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
