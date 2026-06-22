import { useState } from "react";
const FEEDS = [{n:"Kali Blog",items:[{t:"Kali 2024.4 Release",d:"2h ago"},{t:"New Tools Added",d:"1d ago"}]},{n:"Exploit-DB",items:[{t:"CVE-2024-9999 PoC",d:"5h ago"}]},{n:"Hacker News",items:[{t:"New LLM Jailbreak",d:"30m ago"}]}];
export default function Rss() {
  const [f,setF] = useState(0);
  const [it,setIt] = useState(0);
  return (
    <div className="h-full flex text-[13px]">
      <div className="w-40 border-r border-[#3d3d3d] p-2 shrink-0">
        {FEEDS.map((fd,i)=><button key={i} className={`w-full text-left px-3 py-2 rounded-lg text-[12px] ${f===i?"bg-[#9b59b6]/20 text-[#9b59b6]":"text-white/60 hover:bg-white/10"}`} onClick={()=>setF(i)}>{fd.n}</button>)}
      </div>
      <div className="w-64 border-r border-[#3d3d3d] overflow-y-auto os-scrollbar">
        {FEEDS[f].items.map((item,i)=>(<button key={i} className={`w-full text-left px-3 py-2.5 border-b border-[#3d3d3d] ${it===i?"bg-white/5":""}`} onClick={()=>setIt(i)}><div className="text-[12px] text-white/80">{item.t}</div><div className="text-[10px] text-white/40">{item.d}</div></button>))}
      </div>
      <div className="flex-1 p-4"><h2 className="text-[16px] text-white font-medium mb-2">{FEEDS[f].items[it]?.t}</h2><p className="text-[13px] text-white/60 leading-relaxed">Article summary about {FEEDS[f].items[it]?.t}.</p></div>
    </div>
  );
}
