import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STAGES = ["USER REQUEST", "PLANNER", "RESEARCH", "CODING", "VERIFICATION", "FINAL RESULT"];

/**
 * Futuristic mission map shown when Buddy is executing a complex task.
 * A pulse travels along the pipeline as stages complete.
 */
export default function MissionMap({ active, state }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }
    const map = { thinking: 1, researching: 2, processing: 3, responding: 5, warning: 5 };
    setStage(map[state] ?? 1);
  }, [active, state]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="rounded-xl border border-amber-400/30 bg-slate-950/50 backdrop-blur-md p-3"
    >
      <div className="font-mono text-[10px] tracking-[0.25em] text-amber-300 mb-3 flex items-center gap-2">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-amber-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        ACTIVE MISSION
      </div>
      <div className="flex items-center gap-1 overflow-x-auto">
        {STAGES.map((s, i) => {
          const done = i < stage;
          const current = i === stage;
          return (
            <React.Fragment key={s}>
              <motion.div
                className="flex flex-col items-center gap-1 min-w-[88px]"
                animate={{ scale: current ? 1.08 : 1 }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center border font-mono text-[9px]"
                  style={{
                    borderColor: done ? "#34d399" : current ? "#fbbf24" : "hsl(var(--muted))",
                    background: done ? "#34d39920" : current ? "#fbbf2420" : "transparent",
                    color: done ? "#34d399" : current ? "#fbbf24" : "hsl(var(--muted-foreground))",
                    boxShadow: current ? "0 0 14px #fbbf2460" : "none",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className="font-mono text-[8px] tracking-wider whitespace-nowrap"
                  style={{ color: done ? "#34d399" : current ? "#fbbf24" : "hsl(var(--muted-foreground))" }}
                >
                  {s}
                </span>
              </motion.div>
              {i < STAGES.length - 1 && (
                <div className="flex-1 h-px min-w-[12px] relative" style={{ background: "#1e293b" }}>
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ background: "linear-gradient(90deg,#fbbf24,#34d399)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: i < stage ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}
