import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart } from "lucide-react";

const TRACKS = [
  { t: "Cyber Attack",      a: "Kali Beats",   d: "3:42", g1: "#9b59b6", g2: "#1a1a2e" },
  { t: "Nmap Scan",         a: "Root User",    d: "4:15", g1: "#e74c3c", g2: "#1a0a0a" },
  { t: "Shell Shock",       a: "Pentester",    d: "3:28", g1: "#27ae60", g2: "#0a1a0a" },
  { t: "Buffer Overflow",   a: "Hacker One",   d: "5:01", g1: "#2980b9", g2: "#0a0a1a" },
  { t: "Zero Day",          a: "OffSec",       d: "4:33", g1: "#f39c12", g2: "#1a1000" },
  { t: "SQL Injection",     a: "D4rk C0der",   d: "3:55", g1: "#1abc9c", g2: "#001a15" },
  { t: "Kernel Panic",      a: "sysroot",      d: "4:12", g1: "#c0392b", g2: "#1a0000" },
  { t: "Privilege Escalate", a: "r00tkit",     d: "2:58", g1: "#8e44ad", g2: "#15001a" },
];

const parseDur = (d: string) => parseInt(d.split(":")[0]) * 60 + parseInt(d.split(":")[1]);
const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Animated EQ bars
function EqBars({ playing, color }: { playing: boolean; color: string }) {
  const bars = 20;
  return (
    <div className="flex items-end gap-[2px] h-8">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="rounded-full flex-1"
          style={{
            background: color,
            opacity: 0.7,
            height: playing ? `${20 + Math.sin(Date.now() / 200 + i) * 40}%` : "15%",
            minHeight: 3,
            animation: playing ? `eqBar ${0.4 + (i % 5) * 0.15}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Music() {
  const [playing,  setPlaying]  = useState(false);
  const [track,    setTrack]    = useState(0);
  const [prog,     setProg]     = useState(0);    // 0–100
  const [volume,   setVolume]   = useState(80);
  const [muted,    setMuted]    = useState(false);
  const [shuffle,  setShuffle]  = useState(false);
  const [repeat,   setRepeat]   = useState(false);
  const [liked,    setLiked]    = useState<Set<number>>(new Set());
  const [, forceRender] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tr  = TRACKS[track];
  const dur = parseDur(tr.d);

  // Tick progress
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setProg((p) => {
        if (p >= 100) {
          if (repeat) return 0;
          // advance track
          setPlaying(false);
          setTrack((t) => shuffle ? Math.floor(Math.random() * TRACKS.length) : (t + 1) % TRACKS.length);
          return 0;
        }
        return p + 100 / dur / 10;
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, dur, repeat, shuffle]);

  // Repaint EQ bars
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => forceRender((n) => n + 1), 80);
    return () => clearInterval(id);
  }, [playing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space")       { e.preventDefault(); setPlaying((p) => !p); }
      if (e.code === "ArrowRight")  { setProg((p) => Math.min(100, p + 5)); }
      if (e.code === "ArrowLeft")   { setProg((p) => Math.max(0,   p - 5)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const changeTrack = useCallback((delta: number) => {
    setTrack((t) => {
      const nt = shuffle ? Math.floor(Math.random() * TRACKS.length)
        : (t + delta + TRACKS.length) % TRACKS.length;
      return nt;
    });
    setProg(0);
    setPlaying(true);
  }, [shuffle]);

  const toggleLike = (i: number) => setLiked((s) => {
    const ns = new Set(s);
    ns.has(i) ? ns.delete(i) : ns.add(i);
    return ns;
  });

  const curSec = Math.floor(prog / 100 * dur);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#0e0e0e" }}>
      {/* Album art */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{
          height: 180,
          background: `linear-gradient(135deg, ${tr.g1} 0%, ${tr.g2} 100%)`,
          transition: "background 0.6s ease",
        }}
      >
        {/* Big music note */}
        <div className="text-[72px] select-none" style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))", opacity: 0.9 }}>
          🎵
        </div>

        {/* EQ overlay at bottom */}
        <div className="absolute bottom-3 left-4 right-4">
          <EqBars playing={playing} color={tr.g1} />
        </div>

        {/* Like button */}
        <button
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/30 transition-colors"
          onClick={() => toggleLike(track)}
        >
          <Heart
            size={16}
            style={{ color: liked.has(track) ? "#e74c3c" : "rgba(255,255,255,0.4)", fill: liked.has(track) ? "#e74c3c" : "none" }}
          />
        </button>
      </div>

      {/* Track info */}
      <div className="px-5 pt-4 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[15px] font-semibold text-white leading-tight">{tr.t}</p>
          <p className="text-[12px] text-white/45 mt-0.5">{tr.a}</p>
        </div>
        <div className="text-[10px] text-white/25 mt-1 tabular-nums">{fmt(curSec)} / {tr.d}</div>
      </div>

      {/* Scrubber */}
      <div className="px-5 mb-3">
        <div className="relative h-1.5 rounded-full cursor-pointer group" style={{ background: "rgba(255,255,255,0.1)" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProg(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all"
            style={{ width: `${prog}%`, background: tr.g1 }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${prog}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 px-5 mb-3">
        <button
          onClick={() => setShuffle(!shuffle)}
          className={`transition-all hover:scale-110 ${shuffle ? "text-[#9b59b6]" : "text-white/35 hover:text-white/65"}`}
        >
          <Shuffle size={16} />
        </button>
        <button
          onClick={() => changeTrack(-1)}
          className="text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95"
        >
          <SkipBack size={22} />
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${tr.g1}, ${tr.g1}cc)`,
            boxShadow: `0 4px 24px ${tr.g1}55`,
          }}
        >
          {playing
            ? <Pause  size={22} className="text-white" />
            : <Play   size={22} className="text-white ml-1" />
          }
        </button>
        <button
          onClick={() => changeTrack(1)}
          className="text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95"
        >
          <SkipForward size={22} />
        </button>
        <button
          onClick={() => setRepeat(!repeat)}
          className={`transition-all hover:scale-110 ${repeat ? "text-[#9b59b6]" : "text-white/35 hover:text-white/65"}`}
        >
          <Repeat size={16} />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 px-5 mb-3">
        <button onClick={() => setMuted(!muted)} className="text-white/35 hover:text-white/70 transition-colors shrink-0">
          {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <input
          type="range" min={0} max={100} value={muted ? 0 : volume}
          onChange={(e) => { setVolume(+e.target.value); setMuted(false); }}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: tr.g1 }}
        />
        <span className="text-[10px] text-white/30 w-7 text-right tabular-nums">{muted ? 0 : volume}</span>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {TRACKS.map((t, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all group"
            style={{ background: track === i ? `${t.g1}22` : "transparent" }}
            onClick={() => { setTrack(i); setProg(0); setPlaying(true); }}
          >
            {/* Color dot */}
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[14px]"
              style={{ background: `${t.g1}33` }}>
              {track === i && playing ? "▶" : <span className="text-white/30 text-[11px]">{i + 1}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] truncate ${track === i ? "text-white font-medium" : "text-white/65"}`}>{t.t}</p>
              <p className="text-[10px] text-white/30 truncate">{t.a}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {liked.has(i) && <Heart size={10} style={{ color: "#e74c3c", fill: "#e74c3c" }} />}
              <span className="text-[10px] text-white/30 tabular-nums">{t.d}</span>
            </div>
          </button>
        ))}
      </div>

      {/* EQ animation keyframes injected inline */}
      <style>{`
        @keyframes eqBar {
          from { height: 10%; }
          to   { height: 90%; }
        }
      `}</style>
    </div>
  );
}
