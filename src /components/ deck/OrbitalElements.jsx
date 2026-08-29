import React from "react";
import { motion } from "framer-motion";
import {
  Eye, Brain, Microscope, Mic, Wrench, ListChecks,
} from "lucide-react";

const MODULES = [
  { id: "vision", label: "VISION", icon: Eye, color: "#22d3ee" },
  { id: "memory", label: "MEMORY", icon: Brain, color: "#a78bfa" },
  { id: "research", label: "RESEARCH", icon: Microscope, color: "#fbbf24" },
  { id: "voice", label: "VOICE", icon: Mic, color: "#34d399" },
  { id: "tools", label: "TOOLS", icon: Wrench, color: "hsl(var(--card-foreground))" },
  { id: "tasks", label: "TASKS", icon: ListChecks, color: "#60a5fa" },
];

/**
 * Slowly orbiting module nodes around the Buddy Core.
 * Clicking a node fires onSelect(module).
 */
export default function OrbitalElements({ onSelect, reduced = false }) {
  const radius = 235;
  const dur = 70;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      animate={{ rotate: reduced ? 0 : 360 }}
      transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
    >
      {MODULES.map((m, i) => {
        const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const Icon = m.icon;
        return (
          <motion.button
            key={m.id}
            type="button"
            onClick={() => onSelect(m)}
            className="absolute pointer-events-auto group flex flex-col items-center gap-1"
            style={{ x, y }}
            animate={{ rotate: reduced ? 0 : -360 }}
            transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
            whileHover={{ scale: 1.18 }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md bg-slate-950/50 transition-all"
              style={{ borderColor: `${m.color}60`, boxShadow: `0 0 16px ${m.color}40` }}
            >
              <Icon className="w-4 h-4" style={{ color: m.color }} />
            </div>
            <span
              className="font-mono text-[8px] tracking-[0.2em] opacity-0 group-hover:opacity-100 transition"
              style={{ color: m.color }}
            >
              {m.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
