import { useState, useEffect, useCallback } from "react";
import { Pin, PinOff, Plus, X } from "lucide-react";

interface Note {
  id:      number;
  title:   string;
  body:    string;
  color:   string;
  pinned:  boolean;
  created: number;
}

const PALETTE = [
  { bg: "#2d2040", accent: "#c084fc", name: "Purple" },
  { bg: "#1a2a3a", accent: "#60a5fa", name: "Blue"   },
  { bg: "#1a2e1a", accent: "#4ade80", name: "Green"  },
  { bg: "#2e1a1a", accent: "#f87171", name: "Red"    },
  { bg: "#2a2010", accent: "#fb923c", name: "Orange" },
  { bg: "#1a2828", accent: "#2dd4bf", name: "Teal"   },
  { bg: "#251d35", accent: "#a78bfa", name: "Violet" },
  { bg: "#2a1f10", accent: "#facc15", name: "Yellow" },
];

const DEFAULTS: Note[] = [
  { id: 1, title: "Recon", body: "Run nmap on 192.168.1.0/24\nCheck for SMB shares\nEnumerate DNS", color: PALETTE[0].bg, pinned: true,  created: Date.now() - 7200000 },
  { id: 2, title: "Ideas",  body: "Try XSS on login form\nSQL injection on search params", color: PALETTE[3].bg, pinned: false, created: Date.now() - 3600000 },
  { id: 3, title: "Setup",  body: "Update Metasploit\nSync exploitdb\nConfigure proxychains", color: PALETTE[1].bg, pinned: false, created: Date.now() - 1800000 },
];

function load(): Note[] {
  try { const r = localStorage.getItem("kali-stickies"); return r ? JSON.parse(r) : DEFAULTS; }
  catch { return DEFAULTS; }
}

function fmtAge(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

function getAccent(bg: string) {
  return PALETTE.find((p) => p.bg === bg)?.accent ?? "#a855f7";
}

export default function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>(load);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => { localStorage.setItem("kali-stickies", JSON.stringify(notes)); }, [notes]);

  const update = useCallback((id: number, patch: Partial<Note>) =>
    setNotes((p) => p.map((n) => n.id === id ? { ...n, ...patch } : n)), []);

  const addNote = (color: string) =>
    setNotes((p) => [...p, { id: Date.now(), title: "", body: "", color, pinned: false, created: Date.now() }]);

  const del = (id: number) => setNotes((p) => p.filter((n) => n.id !== id));

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.created - a.created;
  });

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0a0e" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0 flex-wrap">
        <span className="text-[11px] text-white/30 mr-1">New note:</span>
        {PALETTE.map(({ bg, accent, name }) => (
          <button key={bg} title={name} onClick={() => addNote(bg)}
            className="group relative w-6 h-6 rounded-full transition-all hover:scale-110 active:scale-95"
            style={{ background: bg, border: `2px solid ${accent}55`, boxShadow: `0 0 0 0 ${accent}` }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}88`)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")}>
            <Plus size={10} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100" style={{ color: accent }} />
          </button>
        ))}
        <span className="ml-auto text-[10px] text-white/20">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto os-scrollbar p-3">
        {notes.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-white/20">
            <span className="text-[32px]">📝</span>
            <span className="text-[13px]">Click a color above to create a note</span>
          </div>
        )}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {sorted.map((note) => {
            const accent = getAccent(note.color);
            const isHov  = hovered === note.id;
            return (
              <div key={note.id}
                className="rounded-2xl flex flex-col transition-all duration-150"
                style={{
                  background: note.color,
                  border: `1px solid ${accent}33`,
                  boxShadow: note.pinned ? `0 0 0 1px ${accent}55, 0 4px 20px ${accent}22` : isHov ? `0 4px 24px rgba(0,0,0,0.5)` : "none",
                  transform: isHov ? "translateY(-2px)" : "none",
                }}
                onMouseEnter={() => setHovered(note.id)}
                onMouseLeave={() => setHovered(null)}>

                {/* Card header */}
                <div className="flex items-center gap-1 px-3 pt-3 pb-1">
                  <input
                    placeholder="Title…"
                    value={note.title}
                    onChange={(e) => update(note.id, { title: e.target.value })}
                    className="flex-1 min-w-0 bg-transparent text-[12px] font-semibold outline-none placeholder-white/20 truncate"
                    style={{ color: accent }} />
                  <button onClick={() => update(note.id, { pinned: !note.pinned })}
                    className="shrink-0 transition-all hover:scale-110"
                    style={{ color: note.pinned ? accent : "rgba(255,255,255,0.2)" }}
                    title={note.pinned ? "Unpin" : "Pin"}>
                    {note.pinned ? <Pin size={11} /> : <PinOff size={11} />}
                  </button>
                  <button onClick={() => del(note.id)}
                    className={`shrink-0 text-white/20 hover:text-red-400 transition-all ${isHov ? "opacity-100" : "opacity-0"}`}>
                    <X size={11} />
                  </button>
                </div>

                {/* Divider */}
                <div className="mx-3 mb-2" style={{ height: 1, background: `${accent}22` }} />

                {/* Body */}
                <textarea
                  placeholder="Write something…"
                  value={note.body}
                  onChange={(e) => update(note.id, { body: e.target.value })}
                  rows={4}
                  className="flex-1 bg-transparent px-3 pb-2 text-[12px] leading-relaxed text-white/75 placeholder-white/20 outline-none resize-none"
                  style={{ minHeight: 80 }} />

                {/* Footer */}
                <div className="px-3 pb-2.5 flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: `${accent}70` }}>{fmtAge(note.created)}</span>
                  {/* Color picker strip */}
                  <div className={`flex gap-1 transition-opacity ${isHov ? "opacity-100" : "opacity-0"}`}>
                    {PALETTE.map(({ bg }) => (
                      <button key={bg} onClick={() => update(note.id, { color: bg })}
                        className="w-3 h-3 rounded-full transition-all hover:scale-125"
                        style={{
                          background: bg,
                          border: bg === note.color ? `1px solid white` : `1px solid ${getAccent(bg)}55`,
                        }} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
