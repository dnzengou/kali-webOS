import { useState } from "react";
const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ROWS = 20;
export default function Spreadsheet() {
  const [data,setData] = useState<Record<string,string>>({"A1":"Name","B1":"Value","A2":"Revenue","B2":"100000","A3":"Expenses","B3":"75000","A4":"Profit","B4":"=B2-B3"});
  const [sel,setSel] = useState("A1");
  const val = data[sel] || "";
  const compute = (v: string) => {
    if (v.startsWith("=")) {
      try {
        const expr = v.slice(1).replace(/([A-Z]+\d+)/g, (m) => data[m] || "0");
        return String(Function(`"use strict"; return (${expr})`)());
      } catch { return "#ERR"; }
    }
    return v;
  };
  return (
    <div className="h-full flex flex-col text-[13px]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#3d3d3d]"><span className="text-white/50 text-[11px]">{sel}</span><input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded px-2 py-1 text-white text-[11px] outline-none" value={val} onChange={e=>setData({...data,[sel]:e.target.value})} /></div>
      <div className="flex-1 overflow-auto os-scrollbar">
        <div style={{display:"grid",gridTemplateColumns:`40px repeat(${COLS.length},80px)`}}>
          <div className="bg-[#1a1a1a] sticky top-0 left-0 z-10"></div>
          {COLS.map(c=><div key={c} className="bg-[#1a1a1a] text-white/50 text-[10px] text-center py-1 sticky top-0">{c}</div>)}
          {Array.from({length:ROWS},(_,r)=>r+1).flatMap(r=>[
            <div key={`r${r}`} className="bg-[#1a1a1a] text-white/50 text-[10px] text-center py-1 sticky left-0">{r}</div>,
            ...COLS.map(c=>{const computed=compute(data[`${c}${r}`]||"");return(<div key={`${c}${r}`} className={`border-r border-b border-[#3d3d3d] px-1 py-1 text-[11px] truncate cursor-pointer ${sel===`${c}${r}`?"bg-[#9b59b6]/20 border border-[#9b59b6]":"text-white/80 hover:bg-white/5"}`} onClick={()=>setSel(`${c}${r}`)}>{computed}</div>);})
          ])}
        </div>
      </div>
    </div>
  );
}
