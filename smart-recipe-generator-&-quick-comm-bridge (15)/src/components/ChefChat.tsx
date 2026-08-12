import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What can I cook in 20 minutes?",
  "Substitute for kasuri methi?",
  "Make my dal restaurant-style",
];

export function ChefChat({ pantry, recipeTitle }: { pantry?: string[]; recipeTitle?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Namaste! I'm Annapurna. Tell me what's in your kitchen or what you're craving, and I'll sort out dinner.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/chef", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m.content).slice(-12),
          pantry: pantry ?? [],
          recipeTitle,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "The chef is busy. Try again.");
      }

      const result = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The chef is busy. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
      >
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        {open ? "Close" : "Ask the chef"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-3 z-50 flex h-[70vh] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900/95 backdrop-blur shadow-2xl">
          <div className="flex items-center gap-2 border-b border-zinc-700 px-4 py-3 bg-zinc-950/80">
            <Sparkles className="size-4 text-orange-400" />
            <div>
              <p className="text-sm font-semibold text-white">Annapurna AI</p>
              <p className="text-[11px] text-zinc-400">
                {recipeTitle ? `Context: ${recipeTitle}` : "Knows your pantry"}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs sm:text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-orange-500 text-white font-medium shadow-xs"
                    : "bg-zinc-800 text-zinc-100 border border-zinc-700/60"
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="w-24 overflow-hidden rounded-2xl bg-zinc-800 px-3 py-2">
                <span className="block h-1 w-8 rounded-full bg-orange-400 animate-pulse" />
              </div>
            )}
            {error && <p className="text-xs text-red-400 px-1">{error}</p>}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-dashed border-zinc-600 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-zinc-700 p-3 bg-zinc-950/80">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(input)}
              placeholder="Ask anything about cooking…"
              className="flex-1 rounded-2xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-400 outline-none focus:border-orange-400"
            />
            <button
              onClick={() => ask(input)}
              disabled={busy}
              className="grid size-9 place-items-center rounded-2xl bg-orange-500 text-white disabled:opacity-50 hover:bg-orange-600 transition-colors cursor-pointer shrink-0"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
