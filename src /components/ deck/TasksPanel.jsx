import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUS_COLOR = {
  planning: "#94a3b8",
  in_progress: "#22d3ee",
  completed: "#34d399",
  paused: "#fbbf24",
};

/**
 * Tasks workspace — persistent autonomous task engine.
 * View, create, progress, and delete multi-step tasks.
 */
export default function TasksPanel({ open, onClose, refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Task.list("-created_date", 50);
      setTasks(data);
    } catch (_e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load, refreshKey]);

  const toggleStep = async (task, idx) => {
    const steps = task.steps.map((s, i) =>
      i === idx ? { ...s, status: s.status === "done" ? "pending" : "done" } : s
    );
    const done = steps.filter((s) => s.status === "done").length;
    const progress = steps.length ? Math.round((done / steps.length) * 100) : 0;
    const status = progress === 100 ? "completed" : "in_progress";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, steps, progress, status } : t)));
    try {
      await base44.entities.Task.update(task.id, { steps, progress, status });
    } catch (_e) {}
  };

  const createTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await base44.entities.Task.create({
        title: newTitle.trim(),
        goal: newTitle.trim(),
        steps: [
          { label: "Define requirements", status: "pending" },
          { label: "Execute", status: "pending" },
          { label: "Verify", status: "pending" },
        ],
        status: "planning",
        progress: 0,
        mode: "task",
        tools_used: [],
        verification_state: "pending",
      });
      setNewTitle("");
      load();
    } catch (_e) {}
  };

  const deleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try { await base44.entities.Task.delete(id); } catch (_e) {}
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-xl overflow-hidden"
            style={{ boxShadow: "0 0 50px #22d3ee30" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="font-mono text-sm tracking-[0.2em] text-cyan-300">TASK ENGINE</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-cyan-300 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* new task */}
            <div className="flex gap-2 p-3 border-b border-slate-800/60">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createTask()}
                placeholder="New task goal..."
                className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-50 font-mono outline-none focus:border-cyan-500/60"
              />
              <button
                onClick={createTask}
                className="flex items-center gap-1 px-3 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-mono hover:bg-cyan-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" /> ADD
              </button>
            </div>

            {/* list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {loading ? (
                <div className="flex justify-center py-8 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-10 font-mono text-xs text-slate-500">
                  No tasks yet. Ask Buddy to "build" or "plan" something, or add one above.
                </div>
              ) : (
                tasks.map((t) => {
                  const color = STATUS_COLOR[t.status] || "#94a3b8";
                  return (
                    <div
                      key={t.id}
                      className="rounded-xl border bg-slate-900/50 p-3"
                      style={{ borderColor: `${color}30` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-slate-100 truncate">{t.title}</div>
                          <div className="font-mono text-[9px] tracking-wider mt-0.5" style={{ color }}>
                            {t.status.toUpperCase()} · {t.progress}%
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="text-slate-600 hover:text-rose-400 transition flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* progress */}
                      <div className="h-1 mt-2 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                          animate={{ width: `${t.progress}%` }}
                        />
                      </div>
                      {/* steps */}
                      {Array.isArray(t.steps) && t.steps.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          {t.steps.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => toggleStep(t, i)}
                              className="flex items-center gap-2 w-full text-left group"
                            >
                              {s.status === "done" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 flex-shrink-0" />
                              )}
                              <span
                                className={`font-mono text-[11px] ${
                                  s.status === "done" ? "text-emerald-400/80 line-through" : "text-slate-300"
                                }`}
                              >
                                {s.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
