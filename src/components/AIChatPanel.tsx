import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-provider";
import { useLocation } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
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

export function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const location = useLocation();

  const currentModule = MODULE_MAP[location.pathname] || "general";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !session) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("grc-ai-chat", {
        body: {
          message: userMsg,
          conversationHistory: newMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentModule,
        },
      });

      if (error) throw error;
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm unable to respond right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, session, messages, currentModule]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render markdown-lite (bold, bullets, headings)
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-sm mt-3 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith("# ")) return <h2 key={i} className="font-bold text-base mt-3 mb-1">{line.slice(2)}</h2>;
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const content = line.slice(2);
        return <li key={i} className="ml-4 text-xs leading-relaxed list-disc">{renderInline(content)}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-xs leading-relaxed">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const panelWidth = expanded ? "w-[600px]" : "w-[380px]";
  const panelHeight = expanded ? "h-[600px]" : "h-[480px]";

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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 ${panelWidth} ${panelHeight} flex flex-col rounded-2xl overflow-hidden shadow-2xl border`}
            style={{
              background: "rgba(30, 41, 59, 0.92)",
              backdropFilter: "blur(24px)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))" }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">GRC Shield AI</p>
                  <p className="text-[10px] text-white/50">
                    Context: {currentModule.charAt(0).toUpperCase() + currentModule.slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(211 65% 45% / 0.3), hsl(165 45% 45% / 0.3))" }}
                  >
                    <Bot className="w-6 h-6 text-white/70" />
                  </div>
                  <p className="text-sm text-white/70 font-medium">GRC Shield AI Assistant</p>
                  <p className="text-xs text-white/40 max-w-[240px]">
                    Ask about risks, compliance, incidents, or any GRC topic. I have full context of your data.
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                    {[
                      "What are my top risks?",
                      "Any overdue actions?",
                      "Compliance status summary",
                      "Predict risk escalation",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-[10px] px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
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
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))" }}
                    >
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      msg.role === "user"
                        ? "text-white"
                        : "text-white/90"
                    }`}
                    style={{
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, hsl(211 65% 45%), hsl(211 65% 40%))"
                          : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {msg.role === "assistant" ? renderContent(msg.content) : (
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-white/10">
                      <User className="w-3 h-3 text-white/70" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-start">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))" }}
                  >
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Loader2 className="w-3 h-3 text-white/50 animate-spin" />
                    <span className="text-xs text-white/50">Analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about risks, compliance, incidents..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: input.trim() ? "linear-gradient(135deg, hsl(211 65% 45%), hsl(165 45% 45%))" : "transparent" }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
