import { useState } from "react";
import { Monitor, Play, Square } from "lucide-react";
export default function ScreenRec() {
  const [recording,setRecording] = useState(false);
  const [time,setTime] = useState(0);
  useState(()=>{const i=setInterval(()=>setTime(t=>t+1),1000);return()=>clearInterval(i)});
  const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-[13px]">
      <Monitor size={48} className="text-white/20 mb-4" />
      <div className="text-[24px] text-white tabular-nums mb-4">{fmt(time)}</div>
      <div className="flex gap-3 mb-4">
        <select className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-[12px]"><option>Full Screen</option><option>Window</option><option>Tab</option></select>
        <select className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-[12px]"><option>1080p</option><option>720p</option><option>480p</option></select>
      </div>
      <button className={`w-16 h-16 rounded-full flex items-center justify-center ${recording?"bg-[#e74c3c]":"bg-[#27ae60]"}`} onClick={()=>setRecording(!recording)}>{recording?<Square size={24} className="text-white" />:<Play size={24} className="text-white ml-1" />}</button>
    </div>
  );
}
