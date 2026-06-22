import { useState } from "react";
import { Mail, Phone, Building } from "lucide-react";
const CS = [{n:"Alice Cooper",e:"alice@offsec.com",p:"+1-555-0101",c:"OffSec",g:"Work"},{n:"Bob Smith",e:"bob@hacker.com",p:"+1-555-0102",c:"Freelance",g:"Friends"},{n:"Carol White",e:"carol@company.com",p:"+1-555-0103",c:"ACME Corp",g:"Work"}];
export default function Contacts() {
  const [sel,setSel] = useState(0);
  const c = CS[sel];
  return (
    <div className="h-full flex text-[13px]">
      <div className="w-48 border-r border-[#3d3d3d] overflow-y-auto os-scrollbar p-2 shrink-0">
        {CS.map((ct,i)=>(<button key={i} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${sel===i?"bg-[#9b59b6]/20 text-[#9b59b6]":"text-white/60 hover:bg-white/10"}`} onClick={()=>setSel(i)}>
          <div className="w-8 h-8 rounded-full bg-[#9b59b6] flex items-center justify-center text-white text-[11px]">{ct.n.split(" ").map(w=>w[0]).join("")}</div>
          <span className="text-[12px]">{ct.n}</span>
        </button>))}
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3 mb-6"><div className="w-16 h-16 rounded-full bg-[#9b59b6] flex items-center justify-center text-white text-xl">{c.n.split(" ").map(w=>w[0]).join("")}</div><div><div className="text-[16px] text-white font-medium">{c.n}</div><div className="text-[11px] text-[#9b59b6]">{c.g}</div></div></div>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><Mail size={14} className="text-white/40" /><span className="text-white/70">{c.e}</span></div>
          <div className="flex items-center gap-3"><Phone size={14} className="text-white/40" /><span className="text-white/70">{c.p}</span></div>
          <div className="flex items-center gap-3"><Building size={14} className="text-white/40" /><span className="text-white/70">{c.c}</span></div>
        </div>
      </div>
    </div>
  );
}
