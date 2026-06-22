import { useState, useRef, useEffect } from "react";
export default function PhotoEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bright,setBright] = useState(0);
  const [contrast,setContrast] = useState(0);
  const [sat,setSat] = useState(0);
  const [blur,setBlur] = useState(0);
  const [filter,setFilter] = useState("none");
  useEffect(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext("2d");if(!ctx)return;ctx.fillStyle="#2d2d2d";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#9b59b6";ctx.font="20px sans-serif";ctx.textAlign="center";ctx.fillText("Sample Image",c.width/2,c.height/2);},[]);
  return (
    <div className="h-full flex text-[13px]">
      <div className="flex-1 bg-[#0c0c0c] flex items-center justify-center p-4">
        <canvas ref={canvasRef} width={600} height={400} className="max-w-full max-h-full" style={{filter:`brightness(${100+bright}%) contrast(${100+contrast}%) saturate(${100+sat}%) blur(${blur}px)${filter==="grayscale"?" grayscale(100%)":filter==="sepia"?" sepia(100%)":""}`}} />
      </div>
      <div className="w-52 border-l border-[#3d3d3d] p-3 shrink-0 overflow-y-auto os-scrollbar">
        <div className="text-[11px] text-white/40 mb-2">Adjustments</div>
        {[{l:"Brightness",v:bright,s:setBright},{l:"Contrast",v:contrast,s:setContrast},{l:"Saturation",v:sat,s:setSat},{l:"Blur",v:blur,s:setBlur}].map(p=>(<div key={p.l} className="mb-2"><div className="flex justify-between text-[11px] text-white/60 mb-1"><span>{p.l}</span><span>{p.v}</span></div><input type="range" min="-100" max="100" value={p.v} onChange={e=>p.s(Number(e.target.value))} className="w-full accent-[#9b59b6]" /></div>))}
        <div className="text-[11px] text-white/40 mb-2 mt-3">Filters</div>
        <div className="grid grid-cols-2 gap-1">{["none","grayscale","sepia"].map(f=><button key={f} className={`px-2 py-1 rounded text-[11px] ${filter===f?"bg-[#9b59b6] text-white":"bg-[#2d2d2d] text-white/60"}`} onClick={()=>setFilter(f)}>{f}</button>)}</div>
      </div>
    </div>
  );
}
