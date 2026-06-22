import { useState } from "react";

export default function Editor() {
  const [content, setContent] = useState("// Welcome to Kali Text Editor\n// Start typing...\n\nfunction exploit() {\n  console.log('Pwned!');\n}\n");
  const [wrap, setWrap] = useState(false);
  const lines = content.split("\n");

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#3d3d3d] text-[11px]">
        <button className="text-white/50 hover:text-white px-2 py-0.5">New</button>
        <button className="text-white/50 hover:text-white px-2 py-0.5">Open</button>
        <button className="text-white/50 hover:text-white px-2 py-0.5">Save</button>
        <div className="w-px h-3 bg-[#3d3d3d] mx-1" />
        <button className="text-white/50 hover:text-white px-2 py-0.5">Bold</button>
        <button className="text-white/50 hover:text-white px-2 py-0.5">Italic</button>
        <div className="ml-auto">
          <button className={`px-2 py-0.5 rounded ${wrap ? "bg-[#9b59b6]/30 text-[#9b59b6]" : "text-white/50"}`} onClick={() => setWrap(!wrap)}>Wrap</button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-10 shrink-0 text-right pr-2 pt-2 text-[12px] text-white/30 select-none border-r border-[#3d3d3d]">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          className="flex-1 bg-transparent text-white/90 p-2 text-[13px] outline-none resize-none terminal-text"
          style={{ whiteSpace: wrap ? "pre-wrap" : "pre", overflowWrap: wrap ? "break-word" : "normal" }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div className="px-3 py-1 text-[10px] text-white/40 border-t border-[#3d3d3d]">
        {lines.length} lines | {content.length} chars | UTF-8
      </div>
    </div>
  );
}
