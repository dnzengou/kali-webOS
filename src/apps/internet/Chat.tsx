import { useState } from "react";
import { Send } from "lucide-react";
const CHS = ["#general","#kali-linux","#exploit-dev","#ctf"];
const MS = [{u:"hacker1",m:"Anyone tried the new CVE?",c:"#general",t:"10:30"},{u:"pentest_pro",m:"Yeah, critical!",c:"#general",t:"10:31"},{u:"root_admin",m:"New module ready",c:"#exploit-dev",t:"10:25"}];
export default function Chat() {
  const [c,setC] = useState("#general");
  const [msgs,setMsgs] = useState(MS);
  const [inp,setInp] = useState("");
  const f = msgs.filter(x => x.c === c);
  return (
    <div className="h-full flex text-[13px]">
      <div className="w-40 border-r border-[#3d3d3d] p-2 shrink-0">
        <div className="text-[10px] text-white/40 mb-2">Channels</div>
        {CHS.map(ch => <button key={ch} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] ${c===ch?"bg-[#9b59b6]/20 text-[#9b59b6]":"text-white/60 hover:bg-white/10"}`} onClick={()=>setC(ch)}>{ch}</button>)}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="px-3 py-2 border-b border-[#3d3d3d] text-white/80">{c}</div>
        <div className="flex-1 overflow-y-auto os-scrollbar p-3 space-y-2">
          {f.map((m,i) => <div key={i} className="text-[12px]"><span className="text-white/40">[{m.t}]</span> <span className={m.u==="kali-os"?"text-[#9b59b6]":"text-[#2ecc71]"}>{m.u}</span>: <span className="text-white/70">{m.m}</span></div>)}
        </div>
        <div className="flex gap-2 p-2 border-t border-[#3d3d3d]"><input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-[12px] outline-none" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&inp.trim()&&(setMsgs([...msgs,{u:"kali-os",m:inp,c,t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]),setInp(""))} placeholder="Type..." /><button className="bg-[#9b59b6] text-white px-3 rounded-lg" onClick={()=>inp.trim()&&(setMsgs([...msgs,{u:"kali-os",m:inp,c,t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]),setInp(""))}><Send size={14} /></button></div>
      </div>
    </div>
  );
}
