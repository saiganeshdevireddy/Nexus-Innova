import React from "react";
import { motion } from "framer-motion";

/**
 * Animated data-stream lines connecting the four corner nodes to the core.
 * Pure SVG — lightweight.
 */
export default function DataStreams({ accent = "#22d3ee", energy = 0.3 }) {
  const corners = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 0, y: 100 },
    { x: 100, y: 100 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      {corners.map((c, i) => {
        const midX = c.x + (50 - c.x) * 0.5;
        const midY = c.y + (50 - c.y) * 0.5;
        return (
          <g key={i}>
            <path
              d={`M ${c.x} ${c.y} Q ${midX} ${midY} 50 50`}
              fill="none"
              stroke={`${accent}20`}
              strokeWidth="0.3"
            />
            <motion.circle
              r="0.7"
              fill={accent}
              initial={{ opacity: 0 }}
              animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 0.9, 0] }}
              transition={{ duration: 2.5 / (0.5 + energy), repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
              style={{ offsetPath: `path("M ${c.x} ${c.y} Q ${midX} ${midY} 50 50")` }}
            />
          </g>
        );
      })}
    </svg>
  );
}
