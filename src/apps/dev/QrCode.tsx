import { useState, useMemo } from "react";
function generateQR(text: string, size: number): boolean[][] {
  const grid = Array(size).fill(null).map(() => Array(size).fill(false));
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  const rng = (s: number) => { let x = s; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; };
  const rand = rng(Math.abs(hash));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) grid[y][x] = rand() > 0.5;
  for (let dy = 0; dy < 7; dy++) for (let dx = 0; dx < 7; dx++) {
    const val = (dy === 0 || dy === 6 || dx === 0 || dx === 6) || (dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4);
    grid[dy][dx] = val; grid[dy][size - 7 + dx] = val; grid[size - 7 + dy][dx] = val;
  }
  return grid;
}
export default function QrCode() {
  const [text, setText] = useState("https://kali.org");
  const [size, setSize] = useState(25);
  const qr = useMemo(() => generateQR(text, size), [text, size]);
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <input className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none mb-3" value={text} onChange={e => setText(e.target.value)} placeholder="Enter text or URL..." />
      <div className="flex gap-2 mb-3"><span className="text-white/40 text-[11px]">Size:</span>{[15, 25, 35].map(s => <button key={s} className={`px-2 py-1 rounded text-[11px] ${size === s ? "bg-[#9b59b6] text-white" : "bg-[#2d2d2d] text-white/50"}`} onClick={() => setSize(s)}>{s}x{s}</button>)}</div>
      <div className="flex-1 bg-white rounded-lg p-4 flex items-center justify-center overflow-auto">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 0 }}>
          {qr.flat().map((cell, i) => <div key={i} className="w-3 h-3" style={{ background: cell ? "#000" : "#fff" }} />)}
        </div>
      </div>
    </div>
  );
}
