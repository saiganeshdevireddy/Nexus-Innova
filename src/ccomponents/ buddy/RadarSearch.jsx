import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Radar search visualization shown while Buddy is "searching/analyzing/verifying".
 */
const STAGES = ["SEARCHING", "ANALYZING", "VERIFYING", "RESULT READY"];

export default function RadarSearch({ active }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }
    setStage(0);
    const id = setInterval(() => {
      setStage((s) => Math.min(STAGES.length - 1, s + 1));
    }, 900);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-40 h-40">
        {/* Radar rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-amber-400/30"
            style={{
              inset: i * 22,
            }}
          />
        ))}
        {/* Crosshair */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-amber-400/20 -translate-x-1/2" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-amber-400/20 -translate-y-1/2" />
        {/* Sweep */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.35) 50deg, transparent 60deg)" }}
          />
        </motion.div>
        {/* Blips */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-300"
            style={{ left: `${30 + i * 20}%`, top: `${40 + (i % 2) * 30}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="font-mono text-xs tracking-[0.3em] font-bold"
            style={{ color: stage === 3 ? "#34d399" : "#fbbf24" }}
          >
            {STAGES[stage]}
          </motion.div>
        </AnimatePresence>
        <div className="mt-1 font-mono text-[9px] text-slate-500 tracking-widest">
          {stage < 3 ? "↓" : "✓"} {stage < 3 ? STAGES[stage + 1] : "COMPLETE"}
        </div>
      </div>
    </motion.div>
  );
}
