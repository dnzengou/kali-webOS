import { useState, useMemo } from "react";
const ORIGINAL = `function scan(target) {\n  console.log("Scanning " + target);\n  return fetch('/api/scan', { method: 'POST' });\n}\n\nmodule.exports = { scan };`;
const MODIFIED = `function scan(target, options = {}) {\n  console.log("Scanning " + target);\n  const opts = { timeout: 5000, ...options };\n  return fetch('/api/scan', { method: 'POST', body: JSON.stringify(opts) });\n}\n\nmodule.exports = { scan, scanAll };`;
export default function Diff() {
  const [orig, setOrig] = useState(ORIGINAL);
  const [mod, setMod] = useState(MODIFIED);
  const diff = useMemo(() => {
    const o = orig.split("\n");
    const m = mod.split("\n");
    const max = Math.max(o.length, m.length);
    const result = [];
    for (let i = 0; i < max; i++) {
      if (o[i] === m[i]) result.push({ type: "same" as const, left: o[i] || "", right: m[i] || "" });
      else if (!m[i]) result.push({ type: "del" as const, left: o[i], right: "" });
      else if (!o[i]) result.push({ type: "add" as const, left: "", right: m[i] });
      else result.push({ type: "mod" as const, left: o[i], right: m[i] });
    }
    return result;
  }, [orig, mod]);
  return (
    <div className="h-full flex flex-col p-3 text-[13px]">
      <div className="flex-1 flex gap-2">
        <div className="flex-1 flex flex-col"><div className="text-[11px] text-white/40 mb-1">Original</div><textarea className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg p-2 text-white text-[11px] outline-none resize-none font-mono" value={orig} onChange={e => setOrig(e.target.value)} /></div>
        <div className="flex-1 flex flex-col"><div className="text-[11px] text-white/40 mb-1">Modified</div><textarea className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg p-2 text-white text-[11px] outline-none resize-none font-mono" value={mod} onChange={e => setMod(e.target.value)} /></div>
      </div>
      <div className="flex-1 overflow-y-auto os-scrollbar mt-2 bg-[#0c0c0c] rounded-lg p-2">
        {diff.map((d, i) => (
          <div key={i} className={`flex text-[11px] font-mono ${d.type === "add" ? "bg-[#27ae60]/10" : d.type === "del" ? "bg-[#e74c3c]/10" : d.type === "mod" ? "bg-[#f39c12]/10" : ""}`}>
            <span className="w-6 text-right text-white/20 mr-2 shrink-0">{i + 1}</span>
            <span className={`w-1/2 pr-2 ${d.type === "del" ? "text-[#e74c3c]" : d.type === "mod" ? "text-[#f39c12]" : "text-white/60"}`}>{d.left}</span>
            <span className={`w-1/2 pl-2 border-l border-[#3d3d3d] ${d.type === "add" ? "text-[#27ae60]" : d.type === "mod" ? "text-[#f39c12]" : "text-white/60"}`}>{d.right}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
