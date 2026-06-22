import { useState } from "react";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
export default function DocViewer() {
  const [page,setPage] = useState(1);
  const [zoom,setZoom] = useState(100);
  return (
    <div className="h-full flex flex-col text-[13px]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#3d3d3d]">
        <button className="text-white/40 hover:text-white" onClick={()=>setZoom(z=>Math.min(200,z+25))}><ZoomIn size={14} /></button>
        <button className="text-white/40 hover:text-white" onClick={()=>setZoom(z=>Math.max(25,z-25))}><ZoomOut size={14} /></button>
        <span className="text-white/40 text-[11px]">{zoom}%</span>
        <div className="w-px h-4 bg-[#3d3d3d] mx-1" />
        <button className="text-white/40 hover:text-white" onClick={()=>setPage(p=>Math.max(1,p-1))}><ChevronLeft size={14} /></button>
        <span className="text-white/60 text-[11px]">{page} / 5</span>
        <button className="text-white/40 hover:text-white" onClick={()=>setPage(p=>Math.min(5,p+1))}><ChevronRight size={14} /></button>
      </div>
      <div className="flex-1 overflow-auto os-scrollbar p-6 flex justify-center">
        <div className="bg-white text-black p-8 rounded shadow-lg max-w-[600px]" style={{transform:`scale(${zoom/100})`,transformOrigin:"top center"}}>
          <h1 className="text-[20px] font-bold mb-4">Kali Linux Documentation</h1>
          <p className="text-[13px] mb-3 leading-relaxed">Kali Linux is a Debian-derived Linux distribution designed for digital forensics and penetration testing. It is maintained and funded by Offensive Security.</p>
          <p className="text-[13px] mb-3 leading-relaxed">Page {page}: This document covers the basic usage of Kali tools including nmap, metasploit, wireshark, and aircrack-ng.</p>
          <div className="text-[11px] text-gray-500 mt-8">Document {page} of 5</div>
        </div>
      </div>
    </div>
  );
}
