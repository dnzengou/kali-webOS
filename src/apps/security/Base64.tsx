import { useState, useMemo } from "react";
import { ArrowUpDown, Copy } from "lucide-react";

export default function Base64() {
  const [input, setInput] = useState("Hello, Kali WebOS!");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const output = useMemo(() => {
    try {
      return mode === "encode" ? btoa(input) : atob(input);
    } catch {
      return "Invalid input";
    }
  }, [input, mode]);

  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-3">
        <button className={`flex-1 py-2 rounded-lg ${mode === "encode" ? "bg-[#9b59b6] text-white" : "bg-[#2d2d2d] text-white/60"}`} onClick={() => setMode("encode")}>Encode</button>
        <button className={`flex-1 py-2 rounded-lg ${mode === "decode" ? "bg-[#9b59b6] text-white" : "bg-[#2d2d2d] text-white/60"}`} onClick={() => setMode("decode")}>Decode</button>
      </div>
      <textarea className="w-full h-24 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg p-3 text-white outline-none focus:border-[#9b59b6] resize-none mb-3" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="bg-[#2d2d2d] rounded-lg p-3 mb-3 relative">
        <div className="text-[11px] text-white/40 mb-1">Result</div>
        <div className="text-[13px] text-white/80 font-mono break-all">{output}</div>
        <button className="absolute top-2 right-2 text-white/40 hover:text-white" onClick={() => navigator.clipboard?.writeText(output)}><Copy size={14} /></button>
      </div>
      <button className="bg-[#3d3d3d] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10" onClick={() => { setInput(output); setMode(mode === "encode" ? "decode" : "encode"); }}><ArrowUpDown size={14} />Swap</button>
    </div>
  );
}
