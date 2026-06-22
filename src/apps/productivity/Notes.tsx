import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Pin, PinOff, Eye, EyeOff, Search, X } from "lucide-react";

interface Note {
  id:      number;
  title:   string;
  body:    string;
  pinned:  boolean;
  updated: number;
}

const DEFAULTS: Note[] = [
  { id: 1, title: "Meeting Notes",      body: "# Meeting Notes\n\nDiscussed **vulnerability findings** with the team.\n\n- Reviewed open CVEs\n- Assigned remediation tasks\n- Next review: Friday", pinned: true,  updated: Date.now() - 3600000 },
  { id: 2, title: "Recon Checklist",    body: "## Recon Steps\n\n1. Passive OSINT\n2. `nmap -sV -O target`\n3. DNS enumeration\n4. Web crawling", pinned: false, updated: Date.now() - 1800000 },
  { id: 3, title: "Ideas",              body: "Try XSS on the login form.\nCheck for SQL injection on search params.\n\n**Low hanging fruit**: default creds.", pinned: false, updated: Date.now() - 600000  },
];

function load(): Note[] {
  try { const r = localStorage.getItem("kali-notes"); return r ? JSON.parse(r) : DEFAULTS; }
  catch { return DEFAULTS; }
}

function fmtDate(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000)    return "Just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

// Minimal markdown → HTML (safe subset — no exec, no XSS vectors since no user-injected URLs)
function md2html(src: string): string {
  return src
    // Code blocks
    .replace(/```([^`]*?)```/gs, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // H1-H3
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,     "<em>$1</em>")
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Unordered list
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>")
    // Blank lines → paragraph breaks
    .replace(/\n{2,}/g, "\n<br/><br/>\n")
    // Single newlines
    .replace(/\n/g, "<br/>");
}

export default function Notes() {
  const [notes,   setNotes]   = useState<Note[]>(load);
  const [selId,   setSelId]   = useState<number | null>(() => {
    try { const r = localStorage.getItem("kali-notes"); const ns = r ? JSON.parse(r) : DEFAULTS; return ns[0]?.id ?? null; }
    catch { return DEFAULTS[0]?.id ?? null; }
  });
  const [search,  setSearch]  = useState("");
  const [preview, setPreview] = useState(false);
  const [delId,   setDelId]   = useState<number | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem("kali-notes", JSON.stringify(notes)); }, [notes]);

  const upd = useCallback((id: number, patch: Partial<Note>) =>
    setNotes((p) => p.map((n) => n.id === id ? { ...n, ...patch, updated: Date.now() } : n)), []);

  const newNote = () => {
    const n: Note = { id: Date.now(), title: "Untitled Note", body: "", pinned: false, updated: Date.now() };
    setNotes((p) => [n, ...p]);
    setSelId(n.id);
    setTimeout(() => titleRef.current?.select(), 50);
  };

  const deleteNote = (id: number) => {
    setNotes((p) => {
      const next = p.filter((n) => n.id !== id);
      if (selId === id) setSelId(next[0]?.id ?? null);
      return next;
    });
    setDelId(null);
  };

  const filtered = notes
    .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updated - a.updated;
    });

  const sel = notes.find((n) => n.id === selId) ?? null;
  const words = sel ? sel.body.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = sel ? sel.body.length : 0;

  return (
    <div className="h-full flex" style={{ background: "#0a0a0e", color: "white" }}>

      {/* ── SIDEBAR ── */}
      <div className="w-[200px] shrink-0 flex flex-col border-r border-white/[0.07]"
        style={{ background: "#0d0d12" }}>

        {/* Search + new */}
        <div className="p-2 space-y-1.5 shrink-0">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-6 py-1.5 rounded-lg text-[11px] text-white/70 placeholder-white/25 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                <X size={10} />
              </button>
            )}
          </div>
          <button onClick={newNote}
            className="flex items-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/70 hover:text-white transition-all"
            style={{ background: "rgba(155,89,182,0.15)", border: "1px solid rgba(155,89,182,0.2)" }}>
            <Plus size={12} /> New note
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto os-scrollbar">
          {filtered.length === 0 && (
            <p className="text-[11px] text-white/20 text-center mt-6 px-3">No notes found</p>
          )}
          {filtered.map((n) => (
            <button key={n.id} onClick={() => setSelId(n.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-white/[0.04] transition-all group relative ${
                selId === n.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
              }`}>
              {selId === n.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full" style={{ background: "#9b59b6" }} />}
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] truncate font-medium" style={{ color: selId === n.id ? "white" : "rgba(255,255,255,0.7)" }}>
                    {n.pinned && <span className="mr-1 text-[#a855f7]">·</span>}
                    {n.title || "Untitled"}
                  </p>
                  <p className="text-[10px] text-white/30 truncate mt-0.5">
                    {n.body.split("\n")[0].replace(/^#+\s*/, "").slice(0, 40) || "No content"}
                  </p>
                  <p className="text-[9px] text-white/20 mt-0.5">{fmtDate(n.updated)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── EDITOR ── */}
      {sel ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-white/[0.06] shrink-0">
            <input ref={titleRef} value={sel.title}
              onChange={(e) => upd(sel.id, { title: e.target.value })}
              placeholder="Note title…"
              className="flex-1 bg-transparent text-[14px] font-semibold text-white outline-none placeholder-white/20" />
            <button onClick={() => upd(sel.id, { pinned: !sel.pinned })}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: sel.pinned ? "#a855f7" : "rgba(255,255,255,0.25)" }}
              title={sel.pinned ? "Unpin" : "Pin"}>
              {sel.pinned ? <Pin size={13} /> : <PinOff size={13} />}
            </button>
            <button onClick={() => setPreview((p) => !p)}
              className={`p-1.5 rounded-lg transition-all ${preview ? "text-[#a855f7] bg-purple-500/10" : "text-white/25 hover:text-white/60"}`}
              title={preview ? "Edit mode" : "Preview mode"}>
              {preview ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button onClick={() => setDelId(sel.id)}
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 transition-all">
              <Trash2 size={13} />
            </button>
          </div>

          {/* Content area */}
          {preview ? (
            <div className="flex-1 overflow-y-auto os-scrollbar px-6 py-4">
              <div className="prose prose-invert max-w-none text-[13px] leading-relaxed text-white/80"
                style={{ lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: md2html(sel.body) }} />
              <style>{`
                .prose h1{font-size:1.4em;font-weight:700;margin:0.8em 0 0.4em;color:white}
                .prose h2{font-size:1.2em;font-weight:600;margin:0.8em 0 0.4em;color:rgba(255,255,255,0.9)}
                .prose h3{font-size:1.05em;font-weight:600;margin:0.6em 0 0.3em;color:rgba(255,255,255,0.85)}
                .prose strong{color:white;font-weight:600}
                .prose code{background:rgba(168,85,247,0.15);color:#c084fc;padding:1px 5px;border-radius:4px;font-size:0.88em;font-family:monospace}
                .prose pre{background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;margin:8px 0;overflow-x:auto}
                .prose pre code{background:none;color:#e2e8f0;padding:0}
                .prose ul{list-style:disc;padding-left:1.4em;margin:0.5em 0}
                .prose li{margin:0.25em 0}
                .prose br{display:block;margin:2px 0}
              `}</style>
            </div>
          ) : (
            <textarea
              className="flex-1 bg-transparent px-6 py-4 text-[13px] leading-relaxed text-white/80 outline-none resize-none placeholder-white/15 os-scrollbar"
              placeholder="Start writing… (Markdown supported)"
              value={sel.body}
              onChange={(e) => upd(sel.id, { body: e.target.value })} />
          )}

          {/* Status bar */}
          <div className="flex items-center gap-4 px-4 py-1.5 border-t border-white/[0.05] shrink-0">
            <span className="text-[10px] text-white/20">{words} word{words !== 1 ? "s" : ""}</span>
            <span className="text-[10px] text-white/20">{chars} char{chars !== 1 ? "s" : ""}</span>
            <span className="ml-auto text-[10px] text-white/20">Saved · {fmtDate(sel.updated)}</span>
            {preview && <span className="text-[10px] text-[#a855f7]">Preview</span>}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 text-white/20">
          <span className="text-[32px]">📓</span>
          <p className="text-[13px]">Select or create a note</p>
          <button onClick={newNote}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] text-white/60 hover:text-white transition-all"
            style={{ background: "rgba(155,89,182,0.15)", border: "1px solid rgba(155,89,182,0.2)" }}>
            <Plus size={13} /> New note
          </button>
        </div>
      )}

      {/* Delete confirm dialog */}
      {delId !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-64 rounded-2xl p-5 shadow-2xl"
            style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-[14px] font-semibold mb-1">Delete note?</p>
            <p className="text-[12px] text-white/40 mb-4">
              "{notes.find((n) => n.id === delId)?.title || "Untitled"}" will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDelId(null)}
                className="flex-1 py-2 rounded-xl text-[12px] text-white/50 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.05)" }}>Cancel</button>
              <button onClick={() => deleteNote(delId)}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-white transition-all active:scale-95"
                style={{ background: "#7f1d1d" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
