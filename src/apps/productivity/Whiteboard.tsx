import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Eraser, Minus, Square, Circle, Download, RotateCcw, RotateCw, Trash2, Type } from "lucide-react";

type Tool = "pen" | "eraser" | "line" | "rect" | "circle" | "text";

const PALETTE = [
  "#ffffff", "#f87171", "#fb923c", "#facc15", "#4ade80",
  "#60a5fa", "#a78bfa", "#f472b6", "#94a3b8", "#000000",
];

interface Snapshot { data: ImageData; }

export default function Whiteboard() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null); // for shape preview overlay

  const [tool,    setTool]    = useState<Tool>("pen");
  const [color,   setColor]   = useState("#ffffff");
  const [size,    setSize]    = useState(3);
  const [drawing, setDrawing] = useState(false);

  // Undo / redo stacks
  const history = useRef<Snapshot[]>([]);
  const redoStack = useRef<Snapshot[]>([]);
  const MAX_HISTORY = 50;

  // Shape drawing start point
  const shapeStart = useRef({ x: 0, y: 0 });

  // Text input overlay
  const [textPos,   setTextPos]   = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState("");

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;
  const getPCtx = () => previewRef.current?.getContext("2d") ?? null;

  const saveSnapshot = useCallback(() => {
    const c = canvasRef.current; const ctx = getCtx();
    if (!c || !ctx) return;
    const snapshot = { data: ctx.getImageData(0, 0, c.width, c.height) };
    history.current.push(snapshot);
    if (history.current.length > MAX_HISTORY) history.current.shift();
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    const c = canvasRef.current; const ctx = getCtx();
    if (!c || !ctx || history.current.length === 0) return;
    const current = ctx.getImageData(0, 0, c.width, c.height);
    redoStack.current.push({ data: current });
    const snap = history.current.pop()!;
    ctx.putImageData(snap.data, 0, 0);
  }, []);

  const redo = useCallback(() => {
    const c = canvasRef.current; const ctx = getCtx();
    if (!c || !ctx || redoStack.current.length === 0) return;
    const current = ctx.getImageData(0, 0, c.width, c.height);
    history.current.push({ data: current });
    const snap = redoStack.current.pop()!;
    ctx.putImageData(snap.data, 0, 0);
  }, []);

  // Init canvas
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.width  = c.offsetWidth  || 800;
    c.height = c.offsetHeight || 600;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#161616";
    ctx.fillRect(0, 0, c.width, c.height);
    // Also size preview canvas
    const p = previewRef.current; if (!p) return;
    p.width  = c.width;
    p.height = c.height;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (textPos) return; // text input active
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo, textPos]);

  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);

    if (tool === "text") {
      setTextPos(pos); setTextInput(""); return;
    }

    saveSnapshot();
    setDrawing(true);

    if (tool === "pen" || tool === "eraser") {
      const ctx = getCtx()!;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else {
      shapeStart.current = pos;
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getPos(e);
    const ctx  = getCtx()!;
    const pCtx = getPCtx()!;
    const pc   = previewRef.current!;

    if (tool === "pen") {
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth   = size;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = "#161616";
      ctx.lineWidth   = size * 4;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();
    } else {
      // Shape preview on overlay canvas
      pCtx.clearRect(0, 0, pc.width, pc.height);
      pCtx.strokeStyle = color;
      pCtx.lineWidth   = size;
      const { x: sx, y: sy } = shapeStart.current;
      pCtx.beginPath();
      if (tool === "line") {
        pCtx.moveTo(sx, sy); pCtx.lineTo(pos.x, pos.y);
      } else if (tool === "rect") {
        pCtx.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
      } else if (tool === "circle") {
        const rx = Math.abs(pos.x - sx) / 2, ry = Math.abs(pos.y - sy) / 2;
        pCtx.ellipse(sx + (pos.x - sx) / 2, sy + (pos.y - sy) / 2, rx, ry, 0, 0, Math.PI * 2);
      }
      pCtx.stroke();
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!drawing) return;
    setDrawing(false);
    const pos  = getPos(e);
    const ctx  = getCtx()!;
    const pCtx = getPCtx()!;
    const pc   = previewRef.current!;

    if (tool === "line" || tool === "rect" || tool === "circle") {
      const { x: sx, y: sy } = shapeStart.current;
      pCtx.clearRect(0, 0, pc.width, pc.height);
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.beginPath();
      if (tool === "line") {
        ctx.moveTo(sx, sy); ctx.lineTo(pos.x, pos.y);
      } else if (tool === "rect") {
        ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
      } else if (tool === "circle") {
        const rx = Math.abs(pos.x - sx) / 2, ry = Math.abs(pos.y - sy) / 2;
        ctx.ellipse(sx + (pos.x - sx) / 2, sy + (pos.y - sy) / 2, rx, ry, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
  };

  const commitText = () => {
    if (!textPos || !textInput) { setTextPos(null); return; }
    const ctx = getCtx()!;
    saveSnapshot();
    ctx.font      = `${size * 6 + 10}px Inter, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextPos(null); setTextInput("");
  };

  const clearCanvas = () => {
    const c = canvasRef.current; const ctx = getCtx();
    if (!c || !ctx) return;
    saveSnapshot();
    ctx.fillStyle = "#161616";
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const exportPng = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.href     = c.toDataURL("image/png");
    a.download = "whiteboard.png";
    a.click();
  };

  const TOOLS: { id: Tool; icon: React.FC<any>; label: string }[] = [
    { id: "pen",    icon: Pencil, label: "Pen"    },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "line",   icon: Minus,  label: "Line"   },
    { id: "rect",   icon: Square, label: "Rect"   },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "text",   icon: Type,   label: "Text"   },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#111" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07] shrink-0 flex-wrap">
        {/* Tools */}
        <div className="flex gap-1">
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <button key={id} title={label} onClick={() => setTool(id)}
              className={`p-2 rounded-lg transition-all ${tool === id ? "bg-[#9b59b6] text-white" : "text-white/40 hover:bg-white/8 hover:text-white/80"}`}>
              <Icon size={14} />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Color palette */}
        <div className="flex gap-1 flex-wrap max-w-[160px]">
          {PALETTE.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full transition-all hover:scale-110"
              style={{
                background: c,
                outline: color === c ? `2px solid white` : "none",
                outlineOffset: 2,
              }} />
          ))}
        </div>

        {/* Custom color */}
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-0 p-0"
          title="Custom color" />

        <div className="w-px h-6 bg-white/10" />

        {/* Stroke size */}
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/60" style={{ width: Math.max(3, size * 2), height: Math.max(3, size * 2) }} />
          <input type="range" min={1} max={20} value={size} onChange={(e) => setSize(+e.target.value)}
            className="w-20 accent-[#9b59b6]" />
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Undo / Redo */}
        <button onClick={undo} title="Undo (Ctrl+Z)" className="p-2 rounded-lg text-white/40 hover:bg-white/8 hover:text-white/80 transition-all">
          <RotateCcw size={14} />
        </button>
        <button onClick={redo} title="Redo (Ctrl+Y)" className="p-2 rounded-lg text-white/40 hover:bg-white/8 hover:text-white/80 transition-all">
          <RotateCw size={14} />
        </button>

        <div className="ml-auto flex gap-1">
          <button onClick={exportPng} title="Export PNG"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-white/50 hover:text-white hover:bg-white/8 transition-all">
            <Download size={13} /> PNG
          </button>
          <button onClick={clearCanvas} title="Clear canvas"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden" style={{ cursor: tool === "text" ? "text" : tool === "eraser" ? "cell" : "crosshair" }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
        {/* Shape preview overlay */}
        <canvas ref={previewRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.8 }} />
        {/* Text input overlay */}
        {textPos && (
          <input
            autoFocus
            className="absolute bg-transparent text-white outline-none caret-white border-b border-white/50"
            style={{ left: textPos.x, top: textPos.y - 20, fontSize: size * 6 + 10, minWidth: 80, color, fontFamily: "Inter, sans-serif" }}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitText(); if (e.key === "Escape") { setTextPos(null); } }}
            onBlur={commitText}
          />
        )}
      </div>
    </div>
  );
}
