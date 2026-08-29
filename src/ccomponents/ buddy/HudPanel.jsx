import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Reusable glassmorphism HUD panel with animated corner brackets + neon border.
 */
export default function HudPanel({
  title,
  status,
  children,
  className,
  accent = "#22d3ee",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "relative rounded-xl backdrop-blur-md border bg-slate-950/40 overflow-hidden",
        className
      )}
      style={{ borderColor: `${accent}30`, boxShadow: `0 0 24px ${accent}10, inset 0 0 24px ${accent}08` }}
    >
      {/* Animated top border line */}
      <motion.div
        className="absolute top-0 left-0 h-px"
        style={{ background: accent }}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
      />

      {/* Corner brackets */}
      {[
        "top-0 left-0 border-t-2 border-l-2",
        "top-0 right-0 border-t-2 border-r-2",
        "bottom-0 left-0 border-b-2 border-l-2",
        "bottom-0 right-0 border-b-2 border-r-2",
      ].map((pos, i) => (
        <div
          key={i}
          className={cn("absolute w-3 h-3", pos)}
          style={{ borderColor: accent }}
        />
      ))}

      {/* Header */}
      {(title || status) && (
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: `${accent}20` }}>
          {title && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
              <span className="font-mono text-[10px] tracking-[0.25em] font-bold" style={{ color: accent }}>
                {title}
              </span>
            </div>
          )}
          {status && (
            <span className="font-mono text-[9px] tracking-widest text-slate-400">{status}</span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-3">{children}</div>
    </motion.div>
  );
}
