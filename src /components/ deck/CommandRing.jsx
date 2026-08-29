import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Eye, Search, Code2, FolderOpen, Database, Wrench, Settings,
} from "lucide-react";

const COMMANDS = [
  { id: "talk", label: "Talk", icon: MessageSquare, color: "#34d399" },
  { id: "vision", label: "Vision", icon: Eye, color: "#22d3ee" },
  { id: "research", label: "Research", icon: Search, color: "#fbbf24" },
  { id: "code", label: "Code", icon: Code2, color: "#60a5fa" },
  { id: "files", label: "Files", icon: FolderOpen, color: "hsl(var(--card-foreground))" },
  { id: "memory", label: "Memory", icon: Database, color: "#a78bfa" },
  { id: "tools", label: "Tools", icon: Wrench, color: "#fb923c" },
  { id: "settings", label: "Settings", icon: Settings, color: "#94a3b8" },
];

/**
 * Circular command menu around the Buddy Core.
 * Selecting a command rotates the ring to bring it to the top.
 */
export default function CommandRing({ selected, onSelect }) {
  const radius = 150;
  const step = 360 / COMMANDS.length;
  const rotation = selected != null ? -selected * step : 0;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      animate={{ rotate: rotation }}
      transition={{ type: "spring", stiffness: 60, damping: 14 }}
    >
      {COMMANDS.map((c, i) => {
        const angle = (i * step - 90) * (Math.PI / 180);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const Icon = c.icon;
        const isActive = selected === i;
        return (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => onSelect(i, c)}
            className="absolute pointer-events-auto flex flex-col items-center gap-1"
            style={{ x, y }}
            animate={{ rotate: -rotation }}
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
            whileHover={{ scale: 1.2 }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-all"
              style={{
                borderColor: isActive ? c.color : `${c.color}50`,
                background: isActive ? `${c.color}25` : "rgba(2,6,23,0.6)",
                boxShadow: isActive ? `0 0 20px ${c.color}` : `0 0 10px ${c.color}30`,
              }}
            >
              <Icon className="w-4 h-4" style={{ color: c.color }} />
            </div>
            <span
              className="font-mono text-[8px] tracking-[0.15em]"
              style={{ color: isActive ? c.color : "#64748b" }}
            >
              {c.label.toUpperCase()}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
