import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, VolumeX, ScanLine, Zap, Cpu, Brain, Microscope, ListChecks,
} from "lucide-react";
import { useBuddy } from "@/hooks/useBuddy";
import GridBackground from "@/components/buddy/GridBackground";
import ParticleField from "@/components/buddy/ParticleField";
import BuddyCore from "@/components/buddy/BuddyCore";
import CommandBar from "@/components/buddy/CommandBar";
import ChatLog from "@/components/buddy/ChatLog";
import OrbitalElements from "@/components/deck/OrbitalElements";
import CommandRing from "@/components/deck/CommandRing";
import HolographicNode from "@/components/deck/HolographicNode";
import MissionMap from "@/components/deck/MissionMap";
import HoloNotifications from "@/components/deck/HoloNotifications";
import TasksPanel from "@/components/deck/TasksPanel";
import { base44 } from "@/api/base44Client";

const CMD_MODE = {
  talk: "chat", vision: "vision", research: "research", code: "coding",
  files: "vision", memory: "chat", tools: "chat", settings: "chat",
};
const MOD_MODE = {
  vision: "vision", memory: "chat", research: "research", voice: "chat", tools: "chat",
};
const MODE_LABEL = {
  chat: "BUDDY CORE", vision: "VISION AGENT", research: "RESEARCH AGENT",
  coding: "CODING AGENT", science: "SCIENCE AGENT", task: "PLANNING AGENT",
};

function MiniBar({ label, value, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px]">
        <span className="text-slate-400">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg,${color}80,${color})` }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [memoryKey, setMemoryKey] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [selectedCmd, setSelectedCmd] = useState(null);
  const [memCount, setMemCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  const stageRef = useRef(null);

  const addNotification = useCallback((n) => {
    setNotifications((prev) => [...prev, { id: `n-${Date.now()}-${Math.random()}`, ...n }]);
  }, []);
  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const { messages, state, level, listening, muted, setMuted, send, toggleListen, mode, setMode, agent } = useBuddy({
    voiceOutput: true,
    onMemoryChange: () => setMemoryKey((k) => k + 1),
    onTaskChange: () => setTaskRefreshKey((k) => k + 1),
  });

  // count memories for the MEMORY node
  useEffect(() => {
    base44.entities.Memory.list("-updated_date", 50)
      .then((d) => setMemCount(d.length))
      .catch(() => {});
  }, [memoryKey]);

  // state-driven holo notifications
  useEffect(() => {
    if (state === "responding") addNotification({ type: "success", text: "✓ TASK COMPLETED" });
    if (state === "warning") addNotification({ type: "warning", text: "⚠ VERIFICATION REQUIRED", sticky: true });
    if (state === "warning") {
      const id = setTimeout(() => addNotification({ type: "approval", text: "! USER APPROVAL REQUIRED", sticky: true }), 600);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleSelectCommand = (i, c) => {
    setSelectedCmd(i);
    const m = CMD_MODE[c.id] || "chat";
    setMode(m);
    addNotification({ type: "info", text: `● ${MODE_LABEL[m] || "BUDDY CORE"} ENGAGED` });
  };
  const handleSelectModule = (m) => {
    if (m.id === "tasks") {
      setTasksOpen(true);
      addNotification({ type: "info", text: "● OPENING TASK ENGINE" });
      return;
    }
    const mo = MOD_MODE[m.id] || "chat";
    setMode(mo);
    addNotification({ type: "info", text: `● ${m.label} NODE LINKED` });
  };

  const toggleNode = (id) => setExpanded((prev) => (prev === id ? null : id));

  const missionActive = ["thinking", "researching", "processing", "responding"].includes(state);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-body">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <GridBackground reduced={reduced} />
      <ParticleField energy={level} reduced={reduced} />

      {/* Header */}
      <header className="relative z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-cyan-500/20 backdrop-blur-sm bg-slate-950/40">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
            animate={{ boxShadow: ["0 0 10px #22d3ee80", "0 0 24px #22d3ee", "0 0 10px #22d3ee80"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="font-mono text-xs font-bold text-white">N</span>
          </motion.div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-[0.3em] text-cyan-300">NEXUS INNOVA</h1>
            <div className="font-mono text-[9px] tracking-widest text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              HOLOGRAPHIC COMMAND DECK · ONLINE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReduced((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider border transition ${
              reduced ? "bg-cyan-500/20 border-cyan-400 text-cyan-200" : "border-slate-700 text-slate-400 hover:text-cyan-300"
            }`}
          >
            <ScanLine className="w-3 h-3" /> {reduced ? "LITE" : "FX"}
          </button>
          <button
            onClick={() => setMuted((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider border transition ${
              muted ? "border-slate-700 text-slate-500" : "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
            }`}
          >
            {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />} VOICE
          </button>
          <button
            onClick={() => setTasksOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider border border-slate-700 text-slate-400 hover:text-cyan-300 transition"
          >
            <ListChecks className="w-3 h-3" /> TASKS
          </button>
          <button
            onClick={() => setShowChat((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider border border-slate-700 text-slate-400 hover:text-cyan-300 transition"
          >
            <Zap className="w-3 h-3" /> LOG
          </button>
        </div>
      </header>

      {/* Status strip */}
      <div className="relative z-10 flex items-center justify-center gap-4 py-1.5 border-b border-cyan-500/10 font-mono text-[9px] tracking-[0.25em] text-slate-500">
        <span>STATUS</span>
        <span style={{ color: "#22d3ee" }}>●</span>
        <span className="text-cyan-300">{state.toUpperCase()}</span>
        <span className="text-slate-700">|</span>
        <span style={{ color: "#a78bfa" }}>{(agent || MODE_LABEL[mode] || "BUDDY CORE")}</span>
        <span className="text-slate-700">|</span>
        <span>CORE TEMP 38°C</span>
        <span className="text-slate-700">|</span>
        <span>AGENTS: 8 ONLINE</span>
      </div>

      {/* Central stage */}
      <div ref={stageRef} className="relative z-10 mx-auto max-w-5xl h-[560px] sm:h-[600px]">
        {/* Holographic nodes */}
        <HolographicNode
          title="SYSTEM" accent="#22d3ee" icon={Cpu} position="top-left" stageRef={stageRef}
          expanded={expanded === "system"} onToggle={() => toggleNode("system")} delay={0.1}
        >
          <div className="space-y-1.5">
            <MiniBar label="CPU" value={72} color="#22d3ee" />
            <MiniBar label="RAM" value={48} color="#a78bfa" />
            <MiniBar label="GPU" value={63} color="#34d399" />
            <MiniBar label="NET" value={81} color="#fbbf24" />
          </div>
        </HolographicNode>

        <HolographicNode
          title="MEMORY" accent="#a78bfa" icon={Brain} position="top-right" stageRef={stageRef}
          expanded={expanded === "memory"} onToggle={() => toggleNode("memory")} delay={0.2}
        >
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-slate-400">CONTEXT</span><span className="text-violet-300">{messages.length} MSG</span></div>
            <div className="flex justify-between"><span className="text-slate-400">KNOWLEDGE</span><span className="text-violet-300">{memCount} ENTRIES</span></div>
            <div className="flex justify-between"><span className="text-slate-400">PROJECTS</span><span className="text-violet-300">1 ACTIVE</span></div>
          </div>
        </HolographicNode>

        <HolographicNode
          title="RESEARCH" accent="#fbbf24" icon={Microscope} position="bottom-left" stageRef={stageRef}
          expanded={expanded === "research"} onToggle={() => toggleNode("research")} delay={0.3}
        >
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-slate-400">TOPIC</span><span className="text-amber-300">{state === "researching" ? "ACTIVE" : "IDLE"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">SOURCES</span><span className="text-amber-300">12</span></div>
            <div className="flex justify-between"><span className="text-slate-400">CONFIDENCE</span><span className="text-amber-300">{state === "researching" ? "87%" : "—"}</span></div>
          </div>
        </HolographicNode>

        <HolographicNode
          title="TASK" accent="#60a5fa" icon={ListChecks} position="bottom-right" stageRef={stageRef}
          expanded={expanded === "task"} onToggle={() => toggleNode("task")} delay={0.4}
        >
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-slate-400">CURRENT</span><span className="text-blue-300">{state.toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">PROGRESS</span><span className="text-blue-300">{missionActive ? "67%" : "0%"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">STATUS</span><span className="text-blue-300">NOMINAL</span></div>
          </div>
        </HolographicNode>

        {/* Center: command ring + core + orbitals + notifications */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[360px] h-[360px] flex items-center justify-center">
            <OrbitalElements onSelect={handleSelectModule} reduced={reduced} />
            <CommandRing selected={selectedCmd} onSelect={handleSelectCommand} />
            <HoloNotifications items={notifications} onDismiss={dismissNotification} />
            <BuddyCore state={state} level={level} reduced={reduced} />
          </div>
        </div>
      </div>

      {/* Active mission */}
      <div className="relative z-10 mx-auto max-w-3xl px-4">
        <AnimatePresence>
          {missionActive && <MissionMap active={missionActive} state={state} />}
        </AnimatePresence>
      </div>

      {/* Command console */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-6 pt-3 space-y-2">
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-cyan-500/20 bg-slate-950/50 backdrop-blur-md p-3" style={{ height: 200 }}>
                <ChatLog messages={messages} thinking={state === "thinking" || state === "processing" || state === "researching"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <CommandBar
          onSend={send}
          listening={listening}
          onToggleListen={toggleListen}
          disabled={state === "thinking" || state === "processing" || state === "researching"}
          reduced={reduced}
          mode={mode}
        />
        <p className="text-center font-mono text-[9px] text-slate-500 tracking-widest">
          TRY: "REMEMBER THAT I PREFER CONCISE ANSWERS" · "EXPLAIN QUANTUM ENTANGLEMENT" · ENABLE 🌍 FOR WEB SEARCH
        </p>
      </div>

      <TasksPanel open={tasksOpen} onClose={() => setTasksOpen(false)} refreshKey={taskRefreshKey} />
    </div>
  );
}
