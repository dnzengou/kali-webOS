import { useState, useEffect, useRef } from "react";
import { Check, Plus, Trash2, ChevronUp, ChevronDown, X, Tag } from "lucide-react";

type Priority = "high" | "medium" | "low";
type Filter   = "all" | "active" | "done";

interface Task {
  id:       number;
  text:     string;
  done:     boolean;
  priority: Priority;
  tag:      string;
  due:      string; // ISO date string or ""
  created:  number;
}

const PRIORITIES: Record<Priority, { label: string; color: string; dot: string }> = {
  high:   { label: "High",   color: "#f87171", dot: "#ef4444" },
  medium: { label: "Med",    color: "#fb923c", dot: "#f97316" },
  low:    { label: "Low",    color: "#4ade80", dot: "#22c55e" },
};

const TAGS = ["Security", "Dev", "Personal", "Research", "Ops", "Bug"];

const DEFAULTS: Task[] = [
  { id: 1, text: "Scan target network for open ports", done: false, priority: "high",   tag: "Security", due: "", created: Date.now() - 5 },
  { id: 2, text: "Update exploit database",            done: true,  priority: "medium", tag: "Ops",      due: "", created: Date.now() - 4 },
  { id: 3, text: "Run vulnerability assessment",       done: false, priority: "high",   tag: "Security", due: "", created: Date.now() - 3 },
  { id: 4, text: "Refactor auth middleware",           done: false, priority: "medium", tag: "Dev",      due: "", created: Date.now() - 2 },
  { id: 5, text: "Document recon findings",            done: false, priority: "low",    tag: "Research", due: "", created: Date.now() - 1 },
];

function load(): Task[] {
  try {
    const raw = localStorage.getItem("kali-todos");
    return raw ? JSON.parse(raw) : DEFAULTS;
  } catch { return DEFAULTS; }
}

function save(tasks: Task[]) {
  localStorage.setItem("kali-todos", JSON.stringify(tasks));
}

export default function Todo() {
  const [tasks,    setTasks]    = useState<Task[]>(load);
  const [filter,   setFilter]   = useState<Filter>("all");
  const [tagF,     setTagF]     = useState<string>("all");
  const [input,    setInput]    = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tag,      setTag]      = useState("Personal");
  const [due,      setDue]      = useState("");
  const [editId,   setEditId]   = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => { save(tasks); }, [tasks]);
  useEffect(() => { if (editId !== null) editRef.current?.focus(); }, [editId]);

  const update = (fn: (t: Task[]) => Task[]) => setTasks((p) => fn(p));

  const addTask = () => {
    if (!input.trim()) return;
    update((p) => [...p, { id: Date.now(), text: input.trim(), done: false, priority, tag, due, created: Date.now() }]);
    setInput(""); setDue("");
  };

  const toggle = (id: number) => update((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: number) => update((p) => p.filter((t) => t.id !== id));

  const move = (id: number, dir: -1 | 1) => {
    update((p) => {
      const idx = p.findIndex((t) => t.id === id);
      const next = idx + dir;
      if (next < 0 || next >= p.length) return p;
      const arr = [...p];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const commitEdit = (id: number) => {
    if (editText.trim()) update((p) => p.map((t) => t.id === id ? { ...t, text: editText.trim() } : t));
    setEditId(null);
  };

  const allTags = ["all", ...Array.from(new Set(tasks.map((t) => t.tag)))];

  const visible = tasks.filter((t) => {
    if (filter === "active" && t.done)  return false;
    if (filter === "done"   && !t.done) return false;
    if (tagF !== "all" && t.tag !== tagF) return false;
    return true;
  });

  const done  = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const isOverdue = (due: string) => due && new Date(due) < new Date() && new Date(due).toDateString() !== new Date().toDateString();

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0a0e" }}>

      {/* Progress header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-white/50">{done} of {total} completed</span>
          <span className="text-[12px] font-semibold" style={{ color: "#a855f7" }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#9b59b6,#a855f7)" }} />
        </div>
      </div>

      {/* Add task row */}
      <div className="px-3 pb-2 shrink-0 space-y-1.5">
        <div className="flex gap-1.5">
          <input
            className="flex-1 rounded-xl px-3 py-2 text-[13px] text-white placeholder-white/25 outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
            placeholder="Add a task… (Enter)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(155,89,182,0.6)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
          <button onClick={addTask}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#9b59b6,#7c3aed)", boxShadow: "0 2px 12px rgba(155,89,182,0.35)" }}>
            <Plus size={16} />
          </button>
        </div>

        {/* Priority + tag + due */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.entries(PRIORITIES) as [Priority, typeof PRIORITIES[Priority]][]).map(([p, { label, color }]) => (
            <button key={p} onClick={() => setPriority(p)}
              className="text-[10px] px-2 py-0.5 rounded-full transition-all"
              style={{
                background: priority === p ? `${color}22` : "transparent",
                color: priority === p ? color : "rgba(255,255,255,0.3)",
                border: `1px solid ${priority === p ? color + "55" : "rgba(255,255,255,0.08)"}`,
              }}>{label}</button>
          ))}
          <div className="w-px h-3.5 bg-white/10 mx-0.5" />
          <select value={tag} onChange={(e) => setTag(e.target.value)}
            className="text-[10px] px-1.5 py-0.5 rounded-full outline-none cursor-pointer transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
            {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
            className="text-[10px] px-1.5 py-0.5 rounded-full outline-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", colorScheme: "dark" }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-3 pb-2 shrink-0 overflow-x-auto">
        {(["all", "active", "done"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] capitalize shrink-0 transition-all ${
              filter === f ? "bg-[#9b59b6] text-white" : "text-white/40 hover:text-white/70 hover:bg-white/6"
            }`}>{f}</button>
        ))}
        <div className="w-px h-3.5 bg-white/10 mx-1 shrink-0" />
        {allTags.map((t) => (
          <button key={t} onClick={() => setTagF(t)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] shrink-0 transition-all ${
              tagF === t ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
            style={{ background: tagF === t ? "rgba(168,85,247,0.18)" : "transparent", border: "1px solid rgba(255,255,255,0.06)" }}>
            {t !== "all" && <Tag size={9} />} {t}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto os-scrollbar px-3 pb-3 space-y-1">
        {visible.length === 0 && (
          <div className="h-full flex items-center justify-center text-white/20 text-[13px]">
            {filter === "done" ? "No completed tasks" : "Nothing to do 🎉"}
          </div>
        )}

        {visible.map((t, idx) => {
          const { color, dot } = PRIORITIES[t.priority];
          const overdue = isOverdue(t.due);

          return (
            <div key={t.id}
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl group transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>

              {/* Priority dot */}
              <div className="mt-1 shrink-0 w-2 h-2 rounded-full" style={{ background: dot }} />

              {/* Checkbox */}
              <button onClick={() => toggle(t.id)}
                className="mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all"
                style={{
                  border: t.done ? "none" : `1.5px solid ${color}60`,
                  background: t.done ? "#27ae60" : "transparent",
                }}>
                {t.done && <Check size={10} className="text-white" />}
              </button>

              {/* Text / edit */}
              <div className="flex-1 min-w-0">
                {editId === t.id ? (
                  <input ref={editRef} value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") commitEdit(t.id); }}
                    onBlur={() => commitEdit(t.id)}
                    className="w-full text-[13px] bg-transparent text-white outline-none border-b border-[#9b59b6]" />
                ) : (
                  <span onDoubleClick={() => { setEditId(t.id); setEditText(t.text); }}
                    className={`block text-[13px] leading-snug truncate cursor-default select-none ${t.done ? "line-through text-white/30" : "text-white/85"}`}>
                    {t.text}
                  </span>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>{t.tag}</span>
                  {t.due && (
                    <span className={`text-[9px] ${overdue ? "text-red-400" : "text-white/30"}`}>
                      {overdue ? "Overdue · " : ""}{new Date(t.due).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => move(t.id, -1)} disabled={idx === 0}
                  className="text-white/25 hover:text-white/70 disabled:opacity-10 transition-colors"><ChevronUp size={12} /></button>
                <button onClick={() => move(t.id, 1)} disabled={idx === visible.length - 1}
                  className="text-white/25 hover:text-white/70 disabled:opacity-10 transition-colors"><ChevronDown size={12} /></button>
              </div>
              <button onClick={() => remove(t.id)}
                className="opacity-0 group-hover:opacity-100 mt-0.5 text-white/20 hover:text-red-400 transition-all shrink-0">
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {tasks.some((t) => t.done) && (
        <div className="flex justify-end px-3 pb-3 shrink-0">
          <button onClick={() => update((p) => p.filter((t) => !t.done))}
            className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/8">
            <Trash2 size={11} /> Clear completed ({done})
          </button>
        </div>
      )}
    </div>
  );
}
