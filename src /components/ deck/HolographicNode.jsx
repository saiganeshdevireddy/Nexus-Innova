import React from "react";
import { motion } from "framer-motion";

/**
 * A floating holographic information node.
 * Draggable within the stage; click to expand into a larger panel.
 */
export default function HolographicNode({
  title, accent = "#22d3ee", icon: Icon, children, position, stageRef, expanded, onToggle, delay = 0,
}) {
  const posClass = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
  }[position] || "top-3 left-3";

  return (
    <motion.div
      drag
      dragConstraints={stageRef}
      dragElastic={0.15}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: expanded ? 1.12 : 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileDrag={{ scale: 1.05, zIndex: 50 }}
      onClick={onToggle}
      className={`absolute ${posClass} z-20 cursor-grab active:cursor-grabbing`}
      style={{ width: expanded ? 230 : 168, touchAction: "none" }}
    >
      <div
        className="relative rounded-xl backdrop-blur-md border bg-slate-950/50 overflow-hidden"
        style={{ borderColor: `${accent}40`, boxShadow: `0 0 24px ${accent}18, inset 0 0 20px ${accent}08` }}
      >
        {/* top scan line */}
        <motion.div
          className="absolute top-0 left-0 h-px"
          style={{ background: accent }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.7, delay: delay + 0.2 }}
        />
        {/* header */}
        <div className="flex items-center gap-2 px-2.5 py-2 border-b" style={{ borderColor: `${accent}25` }}>
          {Icon && (
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${accent}18` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
            </div>
          )}
          <span className="font-mono text-[10px] tracking-[0.2em] font-bold" style={{ color: accent }}>
            {title}
          </span>
          <motion.span
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ background: accent }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </div>
        {/* body */}
        <div className="p-2.5 text-[11px] font-mono text-slate-200/90">{children}</div>
      </div>
    </motion.div>
  );
}
