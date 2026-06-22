import { useEffect, useRef } from "react";
import { Terminal, FolderOpen, Palette, RefreshCw, Info } from "lucide-react";
import { useOsStore } from "@/store/useOsStore";
import { getAppById } from "@/apps/registry";

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  onChangeWallpaper: () => void;
}

export default function DesktopMenu({ x, y, onClose, onChangeWallpaper }: Props) {
  const openWindow = useOsStore((s) => s.openWindow);
  const menuRef    = useRef<HTMLDivElement>(null);

  // Adjust so menu doesn't overflow screen
  const left = Math.min(x, window.innerWidth  - 200);
  const top  = Math.min(y, window.innerHeight - 220);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown",   keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown",   keyHandler);
    };
  }, [onClose]);

  const launch = (id: string) => {
    const app = getAppById(id);
    if (app) openWindow(app);
    onClose();
  };

  const items = [
    { label: "Open Terminal", icon: Terminal, action: () => launch("terminal") },
    { label: "Open Files",    icon: FolderOpen, action: () => launch("files")    },
    null, // separator
    { label: "Change Wallpaper", icon: Palette,   action: () => { onChangeWallpaper(); onClose(); } },
    { label: "Refresh Desktop",  icon: RefreshCw, action: () => { onClose(); } },
    null,
    { label: "About Kali WebOS", icon: Info, action: () => {
        alert("Kali WebOS — AetherClaw Edition\nVersion 2.0.0\nBuilt with React 19 + TypeScript");
        onClose();
      }
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[9990] py-1.5 rounded-xl overflow-hidden animate-in zoom-in-95 fade-in duration-150"
      style={{
        left, top, width: 196,
        background: "rgba(22,22,22,0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="h-px mx-3 my-1" style={{ background: "rgba(255,255,255,0.08)" }} />
        ) : (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-[12px] text-white/70 hover:bg-white/8 hover:text-white/95 transition-colors text-left"
          >
            <item.icon size={13} className="shrink-0 text-white/40" />
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
