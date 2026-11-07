import { useEffect, useRef, useState } from "react";
import { useOsStore } from "@/store/useOsStore";
import { getAppById } from "@/apps/registry";

/**
 * Alt+Tab / Alt+Shift+Tab window cycler with HUD overlay.
 *
 * Also binds Ctrl/Cmd + `  as a secondary shortcut (same cycle order).
 *
 * Only cycles non-minimized windows, ordered by zIndex descending (most
 * recently focused first). On Alt release, focuses the highlighted
 * window; Escape cancels without changing focus.
 */
export default function AltTabSwitcher() {
  const windows      = useOsStore((s) => s.windows);
  const focusWindow  = useOsStore((s) => s.focusWindow);
  const restoreWindow = useOsStore((s) => s.restoreWindow);
  const activeId     = useOsStore((s) => s.activeWindowId);

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex]   = useState(0);
  // Frozen ordered list captured on first Tab press — doesn't reshuffle mid-cycle.
  const listRef = useRef<typeof windows>([]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const triggerBacktick = (e.ctrlKey || e.metaKey) && e.key === "`";
      const triggerAltTab   = e.altKey && e.key === "Tab";

      if (!triggerAltTab && !triggerBacktick) return;

      // Build the ordered list the first time the HUD opens this cycle.
      if (!isOpen) {
        const visible = windows
          .filter((w) => !w.isMinimized)
          .sort((a, b) => b.zIndex - a.zIndex);
        if (visible.length < 2) {
          // Nothing to cycle to — don't eat the shortcut.
          return;
        }
        e.preventDefault();
        listRef.current = visible;
        // Start one past the active window so Alt+Tab goes to previous, not self.
        const startAt = visible.findIndex((w) => w.id === activeId);
        const next = e.shiftKey
          ? (startAt <= 0 ? visible.length - 1 : startAt - 1)
          : (startAt >= visible.length - 1 ? 0 : startAt + 1);
        setIndex(next);
        setIsOpen(true);
        return;
      }

      // HUD already open — cycle.
      e.preventDefault();
      setIndex((i) => {
        const n = listRef.current.length;
        if (!n) return 0;
        if (e.shiftKey) return (i - 1 + n) % n;
        return (i + 1) % n;
      });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!isOpen) return;
      // Commit on Alt/Meta release (the chord-terminating key).
      if (e.key === "Alt" || e.key === "Meta" || e.key === "Control") {
        const target = listRef.current[index];
        if (target) {
          if (target.isMinimized) restoreWindow(target.id);
          focusWindow(target.id);
        }
        setIsOpen(false);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isOpen, index, windows, activeId, focusWindow, restoreWindow]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(22,22,22,0.96)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          maxWidth: "min(92vw, 720px)",
        }}
      >
        {listRef.current.map((w, i) => {
          const app = getAppById(w.appId);
          if (!app) return null;
          const Icon = app.icon;
          const selected = i === index;
          return (
            <div
              key={w.id}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-100"
              style={{
                background: selected ? "rgba(155,89,182,0.25)" : "transparent",
                border: selected ? "1px solid rgba(155,89,182,0.5)" : "1px solid transparent",
                minWidth: 80,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(50,50,50,0.8)" }}
              >
                <Icon size={22} style={{ color: selected ? "#c084fc" : "rgba(255,255,255,0.7)" }} />
              </div>
              <span
                className="text-[10px] leading-tight text-center max-w-[80px] truncate px-1"
                style={{ color: selected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)" }}
              >
                {w.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
