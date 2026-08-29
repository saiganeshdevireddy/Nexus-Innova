import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Cpu, ArrowDown } from "lucide-react";

/**
 * Chat log with smart auto-scroll:
 *  - follows new messages only when the user is near the bottom
 *  - stops auto-scrolling when the user scrolls up to read history
 *  - shows a "New messages" button to jump back to the latest
 *  - scrolls within its own container (never the page)
 */
export default function ChatLog({ messages, thinking }) {
  const scrollRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setAtBottom(true);
    setShowJump(false);
  }, []);

  const handleScroll = useCallback(() => {
    const near = isNearBottom();
    setAtBottom(near);
    if (near) setShowJump(false);
  }, [isNearBottom]);

  // On new content: follow if at bottom, otherwise surface the jump button.
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom(true);
    } else {
      setShowJump(true);
    }
  }, [messages, thinking, isNearBottom, scrollToBottom]);

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overflow-x-hidden pr-1"
        style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: m.role === "user" ? 20 : -20, y: 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border ${
                    m.role === "user"
                      ? "bg-violet-500/10 border-violet-400/40 text-violet-300"
                      : "bg-cyan-500/10 border-cyan-400/40 text-cyan-300"
                  }`}
                >
                  {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed break-words ${
                    m.role === "user"
                      ? "bg-violet-500/10 border border-violet-400/20 text-violet-50"
                      : "bg-slate-900/60 border border-cyan-400/20 text-cyan-50"
                  }`}
                >
                  <div className="font-mono text-[9px] tracking-widest mb-1 opacity-60">
                    {m.role === "user" ? "USER" : "BUDDY"}
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border bg-cyan-500/10 border-cyan-400/40 text-cyan-300">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="rounded-xl px-3 py-2 bg-slate-900/60 border border-cyan-400/20">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-cyan-300"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div className="h-1 flex-shrink-0" />
        </div>
      </div>

      <AnimatePresence>
        {showJump && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => scrollToBottom(true)}
            className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/90 text-slate-950 text-[11px] font-mono font-bold shadow-lg hover:bg-cyan-400 transition z-10"
          >
            <ArrowDown className="w-3 h-3" /> New messages
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
