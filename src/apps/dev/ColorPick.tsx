import { useState } from "react";
export default function ColorPick() {
  const [color, setColor] = useState("#9b59b6");
  const [saved, setSaved] = useState(["#e74c3c", "#f39c12", "#2ecc71", "#3498db", "#9b59b6", "#1abc9c"]);
  const hexToRgb = (h: string) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
  const rgb = hexToRgb(color);
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex justify-center mb-4">
        <div className="flex gap-2">
          <div className="w-24 h-24 rounded-xl shadow-lg" style={{ background: color }} />
          <div className="space-y-1">
            <div className="text-white/50 text-[11px]">Contrast</div>
            <div className="flex gap-1"><div className="w-8 h-8 rounded flex items-center justify-center text-[10px] text-white" style={{ background: color }}>A</div><div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[10px]" style={{ color }}>A</div></div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mb-3 justify-center">
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
        <input className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white font-mono text-[12px] outline-none w-28" value={color.toUpperCase()} onChange={e => setColor(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
        <div className="bg-[#2d2d2d] rounded-lg p-2"><div className="text-white/40">RGB</div><div className="text-white/80 font-mono">{rgb.r}, {rgb.g}, {rgb.b}</div></div>
        <div className="bg-[#2d2d2d] rounded-lg p-2"><div className="text-white/40">HEX</div><div className="text-white/80 font-mono">{color.toUpperCase()}</div></div>
      </div>
      <div className="text-[11px] text-white/40 mb-2">Palette</div>
      <div className="flex gap-2 flex-wrap">
        {saved.map((c, i) => <button key={i} className="w-8 h-8 rounded-lg" style={{ background: c }} onClick={() => setColor(c)} />)}
        <button className="w-8 h-8 rounded-lg border border-dashed border-white/30 text-white/30 flex items-center justify-center" onClick={() => { if (!saved.includes(color)) setSaved([...saved, color]) }}>+</button>
      </div>
    </div>
  );
}
