import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The Buddy Core — central animated AI identity.
 * States: idle | listening | thinking | processing | responding | warning | researching
 */
const STATE_CONFIG = {
  idle: { label: "IDLE", color: "#22d3ee", speed: 1 },
  listening: { label: "LISTENING", color: "#34d399", speed: 1.6 },
  thinking: { label: "THINKING", color: "#a78bfa", speed: 1.4 },
  processing: { label: "PROCESSING", color: "#60a5fa", speed: 2.2 },
  responding: { label: "RESPONDING", color: "#22d3ee", speed: 1.8 },
  speaking: { label: "SPEAKING", color: "#34d399", speed: 1.7 },
  warning: { label: "WARNING", color: "hsl(var(--destructive-foreground))", speed: 2.6 },
  researching: { label: "RESEARCHING", color: "#fbbf24", speed: 1.5 },
};

export default function BuddyCore({ state = "idle", level = 0, reduced = false }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;
  const pulse = reduced ? 0 : 1 + level * 0.6;

  const rings = useMemo(() => [0, 1, 2, 3], []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* Outer rotating rings */}
      {rings.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 160 + i * 45,
            height: 160 + i * 45,
            borderColor: `${cfg.color}40`,
            borderStyle: i % 2 === 0 ? "dashed" : "solid",
          }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: state === "processing" ? [1, 1.04, 1] : 1,
          }}
          transition={{
            rotate: { duration: 18 / cfg.speed + i * 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}

      {/* Tick marks ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 250, height: 250 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0 origin-bottom"
            style={{
              height: 125,
              transform: `rotate(${i * 6}deg)`,
              transformOrigin: "center 125px",
            }}
          >
            <div
              style={{
                width: i % 5 === 0 ? 2 : 1,
                height: i % 5 === 0 ? 10 : 5,
                background: `${cfg.color}${i % 5 === 0 ? "cc" : "55"}`,
                marginLeft: -1,
              }}
            />
          </div>
        ))}
      </motion.div>

      {/* Energy waves (listening/responding/speaking) */}
      {(state === "listening" || state === "responding" || state === "speaking") && !reduced && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`wave-${i}`}
              className="absolute rounded-full border-2"
              style={{ borderColor: cfg.color, width: 120, height: 120 }}
              animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
              transition={{
                duration: 2 / cfg.speed,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Core orb */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: 120,
          height: 120,
          background: `radial-gradient(circle at 35% 30%, ${cfg.color}, ${cfg.color}30 60%, transparent 75%)`,
          boxShadow: `0 0 60px ${cfg.color}80, inset 0 0 40px ${cfg.color}40`,
        }}
        animate={{
          scale: [1, 1 + pulse * 0.08, 1],
          opacity: [0.85, 1, 0.85],
        }}
        transition={{ duration: 2 / cfg.speed, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{ background: `radial-gradient(circle, #ffffff80, transparent 70%)` }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* State glyph */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-xs tracking-[0.3em] font-bold"
            style={{ color: "hsl(var(--card))", textShadow: `0 0 10px ${cfg.color}` }}
          >
            {cfg.label}
          </span>
        </div>
      </motion.div>

      {/* Scanning sweep for thinking/researching */}
      {(state === "thinking" || state === "researching") && (
        <motion.div
          className="absolute rounded-full overflow-hidden"
          style={{ width: 300, height: 300 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3 / cfg.speed, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${cfg.color}30 40deg, transparent 80deg)`,
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
