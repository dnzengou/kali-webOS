import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { APP_REGISTRY, APP_CATEGORIES, getAppsByCategory } from "@/apps/registry";
import { useOsStore } from "@/store/useOsStore";

const COLS = 6;

export default function AppLauncher() {
  const setShowLauncher = useOsStore((s) => s.setShowLauncher);
  const openWindow      = useOsStore((s) => s.openWindow);

  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [cursor,   setCursor]   = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const apps = search
    ? APP_REGISTRY.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      )
    : getAppsByCategory(category);

  // Reset cursor when list changes
  useEffect(() => { setCursor(0); }, [search, category]);

  const launch = useCallback((idx: number) => {
    const app = apps[idx];
    if (!app) return;
    openWindow(app);
    setShowLauncher(false);
  }, [apps, openWindow, setShowLauncher]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowLauncher(false); return; }
      if (e.key === "Enter")  { launch(cursor);          return; }
      if (e.key === "ArrowRight") { setCursor((c) => Math.min(c + 1, apps.length - 1)); e.preventDefault(); return; }
      if (e.key === "ArrowLeft")  { setCursor((c) => Math.max(c - 1, 0));               e.preventDefault(); return; }
      if (e.key === "ArrowDown")  { setCursor((c) => Math.min(c + COLS, apps.length - 1)); e.preventDefault(); return; }
      if (e.key === "ArrowUp")    { setCursor((c) => Math.max(c - COLS, 0));            e.preventDefault(); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cursor, apps.length, launch, setShowLauncher]);

  // Auto-focus input
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center pt-20 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
    >
      {/* Search bar */}
      <div className="w-full max-w-[640px] px-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
          <input
            ref={inputRef}
            className="w-full h-12 rounded-2xl pl-11 pr-10 text-[15px] text-white placeholder-white/30 outline-none transition-all"
            style={{
              background: "rgba(50,50,50,0.85)",
              border: "1px solid rgba(155,89,182,0.35)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            placeholder="Search apps…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      {!search && (
        <div className="flex gap-1.5 mb-5 px-4 flex-wrap justify-center max-w-[700px]">
          {APP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 ${
                category === cat
                  ? "bg-[#9b59b6] text-white shadow-[0_2px_12px_rgba(155,89,182,0.4)]"
                  : "bg-white/8 text-white/55 hover:bg-white/14 hover:text-white/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* App grid */}
      <div
        className="grid gap-2 max-h-[62vh] overflow-y-auto px-4 pb-4 w-full max-w-[700px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {apps.map((app, idx) => {
          const Icon = app.icon;
          const isCursor = idx === cursor;
          return (
            <button
              key={app.id}
              className="flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all duration-100 group relative"
              style={{
                background: isCursor ? "rgba(155,89,182,0.2)" : "transparent",
                border: isCursor ? "1px solid rgba(155,89,182,0.4)" : "1px solid transparent",
              }}
              onClick={() => launch(idx)}
              onMouseEnter={() => setCursor(idx)}
            >
              <div
                className="w-14 h-14 rounded-[14px] flex items-center justify-center transition-all duration-100"
                style={{
                  background: isCursor
                    ? "rgba(155,89,182,0.25)"
                    : "rgba(50,50,50,0.8)",
                  boxShadow: isCursor
                    ? "0 0 0 1px rgba(155,89,182,0.3), 0 4px 16px rgba(155,89,182,0.2)"
                    : "none",
                }}
              >
                <Icon
                  size={24}
                  className="transition-colors duration-100"
                  style={{ color: isCursor ? "#c084fc" : "rgba(255,255,255,0.6)" }}
                />
              </div>
              <span
                className="text-[10px] leading-tight text-center max-w-full truncate transition-colors duration-100 px-1"
                style={{ color: isCursor ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)" }}
              >
                {app.name}
              </span>
            </button>
          );
        })}

        {apps.length === 0 && (
          <div className="col-span-6 text-center py-12 text-white/35 text-[13px]">
            No apps match "{search}"
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="mt-auto mb-4 text-[11px] text-white/25 flex items-center gap-3">
        <span>↑↓←→ navigate</span>
        <span>·</span>
        <span>↵ open</span>
        <span>·</span>
        <span>Esc close</span>
      </div>

      {/* Click-outside backdrop */}
      <button className="fixed inset-0 -z-10" onClick={() => setShowLauncher(false)} />
    </div>
  );
}
