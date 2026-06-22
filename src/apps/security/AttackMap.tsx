import { useState, useEffect, useRef } from "react";

const ATTACK_TYPES = [
  { name: "DDoS", color: "#e74c3c" },
  { name: "Malware", color: "#f39c12" },
  { name: "Intrusion", color: "#9b59b6" },
  { name: "Phishing", color: "#2ecc71" },
];

const COUNTRIES = [
  { name: "US", x: 150, y: 130 }, { name: "CN", x: 500, y: 140 }, { name: "RU", x: 450, y: 80 },
  { name: "DE", x: 310, y: 90 }, { name: "BR", x: 200, y: 220 }, { name: "IN", x: 460, y: 170 },
  { name: "GB", x: 290, y: 85 }, { name: "JP", x: 580, y: 120 }, { name: "FR", x: 300, y: 100 },
  { name: "AU", x: 540, y: 260 }, { name: "CA", x: 140, y: 90 }, { name: "KR", x: 560, y: 130 },
];

export default function AttackMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [attacks, setAttacks] = useState<{src: string, dst: string, type: string, time: string}[]>([]);
  const [total, setTotal] = useState(1247);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lines: {x1: number, y1: number, x2: number, y2: number, color: string, progress: number}[] = [];

    const animate = () => {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw countries
      COUNTRIES.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#3d3d3d";
        ctx.fill();
        ctx.fillStyle = "#666";
        ctx.font = "10px sans-serif";
        ctx.fillText(c.name, c.x - 8, c.y + 14);
      });

      // Draw and update lines
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i];
        l.progress += 0.02;
        if (l.progress >= 1) { lines.splice(i, 1); continue; }

        const cx = l.x1 + (l.x2 - l.x1) * l.progress;
        const cy = l.y1 + (l.y2 - l.y1) * l.progress;

        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = l.color;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };
    animate();

    const interval = setInterval(() => {
      const src = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const dst = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      if (src === dst) return;
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      lines.push({ x1: src.x, y1: src.y, x2: dst.x, y2: dst.y, color: type.color, progress: 0 });
      setTotal((t) => t + 1);
      setAttacks((a) => [{ src: src.name, dst: dst.name, type: type.name, time: new Date().toLocaleTimeString() }, ...a].slice(0, 20));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3d3d3d] text-[13px]">
        <div className="text-white/70">Total attacks: <span className="text-[#e74c3c]">{total.toLocaleString()}</span></div>
        <div className="flex gap-3">
          {ATTACK_TYPES.map((t) => <div key={t.name} className="flex items-center gap-1 text-[11px] text-white/50"><div className="w-2 h-2 rounded-full" style={{ background: t.color }} />{t.name}</div>)}
        </div>
      </div>
      <div className="flex-1 flex">
        <canvas ref={canvasRef} width={700} height={400} className="flex-1" />
        <div className="w-40 border-l border-[#3d3d3d] overflow-y-auto os-scrollbar p-2">
          <div className="text-[10px] text-white/40 mb-1">Live attacks</div>
          {attacks.map((a, i) => (
            <div key={i} className="text-[10px] py-0.5 border-b border-[#3d3d3d]/50">
              <span className="text-white/60">{a.time}</span>
              <div className="text-white/40">{a.src} → {a.dst}</div>
              <span className="text-[#e74c3c]">{a.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
