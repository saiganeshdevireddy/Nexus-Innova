import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Trash2, Plus } from "lucide-react";
import HudPanel from "./HudPanel";
import { base44 } from "@/api/base44Client";

const TYPE_LABELS = {
  long_term: { label: "LONG-TERM", color: "#a78bfa" },
  knowledge: { label: "KNOWLEDGE", color: "#22d3ee" },
  project: { label: "PROJECT", color: "#fbbf24" },
  short_term: { label: "SHORT-TERM", color: "#34d399" },
};

export default function MemoryPanel({ refreshKey }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await base44.entities.Memory.list("-updated_date", 50);
      setMemories(data);
    } catch (_e) {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const remove = async (id) => {
    await base44.entities.Memory.delete(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <HudPanel title="MEMORY MATRIX" status={`${memories.length} ENTRIES`} accent="#a78bfa">
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {loading && <div className="text-[10px] font-mono text-slate-500">Loading memory...</div>}
        {!loading && memories.length === 0 && (
          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <Brain className="w-3 h-3" /> No stored memories yet.
          </div>
        )}
        {memories.map((m) => {
          const t = TYPE_LABELS[m.memory_type] || TYPE_LABELS.long_term;
          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="group relative rounded-lg border bg-slate-900/40 p-2 pr-7"
              style={{ borderColor: `${t.color}30` }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-mono text-[8px] tracking-widest px-1 rounded" style={{ color: t.color, background: `${t.color}15` }}>
                  {t.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-200 leading-snug line-clamp-2">{m.content}</div>
              <button
                onClick={() => remove(m.id)}
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </HudPanel>
  );
}
