import { useState } from "react";
export default function NetTools() {
  const [tool,setTool] = useState<"ping"|"traceroute">("ping");
  const [host,setHost] = useState("8.8.8.8");
  const [out,setOut] = useState<string[]>([]);
  const run = () => setOut(tool==="ping"?[`PING ${host}`,`64 bytes: time=14.2ms`,`0% packet loss`]:[`1 192.168.1.1 1.2ms`,`2 ${host} 14.2ms`]);
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-3">
        <button className={`px-3 py-1.5 rounded-lg ${tool==="ping"?"bg-[#9b59b6] text-white":"bg-[#2d2d2d] text-white/60"}`} onClick={()=>setTool("ping")}>Ping</button>
        <button className={`px-3 py-1.5 rounded-lg ${tool==="traceroute"?"bg-[#9b59b6] text-white":"bg-[#2d2d2d] text-white/60"}`} onClick={()=>setTool("traceroute")}>Traceroute</button>
      </div>
      <div className="flex gap-2 mb-3"><input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none" value={host} onChange={e=>setHost(e.target.value)} /><button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg" onClick={run}>Run</button></div>
      <div className="flex-1 bg-[#0c0c0c] rounded-lg p-3 overflow-y-auto terminal-text text-[12px] text-white/80">{out.map((l,i)=><div key={i}>{l}</div>)}</div>
    </div>
  );
}
