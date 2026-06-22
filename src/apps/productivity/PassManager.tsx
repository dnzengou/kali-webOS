import { useState } from "react";
import { Eye, EyeOff, Copy, Plus, Trash2 } from "lucide-react";
const ENTRIES = [{site:"GitHub",u:"hacker123",p:"SuperSecret123!"},{site:"HackTheBox",u:"pentester",p:"BoxPwn3d!"},{site:"TryHackMe",u:"learner",p:"THM_R00t"}];
export default function PassManager() {
  const [entries,setEntries] = useState(ENTRIES);
  const [show,setShow] = useState<Record<string,boolean>>({});
  const [add,setAdd] = useState(false);
  const [s,setS] = useState("");
  const [u,setU] = useState("");
  const [p,setP] = useState("");
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex justify-between mb-3"><input className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-[12px] outline-none w-48" placeholder="Search..." /><button className="bg-[#9b59b6] text-white px-3 rounded-lg" onClick={()=>setAdd(!add)}><Plus size={14} /></button></div>
      {add && (<div className="bg-[#2d2d2d] rounded-lg p-3 mb-3 space-y-2"><input className="w-full bg-[#1a1a1a] border border-[#3d3d3d] rounded px-2 py-1 text-white text-[12px]" placeholder="Site" value={s} onChange={e=>setS(e.target.value)} /><input className="w-full bg-[#1a1a1a] border border-[#3d3d3d] rounded px-2 py-1 text-white text-[12px]" placeholder="Username" value={u} onChange={e=>setU(e.target.value)} /><input className="w-full bg-[#1a1a1a] border border-[#3d3d3d] rounded px-2 py-1 text-white text-[12px]" placeholder="Password" value={p} onChange={e=>setP(e.target.value)} /><button className="bg-[#27ae60] text-white px-3 py-1 rounded text-[12px]" onClick={()=>{if(s&&p){setEntries([...entries,{site:s,u,p}]);setS("");setU("");setP("");setAdd(false)}}}>Save</button></div>)}
      <div className="flex-1 overflow-y-auto os-scrollbar space-y-2">
        {entries.map((e,i)=>(<div key={i} className="bg-[#2d2d2d] rounded-lg p-3">
          <div className="flex justify-between mb-1"><span className="text-white/90 font-medium">{e.site}</span><button className="text-white/20 hover:text-[#e74c3c]" onClick={()=>setEntries(entries.filter((_,j)=>j!==i))}><Trash2 size={12} /></button></div>
          <div className="text-white/50 text-[11px]">{e.u}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/80 font-mono text-[12px]">{show[i]?e.p:"•".repeat(e.p.length)}</span>
            <button className="text-white/30 hover:text-white" onClick={()=>setShow({...show,[i]:!show[i]})}>{show[i]?<EyeOff size={12}/>:<Eye size={12}/>}</button>
            <button className="text-white/30 hover:text-white" onClick={()=>navigator.clipboard?.writeText(e.p)}><Copy size={12}/></button>
          </div>
        </div>))}
      </div>
    </div>
  );
}
