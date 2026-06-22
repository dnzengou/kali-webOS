import { useState, useEffect, useRef } from "react";

export default function Camera() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photos,setPhotos] = useState<string[]>([]);
  useEffect(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext("2d");if(!ctx)return;const draw=()=>{ctx.fillStyle="#1a1a1a";ctx.fillRect(0,0,c.width,c.height);const t=Date.now()/1000;for(let i=0;i<20;i++){ctx.fillStyle=`rgba(${100+Math.sin(t+i)*100},${50+Math.cos(t+i*0.5)*50},150,0.3)`;ctx.fillRect(100+i*30+Math.sin(t+i)*20,100+Math.cos(t+i)*50,40,40)}requestAnimationFrame(draw)};draw()},[]);
  const snap=()=>{const c=canvasRef.current;if(!c)return;setPhotos([c.toDataURL(),...photos])};
  return (
    <div className="h-full flex flex-col text-[13px]">
      <div className="flex-1 bg-black relative overflow-hidden"><canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover" /></div>
      <div className="h-16 bg-[#1a1a1a] flex items-center justify-center gap-4">
        <div className="flex gap-1">{photos.slice(0,5).map((p,i)=>(<img key={i} src={p} className="w-10 h-10 rounded object-cover" />))}</div>
        <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center" onClick={snap}><div className="w-10 h-10 rounded-full border-2 border-black" /></button>
      </div>
    </div>
  );
}
