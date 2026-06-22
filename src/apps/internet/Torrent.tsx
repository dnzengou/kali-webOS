import { Play, Pause, Trash2 } from "lucide-react";
const TS = [{n:"Kali Linux 2024.4.iso",s:"4.2 GB",p:100,st:"seeding",sp:"2.4 MB/s"},{n:"BlackArch Linux.iso",s:"18.5 GB",p:78,st:"downloading",sp:"8.7 MB/s"},{n:"Parrot Security.iso",s:"5.1 GB",p:45,st:"downloading",sp:"4.2 MB/s"},{n:"Security Tools.zip",s:"2.3 GB",p:100,st:"completed",sp:"0"}];
export default function Torrent() {
  return (
    <div className="h-full flex flex-col text-[13px]">
      <div className="flex gap-2 px-3 py-2 border-b border-[#3d3d3d]"><Play size={14} className="text-white/40" /><Pause size={14} className="text-white/40" /><Trash2 size={14} className="text-white/40" /></div>
      <div className="flex-1 overflow-y-auto os-scrollbar p-2">
        {TS.map((t,i)=>(<div key={i} className="flex items-center gap-3 p-2 border-b border-[#3d3d3d]"><div className="flex-1"><div className="text-white/80">{t.n}</div><div className="w-24 h-2 bg-[#3d3d3d] rounded-full overflow-hidden mt-1"><div className="h-full bg-[#9b59b6]" style={{width:`${t.p}%`}} /></div></div><span className="text-white/50 text-[11px]">{t.s}</span><span className="text-white/50 text-[11px]">{t.sp}</span></div>))}
      </div>
    </div>
  );
}
