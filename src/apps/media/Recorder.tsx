import { useState, useEffect } from "react";
import { Mic, Square, RotateCw } from "lucide-react";

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [bars, setBars] = useState(Array(30).fill(5));

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      setTime((s) => s + 1);
      setBars(Array(30).fill(0).map(() => Math.random() * 40 + 5));
    }, 100);
    return () => clearInterval(t);
  }, [recording]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-[13px]">
      <div className="text-[36px] text-white tabular-nums mb-4">{fmt(time)}</div>
      <div className="flex items-end gap-[2px] h-12 mb-6">
        {bars.map((h, i) => (
          <div key={i} className="w-1 bg-[#9b59b6] rounded-t" style={{ height: `${h}px` }} />
        ))}
      </div>
      <div className="flex gap-4">
        <button
          className={`w-14 h-14 rounded-full flex items-center justify-center ${recording ? "bg-[#e74c3c] animate-pulse" : "bg-[#e74c3c]"}`}
          onClick={() => setRecording(!recording)}
        >
          {recording ? <Square size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
        </button>
        {time > 0 && (
          <button
            className="w-14 h-14 rounded-full bg-[#2d2d2d] flex items-center justify-center"
            onClick={() => {
              setTime(0);
              setRecording(false);
              setBars(Array(30).fill(5));
            }}
          >
            <RotateCw size={18} className="text-white/60" />
          </button>
        )}
      </div>
    </div>
  );
}
