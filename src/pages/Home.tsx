import { useEffect, useRef, useState } from "react";
import { useOsStore } from "@/store/useOsStore";
import { getAppById } from "@/apps/registry";
import Window from "@/components/os/Window";
import TopBar from "@/components/os/TopBar";
import Dock from "@/components/os/Dock";
import AppLauncher from "@/components/os/AppLauncher";
import LoginScreen from "@/components/os/LoginScreen";
import DesktopMenu from "@/components/os/DesktopMenu";
import AppRenderer from "@/apps";

const WALLPAPERS = [
  { fg: "#9b59b6", bg: "#1a1a2e" },
  { fg: "#00d4aa", bg: "#0d1117" },
  { fg: "#ff6b35", bg: "#180a00" },
];

function MatrixRain({ wallpaper }: { wallpaper: typeof WALLPAPERS[0] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FONT_SIZE = 14;
    const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let cols = Math.floor(w / FONT_SIZE);
    let drops = Array.from({ length: cols }, () => Math.random() * -100);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / FONT_SIZE);
      drops = Array.from({ length: cols }, (_, i) => drops[i] ?? Math.random() * -100);
    };
    window.addEventListener("resize", onResize);

    ctx.font = `${FONT_SIZE}px monospace`;

    let animId: number;
    const draw = () => {
      ctx.fillStyle = wallpaper.bg + "18";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = wallpaper.fg;
      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);
        if (drops[i] * FONT_SIZE > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [wallpaper]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}

const DESKTOP_ICONS = [
  { id: "files",    label: "Home",          y: 10  },
  { id: "terminal", label: "Terminal",       y: 92  },
  { id: "monitor",  label: "System Monitor", y: 174 },
];

export default function Home() {
  const windows         = useOsStore((s) => s.windows);
  const isLocked        = useOsStore((s) => s.isLocked);
  const showLauncher    = useOsStore((s) => s.showLauncher);
  const openWindow      = useOsStore((s) => s.openWindow);
  const setShowLauncher = useOsStore((s) => s.setShowLauncher);

  const [wallpaper,   setWallpaper]   = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "F2") { e.preventDefault(); setShowLauncher(!showLauncher); }
      if (e.key === "Escape" && showLauncher) setShowLauncher(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setShowLauncher(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showLauncher, setShowLauncher]);

  if (isLocked) return <LoginScreen />;

  return (
    <div
      className="w-screen h-screen overflow-hidden relative select-none"
      style={{ background: WALLPAPERS[wallpaper].bg }}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest("[data-no-ctx]")) return;
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <MatrixRain wallpaper={WALLPAPERS[wallpaper]} />

      <TopBar />
      <Dock />

      {showLauncher && <AppLauncher />}

      {contextMenu && (
        <DesktopMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onChangeWallpaper={() => setWallpaper((w) => (w + 1) % WALLPAPERS.length)}
        />
      )}

      {/* Desktop icons */}
      <div className="absolute top-10 left-1 bottom-20 w-[88px] z-[1]">
        {DESKTOP_ICONS.map((icon) => {
          const app = getAppById(icon.id);
          if (!app) return null;
          const Icon = app.icon;
          const running = windows.some((w) => w.appId === icon.id && !w.isMinimized);
          return (
            <button
              key={icon.id}
              className="absolute flex flex-col items-center gap-1 py-2 px-1 w-full rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors"
              style={{ top: icon.y }}
              onDoubleClick={() => openWindow(app)}
            >
              <div className="relative">
                <Icon size={34} className="text-white/80" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
                {running && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#9b59b6]" />}
              </div>
              <span className="text-[10px] text-white/65 text-center leading-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                {icon.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Windows */}
      {windows.map((win) => {
        const app = getAppById(win.appId);
        if (!app) return null;
        return (
          <div key={win.id} data-no-ctx="1">
            <Window windowId={win.id} app={app}>
              <AppRenderer app={app} />
            </Window>
          </div>
        );
      })}
    </div>
  );
}
