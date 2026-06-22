import { useState } from "react";
import { Shield, Wifi } from "lucide-react";
const SVR = [{c:"United States",p:23,l:45},{c:"Germany",p:45,l:30},{c:"Netherlands",p:38,l:60},{c:"Japan",p:120,l:20},{c:"Singapore",p:85,l:55},{c:"United Kingdom",p:35,l:40}];
export default function Vpn() {
  const [conn,setConn] = useState(false);
  const [srv,setSrv] = useState(0);
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex justify-center py-6"><div className={`w-20 h-20 rounded-full flex items-center justify-center ${conn?"bg-[#27ae60]/20":"bg-[#3d3d3d]"}`}><Shield size={36} className={conn?"text-[#27ae60]":"text-white/40"} /></div></div>
      <div className="text-center mb-4"><div className="text-white/90">{conn?`Connected to ${SVR[srv].c}`:"Disconnected"}</div><div className="text-[11px] text-white/40">{conn?"IP: 185.220.101.42":"Your IP: 192.168.1.100"}</div></div>
      <button className={`w-full py-2.5 rounded-lg text-white font-medium mb-4 ${conn?"bg-[#e74c3c]":"bg-[#27ae60]"}`} onClick={()=>setConn(!conn)}>{conn?"Disconnect":"Connect"}</button>
      <div className="flex-1 overflow-y-auto">{SVR.map((s,i)=>(<button key={i} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${srv===i?"bg-[#9b59b6]/20":"hover:bg-white/5"}`} onClick={()=>setSrv(i)}>
        <Wifi size={14} className={s.p<50?"text-[#2ecc71]":s.p<100?"text-[#f39c12]":"text-[#e74c3c]"} /><span className="flex-1 text-white/80">{s.c}</span><span className="text-[11px] text-white/40">{s.p}ms</span>
      </button>))}</div>
    </div>
  );
}
