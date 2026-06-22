import { useRef, useCallback, useState, useEffect } from "react";
import { X, Minus, Maximize2, Square } from "lucide-react";
import { useOsStore } from "@/store/useOsStore";
import type { AppRegistryEntry } from "@/apps/registry";

interface WindowProps {
  windowId: string;
  app: AppRegistryEntry;
  children: React.ReactNode;
}

const SNAP = 10;      // px — snap-to-edge zone
const MIN_W = 320;
const MIN_H = 220;
const TOP_BAR_H = 36; // OS top bar — windows can't go above

type Dir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const CURSORS: Record<Dir, string> = {
  n: "ns-resize", s: "ns-resize",
  e: "ew-resize", w: "ew-resize",
  ne: "nesw-resize", sw: "nesw-resize",
  nw: "nwse-resize", se: "nwse-resize",
};

export default function Window({ windowId, app, children }: WindowProps) {
  const win      = useOsStore((s) => s.windows.find((w) => w.id === windowId));
  const active   = useOsStore((s) => s.activeWindowId) === windowId;
  const close    = useOsStore((s) => s.closeWindow);
  const minimize = useOsStore((s) => s.minimizeWindow);
  const maximize = useOsStore((s) => s.maximizeWindow);
  const restore  = useOsStore((s) => s.restoreWindow);
  const focus    = useOsStore((s) => s.focusWindow);
  const move     = useOsStore((s) => s.moveWindow);
  const resizeFn = useOsStore((s) => s.resizeWindow);

  const [closing,  setClosing]  = useState(false);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntering(false));
    return () => cancelAnimationFrame(id);
  }, []);

  const dragging   = useRef(false);
  const dragOff    = useRef({ x: 0, y: 0 });
  const resizing   = useRef(false);
  const resDir     = useRef<Dir>("se");
  const resStart   = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w  = win?.width  ?? 600;
        const h  = win?.height ?? 400;
        let nx = e.clientX - dragOff.current.x;
        let ny = e.clientY - dragOff.current.y;
        if (nx < SNAP)            nx = 0;
        if (ny < TOP_BAR_H + SNAP) ny = TOP_BAR_H;
        if (nx + w > vw - SNAP)   nx = vw - w;
        if (ny + h > vh - SNAP)   ny = vh - h;
        move(windowId, nx, Math.max(TOP_BAR_H, ny));
      }
      if (resizing.current) {
        const { mx, my, x: ox, y: oy, w: ow, h: oh } = resStart.current;
        const dx = e.clientX - mx;
        const dy = e.clientY - my;
        const dir = resDir.current;
        let nx = ox, ny = oy, nw = ow, nh = oh;
        if (dir.includes("e"))  nw = Math.max(MIN_W, ow + dx);
        if (dir.includes("s"))  nh = Math.max(MIN_H, oh + dy);
        if (dir.includes("w")) { nw = Math.max(MIN_W, ow - dx); nx = ox + (ow - nw); }
        if (dir.includes("n")) { nh = Math.max(MIN_H, oh - dy); ny = oy + (oh - nh); }
        ny = Math.max(TOP_BAR_H, ny);
        move(windowId, nx, ny);
        resizeFn(windowId, nw, nh);
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizing.current = false;
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
  }, [windowId, win?.width, win?.height, move, resizeFn]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    focus(windowId);
    if (win?.isMaximized) return;
    dragging.current = true;
    dragOff.current  = { x: e.clientX - (win?.x ?? 0), y: e.clientY - (win?.y ?? 0) };
    document.body.style.userSelect = "none";
  }, [windowId, win?.x, win?.y, win?.isMaximized, focus]);

  const startResize = useCallback((e: React.MouseEvent, dir: Dir) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (win?.isMaximized) return;
    resizing.current = true;
    resDir.current   = dir;
    resStart.current = {
      mx: e.clientX, my: e.clientY,
      x: win?.x ?? 0, y: win?.y ?? 0,
      w: win?.width ?? 600, h: win?.height ?? 400,
    };
    document.body.style.cursor     = CURSORS[dir];
    document.body.style.userSelect = "none";
  }, [win?.isMaximized, win?.x, win?.y, win?.width, win?.height]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => close(windowId), 180);
  }, [windowId, close]);

  if (!win || win.isMinimized) return null;

  const Icon = app.icon;
  const animClass = (closing || entering) ? "scale-[0.94] opacity-0" : "scale-100 opacity-100";

  return (
    <div
      className={`absolute flex flex-col overflow-hidden rounded-[10px] border
        transition-[transform,opacity,box-shadow] duration-200 ease-out will-change-transform
        ${active
          ? "border-white/[0.18] shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_0_1px_rgba(155,89,182,0.28)]"
          : "border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"}
        ${animClass}`}
      style={{
        left: win.x, top: win.y, width: win.width, height: win.height,
        zIndex: win.zIndex,
        background: "rgba(22,22,22,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
      onMouseDown={() => focus(windowId)}
    >
      {/* ── Title bar ── */}
      <div
        className={`shrink-0 h-9 flex items-center px-3 select-none relative
          border-b border-white/[0.07] transition-colors duration-150
          ${active ? "bg-[#272727]" : "bg-[#1c1c1c]"}`}
        onMouseDown={startDrag}
        onDoubleClick={() => win.isMaximized ? restore(windowId) : maximize(windowId)}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-[6px] z-10" onMouseDown={(e) => e.stopPropagation()}>
          <button
            className="w-[13px] h-[13px] rounded-full bg-[#ff5f57] hover:brightness-90 active:brightness-75 flex items-center justify-center group transition-all"
            onClick={handleClose} title="Close"
          >
            <X size={7} className="opacity-0 group-hover:opacity-100 text-[#670000] transition-opacity" strokeWidth={3} />
          </button>
          <button
            className="w-[13px] h-[13px] rounded-full bg-[#febc2e] hover:brightness-90 active:brightness-75 flex items-center justify-center group transition-all"
            onClick={() => minimize(windowId)} title="Minimize"
          >
            <Minus size={7} className="opacity-0 group-hover:opacity-100 text-[#4d2c00] transition-opacity" strokeWidth={3} />
          </button>
          <button
            className="w-[13px] h-[13px] rounded-full bg-[#28c840] hover:brightness-90 active:brightness-75 flex items-center justify-center group transition-all"
            onClick={() => win.isMaximized ? restore(windowId) : maximize(windowId)}
            title={win.isMaximized ? "Restore" : "Maximize"}
          >
            {win.isMaximized
              ? <Square   size={7} className="opacity-0 group-hover:opacity-100 text-[#004400] transition-opacity" strokeWidth={3} />
              : <Maximize2 size={7} className="opacity-0 group-hover:opacity-100 text-[#004400] transition-opacity" strokeWidth={3} />}
          </button>
        </div>

        {/* Centered title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-[6px]">
          <Icon size={12} className={active ? "text-[#9b59b6]" : "text-white/25"} />
          <span className={`text-[12px] font-medium tracking-[0.01em] transition-colors duration-150 ${active ? "text-white/80" : "text-white/30"}`}>
            {win.title}
          </span>
        </div>

        {/* Balancing spacer */}
        <div className="ml-auto w-[51px]" />
      </div>

      {/* ── App content ── */}
      <div className="flex-1 overflow-hidden" style={{ background: "#161616" }}>
        {children}
      </div>

      {/* ── 8-directional resize handles ── */}
      {!win.isMaximized && (<>
        <div className="absolute top-0 left-3 right-3 h-[4px] cursor-n-resize" onMouseDown={(e) => startResize(e, "n")} />
        <div className="absolute bottom-0 left-3 right-3 h-[4px] cursor-s-resize" onMouseDown={(e) => startResize(e, "s")} />
        <div className="absolute top-3 bottom-3 left-0 w-[4px] cursor-w-resize" onMouseDown={(e) => startResize(e, "w")} />
        <div className="absolute top-3 bottom-3 right-0 w-[4px] cursor-e-resize" onMouseDown={(e) => startResize(e, "e")} />
        <div className="absolute top-0 left-0 w-[8px] h-[8px] cursor-nw-resize" onMouseDown={(e) => startResize(e, "nw")} />
        <div className="absolute top-0 right-0 w-[8px] h-[8px] cursor-ne-resize" onMouseDown={(e) => startResize(e, "ne")} />
        <div className="absolute bottom-0 left-0 w-[8px] h-[8px] cursor-sw-resize" onMouseDown={(e) => startResize(e, "sw")} />
        <div className="absolute bottom-0 right-0 w-[8px] h-[8px] cursor-se-resize" onMouseDown={(e) => startResize(e, "se")} />
      </>)}
    </div>
  );
}
