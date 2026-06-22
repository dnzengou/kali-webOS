import { useState } from "react";
import { Globe, Trash2 } from "lucide-react";
const BMS = [{t:"Exploit-DB",u:"https://exploit-db.com",f:"Security"},{t:"HackTheBox",u:"https://hackthebox.com",f:"Training"},{t:"Kali Tools",u:"https://tools.kali.org",f:"Tools"},{t:"OffSec",u:"https://offsec.com",f:"Training"},{t:"OWASP",u:"https://owasp.org",f:"Security"}];
export default function Bookmarks() {
  const [bms,setBms] = useState(BMS);
  const [f,setF] = useState("All");
  const folders = ["All",...new Set(BMS.map(b=>b.f))];
  const filtered = f==="All"?bms:bms.filter(b=>b.f===f);
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-1 mb-3">
        {folders.map(fd=><button key={fd} className={`px-3 py-1 rounded-full text-[11px] ${f===fd?"bg-[#9b59b6] text-white":"bg-[#2d2d2d] text-white/50"}`} onClick={()=>setF(fd)}>{fd}</button>)}
      </div>
      <div className="flex-1 overflow-y-auto os-scrollbar space-y-2">
        {filtered.map((b,i)=>(<div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
          <Globe size={16} className="text-[#9b59b6]" />
          <div className="flex-1"><div className="text-white/80">{b.t}</div><div className="text-[11px] text-white/40">{b.u}</div></div>
          <span className="text-[10px] text-white/30 bg-[#2d2d2d] px-2 py-0.5 rounded">{b.f}</span>
          <button className="text-white/20 hover:text-[#e74c3c]" onClick={()=>setBms(bms.filter((_,j)=>j!==i))}><Trash2 size={12} /></button>
        </div>))}
      </div>
    </div>
  );
}
