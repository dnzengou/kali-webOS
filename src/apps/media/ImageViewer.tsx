import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
const IMAGES = [{n:"screenshot1.png",w:1920,h:1080},{n:"screenshot2.png",w:1280,h:720},{n:"scan_result.png",w:800,h:600}];
export default function ImageViewer() {
  const [idx,setIdx] = useState(0);
  const [zoom,setZoom] = useState(100);
  const img = IMAGES[idx];
  return (
    <div className="h-full flex flex-col text-[13px]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#3d3d3d]">
        <button className="text-white/40 hover:text-white" onClick={()=>setZoom(z=>Math.min(200,z+25))}><ZoomIn size={14} /></button>
        <button className="text-white/40 hover:text-white" onClick={()=>setZoom(z=>Math.max(25,z-25))}><ZoomOut size={14} /></button>
        <button className="text-white/40 hover:text-white"><RotateCw size={14} /></button>
        <span className="text-white/40 text-[11px]">{zoom}%</span>
        <div className="ml-auto flex gap-1"><button className="text-white/40 hover:text-white" onClick={()=>setIdx(i=>Math.max(0,i-1))}><ChevronLeft size={14} /></button><span className="text-white/60 text-[11px]">{idx+1}/{IMAGES.length}</span><button className="text-white/40 hover:text-white" onClick={()=>setIdx(i=>Math.min(IMAGES.length-1,i+1))}><ChevronRight size={14} /></button></div>
      </div>
      <div className="flex-1 bg-[#0c0c0c] flex items-center justify-center overflow-hidden">
        <div className="w-[600px] h-[400px] bg-[#2d2d2d] flex items-center justify-center" style={{transform:`scale(${zoom/100})`}}>
          <div className="text-center"><div className="text-[48px]">&#128444;</div><div className="text-white/50 mt-2">{img.n}</div><div className="text-white/30 text-[11px]">{img.w}x{img.h}</div></div>
        </div>
      </div>
    </div>
  );
}
