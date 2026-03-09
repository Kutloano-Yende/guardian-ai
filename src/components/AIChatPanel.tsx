import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth-provider";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const MODULE_MAP: Record<string, string> = {
  "/": "dashboard",
  "/assets": "assets",
  "/risks": "risks",
  "/incidents": "incidents",
  "/audits": "audits",
  "/compliance": "compliance",
  "/governance": "governance",
  "/actions": "actions",
  "/performance": "performance",
  "/documents": "documents",
  "/training": "training",
  "/admin": "admin",
};

const QUICK_PROMPTS = [
  "What are my top risks?",
  "Any overdue actions?",
  "Compliance status summary",
  "Predict risk escalation",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grc-ai-chat`;

export function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { session } = useAuth();
  const location = useLocation();

  const currentModule = MODULE_MAP[location.pathname] || "general";

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || streaming || !session) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setStreaming(true);

    // Add empty assistant message that will be filled by stream
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: userText,
          conversationHistory: newMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentModule,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ error: "Unknown error" }));
        if (resp.status === 429) toast.error("Rate limit exceeded. Please try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Please add credits.");
        else toast.error(data.error || "AI unavailable");

        setMessages((prev) => prev.slice(0, -1)); // remove empty assistant msg
        setStreaming(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              const finalContent = accumulated;
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === "assistant") {
                  updated[lastIdx] = { role: "assistant", content: finalContent, streaming: true };
                }
                return updated;
              });
            }
          } catch {
            // Incomplete JSON chunk — put back and wait for more
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":")) continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              const finalContent = accumulated;
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === "assistant") {
                  updated[lastIdx] = { role: "assistant", content: finalContent, streaming: true };
                }
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Mark stream complete
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === "assistant") {
          updated[lastIdx] = { ...updated[lastIdx], streaming: false };
        }
        return updated;
      });
    } catch (err: any) {
      if (err.name === "AbortError") return;
      toast.error("Connection lost. Please try again.");
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === "assistant" && updated[lastIdx].content === "") {
          return updated.slice(0, -1);
        }
        return updated;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, session, messages, currentModule]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const cancelStream = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const clearChat = () => {
    cancelStream();
    setMessages([]);
  };

  const panelWidth = expanded ? "w-[620px]" : "w-[400px]";
  const panelHeight = expanded ? "h-[640px]" : "h-[500px]";

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            title="Open GRC AI Assistant"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl text-white"
            style={{ background: "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))" }}
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 z-50 ${panelWidth} ${panelHeight} flex flex-col rounded-2xl overflow-hidden shadow-2xl border transition-all duration-200`}
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(24px)",
              borderColor: "rgba(255,255,255,0.10)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))" }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">GRC Shield AI</p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {currentModule.charAt(0).toUpperCase() + currentModule.slice(1)} module
                    {streaming && <span className="ml-1 text-emerald-400">● streaming</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Clear chat"
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/8 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors"
                >
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { cancelStream(); setOpen(false); }}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(211 65% 45% / 0.25), hsl(165 45% 45% / 0.25))" }}
                  >
                    <Bot className="w-6 h-6 text-white/60" />
                  </div>
                  <p className="text-sm font-semibold text-white/80">GRC Shield AI Assistant</p>
                  <p className="text-xs text-white/35 max-w-[260px] leading-relaxed">
                    Context-aware GRC advisor. Asks about risks, compliance, incidents, regulations, and more.
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-[11px] px-3 py-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition-all duration-150"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1"
                      style={{ background: "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))" }}
                    >
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-xl px-3 py-2.5 ${msg.role === "user" ? "text-white" : "text-white/90"}`}
                    style={{
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, hsl(211 65% 42%), hsl(211 65% 36%))"
                          : "rgba(255,255,255,0.05)",
                      border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        {msg.streaming && !msg.content ? (
                          <div className="flex items-center gap-1.5 py-0.5">
                            <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                            <span className="text-xs text-white/40">Thinking...</span>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-xs max-w-none text-white/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-white [&_h4]:text-xs [&_h4]:font-semibold [&_p]:text-xs [&_p]:leading-relaxed [&_li]:text-xs [&_li]:leading-relaxed [&_strong]:text-white [&_strong]:font-semibold [&_table]:text-xs [&_th]:text-white [&_th]:font-semibold [&_code]:text-emerald-300 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_a]:text-blue-300">
                            <ReactMarkdown key={i}>{typeof msg.content === "string" ? msg.content : ""}</ReactMarkdown>
                          </div>
                        )}
                        {msg.streaming && msg.content && (
                          <span className="inline-block w-1 h-3 bg-emerald-400 rounded-sm animate-pulse ml-0.5 align-middle" />
                        )}
                      </>
                    ) : (
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1 bg-white/8">
                      <User className="w-3 h-3 text-white/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about risks, compliance, incidents..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                  disabled={streaming}
                />
                {streaming ? (
                  <button
                    onClick={cancelStream}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    title="Stop generation"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className="p-1.5 rounded-lg transition-all disabled:opacity-20"
                    style={{
                      background: input.trim()
                        ? "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))"
                        : "transparent",
                    }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
