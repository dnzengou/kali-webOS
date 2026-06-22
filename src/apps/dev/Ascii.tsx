import { useState } from "react";
const FONTS: Record<string, string[]> = {
  Standard: [" _   _  ", "| | | | ", "| |_| | ", "|  _  | ", "| | | | ", "|_| |_| "],
  Block: [" ____ ", "|    |", "|    |", "|    |", "|    |", "|____|"],
};
export default function Ascii() {
  const [text, setText] = useState("KALI");
  const [font, setFont] = useState("Standard");
  const lines = FONTS[font] || FONTS.Standard;
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-3">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none" value={text} onChange={e => setText(e.target.value)} maxLength={10} />
        <select className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 text-white" value={font} onChange={e => setFont(e.target.value)}>{Object.keys(FONTS).map(f => <option key={f}>{f}</option>)}</select>
      </div>
      <div className="flex-1 bg-[#0c0c0c] rounded-lg p-4 overflow-auto os-scrollbar flex items-center justify-center">
        <pre className="text-[#9b59b6] font-mono text-[12px] leading-tight">{lines.map((l) => l.repeat(text.length)).join("\n")}</pre>
      </div>
      <button className="mt-2 bg-[#3d3d3d] text-white py-2 rounded-lg text-[12px]" onClick={() => navigator.clipboard?.writeText(lines.join("\n"))}>Copy ASCII</button>
    </div>
  );
}
