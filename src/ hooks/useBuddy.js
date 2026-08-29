import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Central Buddy AI orchestration hook.
 * Manages conversation, AI state, mode (agent selection), voice I/O, and file/vision uploads.
 *
 * States: idle | listening | thinking | processing | responding | speaking | researching | warning
 */
export function useBuddy({ voiceOutput = true, onMemoryChange, onTaskChange } = {}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "buddy",
      content: "Hey! I'm Buddy. 🤝 I can chat, research, write code, analyze images and files, and break big tasks into steps. What are we working on today?",
    },
  ]);
  const [state, setState] = useState("idle");
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [muted, setMuted] = useState(!voiceOutput);
  const [mode, setMode] = useState("chat");
  const [agent, setAgent] = useState("BUDDY CORE");

  const recogRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const stateRef = useRef("idle");

  // Keep a ref in sync so async TTS/STT callbacks read the latest state.
  const setBuddyState = useCallback((s) => {
    stateRef.current = s;
    setState(s);
  }, []);

  // Setup speech recognition once
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onresult = (e) => {
      let interim = "";
      let finalT = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalT += t;
        else interim += t;
      }
      finalTranscriptRef.current = (finalTranscriptRef.current + finalT).trim();
      if (interim) setLevel(Math.min(1, interim.length / 40));
    };
    recog.onend = () => {
      setListening(false);
      const text = finalTranscriptRef.current;
      finalTranscriptRef.current = "";
      if (text) {
        setBuddyState("processing");
        send({ content: text });
      } else {
        setBuddyState("idle");
        setLevel(0);
      }
    };
    recog.onerror = (e) => {
      setListening(false);
      setLevel(0);
      const err = e?.error || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: "buddy", content: "I couldn't access the microphone. Please check your browser permissions and try again." },
        ]);
      } else if (err === "no-speech") {
        setBuddyState("idle");
      } else if (err === "network") {
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: "buddy", content: "Hmm, the speech service lost its connection. Let's try that again." },
        ]);
        setBuddyState("idle");
      } else {
        setBuddyState("idle");
      }
    };
    recogRef.current = recog;
    return () => {
      try { recog.abort(); } catch (_e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopSpeak = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text) => {
      if (muted || !window.speechSynthesis || !text) return false;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.02;
        u.pitch = 1.0;
        u.onend = () => {
          if (stateRef.current === "speaking") setBuddyState("idle");
          setLevel(0);
        };
        u.onerror = () => {
          if (stateRef.current === "speaking") setBuddyState("idle");
          setLevel(0);
        };
        setBuddyState("speaking");
        window.speechSynthesis.speak(u);
        return true;
      } catch (_e) {
        return false;
      }
    },
    [muted, setBuddyState]
  );

  // Muting while speaking should stop playback immediately.
  useEffect(() => {
    if (muted) {
      stopSpeak();
      if (stateRef.current === "speaking") setBuddyState("idle");
    }
  }, [muted, stopSpeak, setBuddyState]);

  const toggleListen = useCallback(() => {
    if (!recogRef.current) {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "buddy", content: "Voice input isn't supported in this browser. Try Chrome or Edge, or just type to me." },
      ]);
      return;
    }
    if (listening) {
      recogRef.current.stop();
    } else {
      // Voice interruption: stop any ongoing TTS, then listen.
      stopSpeak();
      finalTranscriptRef.current = "";
      setListening(true);
      setBuddyState("listening");
      try { recogRef.current.start(); } catch (_e) {}
    }
  }, [listening, stopSpeak, setBuddyState]);

  const send = useCallback(
    async ({ content, webSearch = false, file = null }) => {
      const userMsg = { id: `u-${Date.now()}`, role: "user", content: file ? `${content} 📎` : content };
      setMessages((prev) => [...prev, userMsg]);
      setBuddyState(file ? "processing" : webSearch || mode === "research" ? "researching" : "thinking");
      setLevel(0.4);

      // Detect memory-save intent
      const lower = content.toLowerCase();
      if (lower.startsWith("remember ") || lower.includes("remember that ")) {
        try {
          await base44.entities.Memory.create({
            memory_type: "long_term",
            content: content.replace(/^(remember that |remember )/i, "").trim(),
            source: "user",
            importance: 0.7,
          });
          onMemoryChange?.();
        } catch (_e) {}
      }

      // Upload file if provided (vision / file intelligence)
      let fileUrl = null;
      let effectiveMode = mode;
      if (file) {
        try {
          const up = await base44.integrations.Core.UploadFile({ file });
          fileUrl = up.file_url;
          effectiveMode = "vision";
        } catch (_e) {}
      }

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.id !== "welcome")
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await base44.functions.invoke("buddyChat", {
          messages: history,
          web_search: webSearch,
          mode: effectiveMode,
          file_url: fileUrl,
        });
        const d = res?.data || {};
        const reply = d.response || "Hmm, I couldn't process that. Let's try again.";
        setAgent(d.agent || "BUDDY CORE");
        setLevel(0.7);

        let full = reply;
        if (Array.isArray(d.steps) && d.steps.length >= 2) {
          full = `Here's my plan:\n${d.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n${reply}`;
        }

        const buddyMsg = { id: `b-${Date.now()}`, role: "buddy", content: full, agent: d.agent };
        setMessages((prev) => [...prev, buddyMsg]);
        if (d.task_id) onTaskChange?.();

        // Voice output: if TTS plays, the "speaking" state resets to idle on end.
        const spoke = speak(reply);
        if (!spoke) {
          setBuddyState("responding");
          setTimeout(() => {
            if (stateRef.current === "responding") setBuddyState("idle");
            setLevel(0);
          }, 1200);
        }
      } catch (err) {
        setBuddyState("warning");
        setLevel(0);
        const errMsg = err?.response?.data?.error || err?.message || "Connection to core lost.";
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: "buddy", content: `Hmm, something went wrong there. ${errMsg}` },
        ]);
        setTimeout(() => setBuddyState("idle"), 2000);
      }
    },
    [messages, mode, speak, onMemoryChange, onTaskChange, setBuddyState]
  );

  return {
    messages, state, level, listening, muted, setMuted,
    send, toggleListen, stopSpeak, mode, setMode, agent,
  };
}
