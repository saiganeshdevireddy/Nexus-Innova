import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, MemoryStick, Wifi, HardDrive, Activity } from "lucide-react";
import HudPanel from "./HudPanel";

/**
 * System status panel — simulated live metrics with smooth animated bars.
 */
function useMetric(base, variance, interval = 2000) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setVal(Math.max(5, Math.min(99, base + (Math.random() - 0.5) * variance)));
    }, interval);
    return () => clearInterval(id);
  }, [base, variance, interval]);
  return val;
}

function MetricBar({ icon: Icon, label, value, color }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Icon className="w-3 h-3" style={{ color }} />
          {label}
        </span>
        <span style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function SystemStatusPanel() {
  const cpu = useMetric(72, 18);
  const mem = useMetric(48, 12);
  const net = useMetric(81, 14);
  const disk = useMetric(34, 6);

  return (
    <HudPanel title="SYSTEM STATUS" status="ONLINE" accent="#22d3ee">
      <div className="space-y-2.5">
        <MetricBar icon={Cpu} label="CPU" value={cpu} color="#22d3ee" />
        <MetricBar icon={MemoryStick} label="MEMORY" value={mem} color="#a78bfa" />
        <MetricBar icon={Wifi} label="NETWORK" value={net} color="#34d399" />
        <MetricBar icon={HardDrive} label="STORAGE" value={disk} color="#fbbf24" />
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
            <Activity className="w-3 h-3 text-emerald-400" />
            UPTIME
          </span>
          <span className="text-[10px] font-mono text-emerald-400">99.97%</span>
        </div>
      </div>
    </HudPanel>
  );
}
