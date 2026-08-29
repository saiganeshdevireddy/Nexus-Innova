import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, UserCheck } from "lucide-react";

const ICONS = {
  success: { icon: CheckCircle2, color: "#34d399" },
  warning: { icon: AlertTriangle, color: "#fbbf24" },
  info: { icon: Info, color: "#22d3ee" },
  approval: { icon: UserCheck, color: "#a78bfa" },
};

/**
 * Subtle holographic notifications that appear near the Buddy Core and fade.
 */
export default function HoloNotifications({ items, onDismiss }) {
  useEffect(() => {
    const timers = items
      .filter((n) => !n.sticky)
      .map((n) => setTimeout(() => onDismiss(n.id), 3200));
    return () => timers.forEach(clearTimeout);
  }, [items, onDismiss]);

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 w-max max-w-[90%]">
      <AnimatePresence>
        {items.map((n) => {
          const cfg = ICONS[n.type] || ICONS.info;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md bg-slate-950/60 cursor-pointer"
              style={{ borderColor: `${cfg.color}50`, boxShadow: `0 0 16px ${cfg.color}30` }}
              onClick={() => onDismiss(n.id)}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              <span className="font-mono text-[10px] tracking-wider" style={{ color: cfg.color }}>
                {n.text}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
