import { useState } from "react";
const FORMATS = ["MP4","AVI","MKV","MOV","MP3","WAV","FLAC"];
export default function Converter() {
  const [files] = useState([{n:"video.mp4",f:"MP4",t:"MKV",p:100},{n:"audio.wav",f:"WAV",t:"MP3",p:60}]);
  const [from,setFrom] = useState("MP4");
  const [to,setTo] = useState("MKV");
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <select className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white" value={from} onChange={e=>setFrom(e.target.value)}>{FORMATS.map(f=><option key={f}>{f}</option>)}</select>
        <span className="text-white/40 self-center">→</span>
        <select className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white" value={to} onChange={e=>setTo(e.target.value)}>{FORMATS.map(f=><option key={f}>{f}</option>)}</select>
      </div>
      <div className="flex-1 overflow-y-auto os-scrollbar space-y-2">
        {files.map((f,i)=>(<div key={i} className="bg-[#2d2d2d] rounded-lg p-3">
          <div className="flex justify-between mb-1"><span className="text-white/80">{f.n}</span><span className="text-[11px] text-white/40">{f.f} → {f.t}</span></div>
          <div className="w-full h-2 bg-[#3d3d3d] rounded-full"><div className="h-full bg-[#9b59b6]" style={{width:`${f.p}%`}} /></div>
        </div>))}
      </div>
    </div>
  );
}
