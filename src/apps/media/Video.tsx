import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Maximize, Volume2 } from "lucide-react";
export default function Video() {
  const [playing,setPlaying] = useState(false);
  const [prog] = useState(0);
  const [vol,setVol] = useState(80);
  return (
    <div className="h-full flex flex-col text-[13px]">
      <div className="flex-1 bg-black flex items-center justify-center relative">
        <div className="text-center"><div className="text-[64px] mb-2">&#127909;</div><div className="text-white/50">Video Player</div></div>
      </div>
      <div className="px-3 py-2 bg-[#1a1a1a]">
        <div className="w-full h-1.5 bg-[#3d3d3d] rounded-full mb-2 cursor-pointer"><div className="h-full bg-[#9b59b6] rounded-full" style={{width:`${prog}%`}} /></div>
        <div className="flex items-center gap-3">
          <button className="text-white/60 hover:text-white" onClick={()=>setPlaying(!playing)}>{playing?<Pause size={16} />:<Play size={16} />}</button>
          <button className="text-white/40 hover:text-white"><SkipBack size={14} /></button>
          <button className="text-white/40 hover:text-white"><SkipForward size={14} /></button>
          <span className="text-white/40 text-[11px]">02:14 / 10:42</span>
          <div className="ml-auto flex items-center gap-2"><Volume2 size={14} className="text-white/40" /><input type="range" min="0" max="100" value={vol} onChange={e=>setVol(Number(e.target.value))} className="w-16 accent-[#9b59b6]" /></div>
          <button className="text-white/40 hover:text-white"><Maximize size={14} /></button>
        </div>
      </div>
    </div>
  );
}
