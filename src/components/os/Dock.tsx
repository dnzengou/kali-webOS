import { useState, useRef } from "react";
import { APP_REGISTRY } from "@/apps/registry";
import { useOsStore } from "@/store/useOsStore";

const DOCK_APPS = ["files", "terminal", "editor", "browser", "monitor", "settings", "calc", "agentchat", "music"];
const BASE = 48;
const MAX_SCALE = 1.55;
const SPREAD = 72;

function getScale(mouseX: number | null, cx: number): number {
  if (mouseX === null) return 1;
  const d = Math.abs(mouseX - cx);
  if (d >= SPREAD) return 1;
  return 1 + (MAX_SCALE - 1) * Math.pow(1 - d / SPREAD, 2);
}

export default function Dock() {
  const openWindow    = useOsStore((s) => s.openWindow);
  const focusWindow   = useOsStore((s) => s.focusWindow);
  const restoreWindow = useOsStore((s) => s.restoreWindow);
  const windows       = useOsStore((s) => s.windows);
  const activeId      = useOsStore((s) => s.activeWindowId);

  const [mouseX, setMouseX] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const dockApps = DOCK_APPS.map((id) => APP_REGISTRY.find((a) => a.id === id)).filter(Boolean) as typeof APP_REGISTRY;

  const handleClick = (appId: string) => {
    const app = APP_REGISTRY.find((a) => a.id === appId);
    if (!app) return;

    // Check minimized first — restore
    const minimized = windows.find((w) => w.appId === appId && w.isMinimized);
    if (minimized) { restoreWindow(minimized.id); focusWindow(minimized.id); return; }

    // Then running — focus
    const running = windows.find((w) => w.appId === appId && !w.isMinimized);
    if (running) { focusWindow(running.id); return; }

    // Otherwise open
    openWindow(app);
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center"
    >
      {/* Tooltip */}
      <div className={`mb-2 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/80 transition-all duration-150 pointer-events-none
        ${tooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
        style={{ background: "rgba(30,30,30,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {tooltip ?? "·"}
      </div>

      {/* Dock bar */}
      <div
        ref={dockRef}
        className="flex items-end gap-2 px-3 pt-2 pb-2 rounded-[20px]"
        style={{
          background: "rgba(14,14,14,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onMouseMove={(e) => {
          const rect = dockRef.current?.getBoundingClientRect();
          if (rect) setMouseX(e.clientX - rect.left);
        }}
        onMouseLeave={() => { setMouseX(null); setTooltip(null); }}
      >
        {dockApps.map((app, idx) => {
          const Icon = app.icon;
          const gap = 8;
          const pad = 12;
          const iconCenterX = pad + idx * (BASE + gap) + BASE / 2;
          const scale = getScale(mouseX, iconCenterX);
          const size  = Math.round(BASE * scale);
          const iconSize = Math.round(22 * scale);
          const radius   = Math.round(12 * scale);

          const allWins    = windows.filter((w) => w.appId === app.id);
          const running    = allWins.filter((w) => !w.isMinimized);
          const minimized  = allWins.filter((w) => w.isMinimized);
          const isActive   = running.some((w) => w.id === activeId);
          const dotCount   = Math.min(allWins.length, 3);

          return (
            <div
              key={app.id}
              className="relative flex flex-col items-center flex-shrink-0"
              style={{ transition: "width 80ms, height 80ms" }}
              onMouseEnter={() => setTooltip(app.name)}
            >
              <button
                className="relative flex items-center justify-center transition-colors flex-shrink-0"
                style={{
                  width: size, height: size,
                  borderRadius: radius,
                  background: isActive
                    ? "rgba(155,89,182,0.25)"
                    : "rgba(55,55,55,0.9)",
                  border: isActive
                    ? "1px solid rgba(155,89,182,0.5)"
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: minimized.length > 0
                    ? "0 0 0 2px rgba(254,188,46,0.5)"
                    : "none",
                  transition: "width 80ms ease-out, height 80ms ease-out, border-radius 80ms ease-out, background 150ms",
                }}
                onClick={() => handleClick(app.id)}
              >
                <Icon
                  size={iconSize}
                  style={{
                    color: isActive ? "#c084fc" : "rgba(255,255,255,0.75)",
                    transition: "color 150ms",
                  }}
                />
              </button>

              {/* Running dots */}
              {dotCount > 0 && (
                <div className="absolute -bottom-[7px] flex gap-[3px]">
                  {Array.from({ length: dotCount }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: 3, height: 3,
                        background: i < running.length ? "rgba(255,255,255,0.8)" : "rgba(254,188,46,0.8)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Separator + extra pinned apps from open windows not in dock */}
        {windows.some((w) => !DOCK_APPS.includes(w.appId)) && (
          <>
            <div className="w-px h-8 bg-white/10 mx-1 self-center" />
            {windows
              .filter((w) => !DOCK_APPS.includes(w.appId))
              .reduce<string[]>((acc, w) => acc.includes(w.appId) ? acc : [...acc, w.appId], [])
              .map((appId) => {
                const app = APP_REGISTRY.find((a) => a.id === appId);
                if (!app) return null;
                const Icon = app.icon;
                const isActive = windows.some((w) => w.appId === appId && w.id === activeId);
                return (
                  <div key={appId} className="relative flex flex-col items-center flex-shrink-0">
                    <button
                      className="flex items-center justify-center rounded-xl transition-all"
                      style={{
                        width: BASE, height: BASE,
                        background: isActive ? "rgba(155,89,182,0.25)" : "rgba(55,55,55,0.9)",
                        border: isActive ? "1px solid rgba(155,89,182,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      }}
                      onClick={() => handleClick(appId)}
                      onMouseEnter={() => setTooltip(app.name)}
                    >
                      <Icon size={22} style={{ color: isActive ? "#c084fc" : "rgba(255,255,255,0.7)" }} />
                    </button>
                    <div className="absolute -bottom-[7px] w-[3px] h-[3px] rounded-full bg-white/80" />
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}
