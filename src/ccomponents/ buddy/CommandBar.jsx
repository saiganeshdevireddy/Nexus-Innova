import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Paperclip, Globe, Loader2, Square } from "lucide-react";

/**
 * Futuristic command bar with typing, voice input, file upload, and web-search toggle.
 * Voice uses the browser SpeechRecognition API; waveform reacts to actual mic volume.
 */
export default function CommandBar({ onSend, listening, onToggleListen, disabled, reduced, mode = "chat" }) {
  const [text, setText] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const MODE_HINT = {
    chat: "Ask Buddy anything...",
    research: "Research a topic (web search ready)...",
    coding: "Describe code to write or debug...",
    science: "Ask about math or physics...",
    vision: "Attach an image or ask about a file...",
    task: "Describe a project to plan...",
  };
  const [levels, setLevels] = useState(Array(20).fill(0));
  const fileRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  // Live mic level -> waveform bars
  useEffect(() => {
    if (listening) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          src.connect(analyser);
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteFrequencyData(data);
            const bars = [];
            for (let i = 0; i < 20; i++) {
              const v = data[i * 2] / 255;
              bars.push(reduced ? v * 0.5 : v);
            }
            setLevels(bars);
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        } catch (_e) {
          // mic denied — fallback oscillation
          const tick = () => {
            setLevels((prev) => prev.map(() => Math.random() * 0.7));
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        }
      })();
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      setLevels(Array(20).fill(0));
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [listening, reduced]);

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend({ content: text.trim(), webSearch });
    setText("");
  };

  return (
    <div className="relative">
      {/* Waveform */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 44 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-end justify-center gap-1 mb-2 h-11"
          >
            {levels.map((v, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-cyan-300"
                animate={{ height: `${Math.max(4, v * 40)}px` }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative flex items-center gap-2 rounded-2xl border bg-slate-950/60 backdrop-blur-md px-3 py-2.5"
        style={{ borderColor: listening ? "#34d39980" : "#22d3ee40", boxShadow: "0 0 30px #22d3ee15" }}
      >
        {/* Mic */}
        <button
          onClick={onToggleListen}
          className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            listening ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-cyan-300"
          }`}
          title={listening ? "Stop listening" : "Voice input"}
        >
          {listening && (
            <motion.span
              className="absolute inset-0 rounded-xl border-2 border-emerald-400"
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          {listening ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={listening ? "Listening..." : MODE_HINT[mode] || "Ask Buddy anything..."}
          className="flex-1 bg-transparent outline-none text-sm text-cyan-50 placeholder:text-slate-500 font-mono"
        />

        {/* Web search toggle */}
        <button
          onClick={() => setWebSearch((v) => !v)}
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
            webSearch ? "text-amber-300 bg-amber-500/10" : "text-slate-500 hover:text-amber-300"
          }`}
          title="Web search"
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* Attach */}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-cyan-300 transition-all"
          title="Upload file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              onSend({ content: `Analyze this file: ${f.name}`, file: f, webSearch });
              e.target.value = "";
            }
          }}
        />

        {/* Send */}
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white disabled:opacity-30 transition-all hover:shadow-lg hover:shadow-cyan-500/30"
        >
          {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
