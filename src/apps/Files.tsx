import { useState, useCallback } from "react";
import {
  Folder, FileText, ArrowLeft, ArrowRight, Home, Trash2,
  Grid3X3, List, Search, Plus, File, FileCode, FileImage,
  ChevronRight, MoreVertical, Copy, Scissors, Download, Edit3,
} from "lucide-react";

interface FItem { name: string; type: "file" | "folder"; size: string; date: string; ext?: string }

const FS: Record<string, FItem[]> = {
  "/root": [
    { name: "Desktop",      type: "folder", size: "—",       date: "May 22" },
    { name: "Documents",    type: "folder", size: "—",       date: "May 20" },
    { name: "Downloads",    type: "folder", size: "—",       date: "May 18" },
    { name: ".ssh",         type: "folder", size: "—",       date: "May 10" },
    { name: "exploit.py",   type: "file",   size: "2.4 KB",  date: "May 19", ext: "py"  },
    { name: "scan.txt",     type: "file",   size: "12 KB",   date: "May 18", ext: "txt" },
    { name: "secret.txt",   type: "file",   size: "156 B",   date: "May 15", ext: "txt" },
    { name: "payload.sh",   type: "file",   size: "4.1 KB",  date: "May 14", ext: "sh"  },
    { name: "report.pdf",   type: "file",   size: "1.2 MB",  date: "May 12", ext: "pdf" },
    { name: "avatar.png",   type: "file",   size: "340 KB",  date: "May 11", ext: "png" },
  ],
  "/root/Desktop": [
    { name: "nmap-scan.txt", type: "file", size: "8 KB",  date: "May 22", ext: "txt" },
    { name: "creds.txt",     type: "file", size: "512 B", date: "May 20", ext: "txt" },
  ],
  "/root/Documents": [
    { name: "Pentest-Report.pdf", type: "file", size: "2.4 MB", date: "May 20", ext: "pdf" },
    { name: "notes.md",           type: "file", size: "14 KB",  date: "May 18", ext: "md"  },
    { name: "scripts",            type: "folder", size: "—",    date: "May 15" },
  ],
  "/root/Documents/scripts": [
    { name: "enum.sh",     type: "file", size: "3.1 KB", date: "May 15", ext: "sh"  },
    { name: "exploit2.py", type: "file", size: "5.8 KB", date: "May 14", ext: "py"  },
  ],
  "/root/Downloads": [
    { name: "kali-linux.iso",   type: "file", size: "3.2 GB", date: "May 10", ext: "iso"  },
    { name: "metasploit.zip",   type: "file", size: "128 MB", date: "May 8",  ext: "zip"  },
    { name: "wordlist.txt",     type: "file", size: "14 MB",  date: "May 6",  ext: "txt"  },
  ],
  "/root/.ssh": [
    { name: "id_rsa",      type: "file", size: "3.3 KB", date: "Apr 28" },
    { name: "id_rsa.pub",  type: "file", size: "580 B",  date: "Apr 28" },
    { name: "known_hosts", type: "file", size: "1.2 KB", date: "May 10" },
  ],
};

const SIDEBAR = [
  { label: "Home",       icon: Home,    path: "/root" },
  { label: "Desktop",    icon: Folder,  path: "/root/Desktop" },
  { label: "Documents",  icon: FileText,path: "/root/Documents" },
  { label: "Downloads",  icon: Download,path: "/root/Downloads" },
  { label: "Trash",      icon: Trash2,  path: null },
];

function fileIcon(f: FItem, size: number) {
  if (f.type === "folder") return <Folder size={size} className="text-[#f59e0b]" />;
  const ext = f.ext ?? "";
  if (["py","sh","js","ts","json"].includes(ext)) return <FileCode size={size} className="text-[#22c55e]" />;
  if (["png","jpg","gif","svg"].includes(ext))    return <FileImage size={size} className="text-[#60a5fa]" />;
  if (ext === "pdf")  return <File size={size} className="text-[#f87171]" />;
  return <FileText size={size} className="text-[#94a3b8]" />;
}

export default function Files() {
  const [path,     setPath]     = useState("/root");
  const [history,  setHistory]  = useState(["/root"]);
  const [histIdx,  setHistIdx]  = useState(0);
  const [view,     setView]     = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search,   setSearch]   = useState("");
  const [ctx,      setCtx]      = useState<{ x: number; y: number; name: string } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const files = (FS[path] ?? []).filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = useCallback((newPath: string) => {
    setPath(newPath);
    setSelected(new Set());
    setHistory((h) => [...h.slice(0, histIdx + 1), newPath]);
    setHistIdx((i) => i + 1);
  }, [histIdx]);

  const goBack = () => {
    if (histIdx === 0) return;
    setPath(history[histIdx - 1]);
    setHistIdx((i) => i - 1);
    setSelected(new Set());
  };
  const goFwd = () => {
    if (histIdx >= history.length - 1) return;
    setPath(history[histIdx + 1]);
    setHistIdx((i) => i + 1);
    setSelected(new Set());
  };

  const openItem = (f: FItem) => {
    if (f.type === "folder") navigate(`${path}/${f.name}`);
  };

  const toggleSelect = (name: string, multi = false) => {
    setSelected((s) => {
      if (!multi) return new Set([name]);
      const ns = new Set(s);
      ns.has(name) ? ns.delete(name) : ns.add(name);
      return ns;
    });
  };

  const breadcrumbs = path.split("/").filter(Boolean);

  const startRename = (name: string) => { setRenaming(name); setRenameVal(name); setCtx(null); };

  return (
    <div className="h-full flex text-[13px]" style={{ background: "#111" }} onClick={() => { setCtx(null); setSelected(new Set()); }}>

      {/* Sidebar */}
      <div className="w-40 shrink-0 border-r border-white/[0.07] p-2 flex flex-col gap-0.5">
        <p className="text-[10px] text-white/25 uppercase tracking-widest px-2 py-1.5">Favourites</p>
        {SIDEBAR.map((s) => (
          <button key={s.label}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              s.path === path ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/6 hover:text-white/80"
            }`}
            onClick={(e) => { e.stopPropagation(); if (s.path) navigate(s.path); }}
          >
            <s.icon size={13} className={s.path === path ? "text-[#9b59b6]" : ""} />
            <span className="text-[12px]">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07] shrink-0">
          {/* Nav arrows */}
          <button onClick={goBack} disabled={histIdx === 0}
            className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
            <ArrowLeft size={15} />
          </button>
          <button onClick={goFwd} disabled={histIdx >= history.length - 1}
            className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
            <ArrowRight size={15} />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-0.5 text-[12px] flex-1 min-w-0 overflow-hidden">
            <button className="text-white/40 hover:text-white transition-colors flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); navigate("/root"); }}>
              <Home size={12} />
            </button>
            {breadcrumbs.slice(1).map((seg, i, arr) => {
              const targetPath = "/" + breadcrumbs.slice(0, i + 2).join("/");
              return (
                <span key={i} className="flex items-center gap-0.5 flex-shrink-0">
                  <ChevronRight size={11} className="text-white/20" />
                  <button
                    className={`px-1 py-0.5 rounded hover:bg-white/8 transition-colors ${i === arr.length - 1 ? "text-white/80" : "text-white/40 hover:text-white"}`}
                    onClick={(e) => { e.stopPropagation(); navigate(targetPath); }}
                  >
                    {seg}
                  </button>
                </span>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              className="h-7 pl-7 pr-3 rounded-lg text-[12px] text-white/80 outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", width: 140 }}
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* View toggle */}
          <button onClick={(e) => { e.stopPropagation(); setView(view === "grid" ? "list" : "grid"); }}
            className="text-white/40 hover:text-white transition-colors">
            {view === "grid" ? <List size={15} /> : <Grid3X3 size={15} />}
          </button>

          {/* New folder */}
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-white/50 hover:text-white hover:bg-white/8 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Status bar */}
        {selected.size > 0 && (
          <div className="px-4 py-1 text-[11px] text-white/40 border-b border-white/[0.05] shrink-0 flex items-center gap-3">
            <span>{selected.size} selected</span>
            <button className="flex items-center gap-1 hover:text-white/70 transition-colors"><Copy size={10} /> Copy</button>
            <button className="flex items-center gap-1 hover:text-white/70 transition-colors"><Scissors size={10} /> Cut</button>
            <button className="flex items-center gap-1 hover:text-red-400 transition-colors" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}

        {/* File grid / list */}
        <div className={`flex-1 overflow-y-auto p-3 ${view === "grid" ? "grid gap-2 content-start" : "flex flex-col gap-0.5"}`}
          style={view === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" } : {}}>
          {files.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-white/20 gap-2">
              <Folder size={40} />
              <p className="text-[13px]">{search ? `No results for "${search}"` : "Empty folder"}</p>
            </div>
          )}
          {files.map((f) => {
            const sel = selected.has(f.name);
            return view === "grid" ? (
              <button
                key={f.name}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all text-center relative"
                style={{
                  background: sel ? "rgba(155,89,182,0.2)" : "transparent",
                  border: `1px solid ${sel ? "rgba(155,89,182,0.4)" : "transparent"}`,
                }}
                onClick={(e) => { e.stopPropagation(); toggleSelect(f.name, e.ctrlKey || e.metaKey); }}
                onDoubleClick={(e) => { e.stopPropagation(); openItem(f); }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtx({ x: e.clientX, y: e.clientY, name: f.name }); }}
              >
                {fileIcon(f, 36)}
                {renaming === f.name ? (
                  <input autoFocus className="text-[10px] text-white bg-transparent border border-[#9b59b6] rounded px-1 w-full text-center outline-none"
                    value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setRenaming(null); e.stopPropagation(); }}
                    onClick={(e) => e.stopPropagation()} />
                ) : (
                  <span className="text-[10px] text-white/70 truncate max-w-full leading-tight">{f.name}</span>
                )}
              </button>
            ) : (
              <button key={f.name}
                className="flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all text-left group w-full"
                style={{ background: sel ? "rgba(155,89,182,0.15)" : "transparent" }}
                onClick={(e) => { e.stopPropagation(); toggleSelect(f.name, e.ctrlKey || e.metaKey); }}
                onDoubleClick={(e) => { e.stopPropagation(); openItem(f); }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtx({ x: e.clientX, y: e.clientY, name: f.name }); }}
              >
                {fileIcon(f, 16)}
                <span className="flex-1 text-white/75 truncate text-[12px]">{f.name}</span>
                <span className="text-white/30 text-[11px] w-16 text-right shrink-0">{f.size}</span>
                <span className="text-white/25 text-[11px] w-14 text-right shrink-0">{f.date}</span>
                <button className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 transition-all ml-1">
                  <MoreVertical size={12} />
                </button>
              </button>
            );
          })}
        </div>

        {/* Status foot */}
        <div className="px-4 py-1.5 border-t border-white/[0.05] shrink-0 text-[10px] text-white/25 flex gap-3">
          <span>{files.length} items</span>
          {selected.size > 0 && <span>{selected.size} selected</span>}
        </div>
      </div>

      {/* Context menu */}
      {ctx && (
        <div
          className="fixed z-[10000] w-44 rounded-xl py-1.5 animate-in zoom-in-95 fade-in duration-100"
          style={{
            left: Math.min(ctx.x, window.innerWidth  - 184),
            top:  Math.min(ctx.y, window.innerHeight - 200),
            background: "rgba(22,22,22,0.96)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { icon: Edit3,   label: "Rename",  action: () => startRename(ctx.name) },
            { icon: Copy,    label: "Copy",    action: () => setCtx(null) },
            { icon: Scissors,label: "Cut",     action: () => setCtx(null) },
            null,
            { icon: Trash2,  label: "Delete",  action: () => setCtx(null), danger: true },
          ].map((item, i) =>
            item === null ? (
              <div key={i} className="h-px mx-3 my-1 bg-white/8" />
            ) : (
              <button key={i} onClick={item.action}
                className={`w-full flex items-center gap-3 px-3.5 py-1.5 text-[12px] transition-colors ${item.danger ? "text-red-400 hover:bg-red-500/10" : "text-white/65 hover:bg-white/8 hover:text-white"}`}>
                <item.icon size={13} className="shrink-0 opacity-60" />
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
