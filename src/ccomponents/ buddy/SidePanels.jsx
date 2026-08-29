import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Cloud, Bell, ListChecks, Radio } from "lucide-react";
import HudPanel from "./HudPanel";

function ClockPanel() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <HudPanel title="CHRONOS" accent="#34d399" delay={0.1}>
      <div className="text-center">
        <div className="font-mono text-2xl tracking-wider text-emerald-300">
          {now.toLocaleTimeString("en-GB")}
        </div>
        <div className="font-mono text-[10px] text-slate-400 tracking-widest mt-1">
          {now.toDateString().toUpperCase()}
        </div>
      </div>
    </HudPanel>
  );
}

function TaskPanel({ state }) {
  const tasks = {
    idle: ["Awaiting directive", "Monitoring systems"],
    thinking: ["Reasoning engine active", "Neural routing"],
    listening: ["Audio capture", "Speech decoding"],
    researching: ["Literature scan", "Source verification"],
    processing: ["Multi-agent dispatch", "Compute allocation"],
    responding: ["Synthesizing reply", "Voice render"],
    warning: ["Diagnostics", "Error recovery"],
  };
  const list = tasks[state] || tasks.idle;
  return (
    <HudPanel title="CURRENT TASK" status={state.toUpperCase()} accent="#60a5fa" delay={0.15}>
      <div className="space-y-1.5">
        {list.map((t, i) => (
          <div key={t} className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
            {t}
          </div>
        ))}
      </div>
    </HudPanel>
  );
}

function NotificationsPanel() {
  const notes = [
    { t: "Memory subsystem synced", c: "#a78bfa" },
    { t: "Neural net warmed up", c: "#22d3ee" },
    { t: "Voice channel ready", c: "#34d399" },
  ];
  return (
    <HudPanel title="NOTIFICATIONS" status="3 NEW" accent="#fbbf24" delay={0.2}>
      <div className="space-y-1.5">
        {notes.map((n) => (
          <div key={n.t} className="flex items-center gap-2 text-[11px] text-slate-300">
            <Bell className="w-3 h-3" style={{ color: n.c }} />
            {n.t}
          </div>
        ))}
      </div>
    </HudPanel>
  );
}

export default function SidePanels({ state }) {
  return (
    <div className="space-y-3">
      <ClockPanel />
      <TaskPanel state={state} />
      <NotificationsPanel />
    </div>
  );
}
