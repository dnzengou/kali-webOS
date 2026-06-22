import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Flag, Globe } from "lucide-react";

type Tab = "clock" | "stopwatch" | "timer";

const WORLD_ZONES = [
  { city: "New York",  tz: "America/New_York" },
  { city: "London",    tz: "Europe/London"    },
  { city: "Berlin",    tz: "Europe/Berlin"    },
  { city: "Dubai",     tz: "Asia/Dubai"       },
  { city: "Tokyo",     tz: "Asia/Tokyo"       },
  { city: "Sydney",    tz: "Australia/Sydney" },
];

// SVG analog clock
function AnalogFace({ time }: { time: Date }) {
  const sec = time.getSeconds() + time.getMilliseconds() / 1000;
  const min = time.getMinutes() + sec / 60;
  const hr  = (time.getHours() % 12) + min / 60;

  const hand = (deg: number, len: number, w: number, color: string, glow?: string) => {
    const r = (deg - 90) * (Math.PI / 180);
    const x2 = 100 + len * Math.cos(r);
    const y2 = 100 + len * Math.sin(r);
    return (
      <line x1="100" y1="100" x2={x2} y2={y2}
        stroke={color} strokeWidth={w} strokeLinecap="round"
        style={{ filter: glow ? `drop-shadow(0 0 4px ${glow})` : undefined,
                 transition: "none" }} />
    );
  };

  return (
    <svg viewBox="0 0 200 200" className="w-52 h-52 drop-shadow-xl">
      {/* Outer ring */}
      <circle cx="100" cy="100" r="96" fill="none"
        stroke="rgba(155,89,182,0.3)" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="90" fill="rgba(0,0,0,0.6)" />

      {/* Tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const isMajor = i % 5 === 0;
        const a = (i * 6 - 90) * (Math.PI / 180);
        const r1 = isMajor ? 76 : 82;
        const r2 = 88;
        return (
          <line key={i}
            x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)}
            x2={100 + r2 * Math.cos(a)} y2={100 + r2 * Math.sin(a)}
            stroke={isMajor ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)"}
            strokeWidth={isMajor ? 2 : 0.8} strokeLinecap="round" />
        );
      })}

      {/* Hour numbers */}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        return (
          <text key={n} x={100 + 64 * Math.cos(a)} y={100 + 64 * Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.85)" fontSize="11" fontWeight="600"
            fontFamily="Inter, sans-serif">{n}</text>
        );
      })}

      {/* Hour hand */}
      {hand(hr * 30, 45, 4, "#e2e8f0", "#ffffff")}
      {/* Minute hand */}
      {hand(min * 6, 65, 2.5, "#c4b5fd", "#a78bfa")}
      {/* Second hand */}
      {hand(sec * 6, 72, 1.2, "#f87171", "#ef4444")}
      {/* Center dot */}
      <circle cx="100" cy="100" r="4" fill="#9b59b6"
        style={{ filter: "drop-shadow(0 0 6px #9b59b6)" }} />
      <circle cx="100" cy="100" r="2" fill="white" />
    </svg>
  );
}

// Circular arc for countdown timer
function ArcTimer({ remaining, total }: { remaining: number; total: number }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? remaining / total : 0;
  const dash = pct * circ;
  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      <circle cx="100" cy="100" r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx="100" cy="100" r={r} fill="none"
        stroke={remaining <= 10 ? "#f87171" : "#9b59b6"} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={0} transform="rotate(-90 100 100)"
        style={{ transition: "stroke-dasharray 0.4s linear, stroke 0.3s" }} />
    </svg>
  );
}

export default function Clock() {
  const [tab,        setTab]        = useState<Tab>("clock");
  const [time,       setTime]       = useState(new Date());
  const [showWorld,  setShowWorld]  = useState(false);

  // Stopwatch
  const [swRunning,  setSwRunning]  = useState(false);
  const [swMs,       setSwMs]       = useState(0);
  const [laps,       setLaps]       = useState<number[]>([]);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  const [timerTotal, setTimerTotal] = useState(300);
  const [timerLeft,  setTimerLeft]  = useState(300);
  const [timerRun,   setTimerRun]   = useState(false);
  const [timerDone,  setTimerDone]  = useState(false);
  // Custom input
  const [hh, setHh] = useState("00");
  const [mm, setMm] = useState("05");
  const [ss, setSs] = useState("00");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 100);
    return () => clearInterval(id);
  }, []);

  // Stopwatch
  useEffect(() => {
    if (swRunning) {
      const start = Date.now() - swMs;
      swRef.current = setInterval(() => setSwMs(Date.now() - start), 30);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swRunning]);

  // Timer countdown
  useEffect(() => {
    if (timerRun && timerLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerLeft((p) => {
          if (p <= 1) {
            setTimerRun(false);
            setTimerDone(true);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRun, timerLeft]);

  const fmtMs = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const c = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
  };

  const fmtSec = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const applyCustomTimer = useCallback(() => {
    const total = parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(ss);
    if (total > 0) { setTimerTotal(total); setTimerLeft(total); setTimerRun(false); setTimerDone(false); }
  }, [hh, mm, ss]);

  const presets = [
    { label: "1m",  secs: 60    },
    { label: "5m",  secs: 300   },
    { label: "15m", secs: 900   },
    { label: "30m", secs: 1800  },
    { label: "1h",  secs: 3600  },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0a0e", color: "white" }}>
      {/* Tab bar */}
      <div className="flex items-center border-b border-white/[0.07] shrink-0 px-1">
        {(["clock", "stopwatch", "timer"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[12px] font-medium transition-all capitalize border-b-2 ${
              tab === t ? "text-[#a855f7] border-[#a855f7]" : "text-white/40 border-transparent hover:text-white/70"
            }`}>{t}</button>
        ))}
        {tab === "clock" && (
          <button onClick={() => setShowWorld((p) => !p)}
            className={`ml-auto mr-2 p-1.5 rounded-lg transition-all ${showWorld ? "text-[#a855f7] bg-purple-500/10" : "text-white/30 hover:text-white/60"}`}
            title="World clocks">
            <Globe size={14} />
          </button>
        )}
      </div>

      {/* ── CLOCK ───────────────────────────────────────────────────────── */}
      {tab === "clock" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <AnalogFace time={time} />
          <div className="text-center">
            <div className="text-[32px] font-light tabular-nums tracking-tight"
              style={{ fontVariantNumeric: "tabular-nums" }}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-[12px] text-white/40 mt-0.5">
              {time.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>

          {showWorld && (
            <div className="w-full max-w-xs grid grid-cols-2 gap-1.5 mt-1">
              {WORLD_ZONES.map(({ city, tz }) => {
                const tzTime = new Date(time.toLocaleString("en-US", { timeZone: tz }));
                return (
                  <div key={city} className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-[10px] text-white/45">{city}</span>
                    <span className="text-[12px] tabular-nums font-medium">
                      {tzTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STOPWATCH ──────────────────────────────────────────────────── */}
      {tab === "stopwatch" && (
        <div className="flex-1 flex flex-col items-center p-4 gap-4 overflow-hidden">
          {/* Display */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="text-[48px] font-mono font-light tabular-nums tracking-tight"
              style={{ textShadow: swRunning ? "0 0 30px rgba(168,85,247,0.4)" : "none" }}>
              {fmtMs(swMs)}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSwRunning((p) => !p)}
                className="w-14 h-14 rounded-full flex items-center justify-center font-medium transition-all active:scale-95"
                style={{ background: swRunning ? "rgba(168,85,247,0.15)" : "linear-gradient(135deg,#9b59b6,#7c3aed)", boxShadow: swRunning ? "none" : "0 4px 20px rgba(155,89,182,0.4)" }}>
                {swRunning ? <Pause size={20} /> : <Play size={20} />}
              </button>
              {swRunning && (
                <button onClick={() => setLaps((p) => [swMs, ...p])}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <Flag size={18} />
                </button>
              )}
              {!swRunning && swMs > 0 && (
                <button onClick={() => { setSwMs(0); setLaps([]); }}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <RotateCcw size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Laps */}
          {laps.length > 0 && (
            <div className="w-full max-w-xs max-h-36 overflow-y-auto os-scrollbar">
              {laps.map((t, i) => (
                <div key={i} className="flex justify-between px-3 py-1.5 text-[12px]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-white/40">Lap {laps.length - i}</span>
                  <span className="tabular-nums font-mono text-white/80">{fmtMs(t)}</span>
                  {i > 0 && (
                    <span className={`tabular-nums font-mono text-[11px] ${t - laps[i - 1] < 0 ? "text-green-400" : "text-red-400"}`}>
                      {t > laps[i - 1] ? "+" : ""}{fmtMs(Math.abs(t - laps[i - 1]))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TIMER ──────────────────────────────────────────────────────── */}
      {tab === "timer" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          {/* Arc + time */}
          <div className="relative flex items-center justify-center">
            <ArcTimer remaining={timerLeft} total={timerTotal} />
            <div className="absolute flex flex-col items-center">
              <div className={`text-[32px] font-mono font-light tabular-nums ${timerDone ? "text-[#f87171]" : ""}`}>
                {fmtSec(timerLeft)}
              </div>
              {timerDone && <span className="text-[11px] text-[#f87171] animate-pulse">Time's up!</span>}
            </div>
          </div>

          {/* Custom HH:MM:SS input */}
          {!timerRun && !timerDone && (
            <div className="flex items-center gap-1 text-[18px] font-mono">
              {[
                { val: hh, set: setHh, max: 23, label: "h" },
                { val: mm, set: setMm, max: 59, label: "m" },
                { val: ss, set: setSs, max: 59, label: "s" },
              ].map(({ val, set, max, label }, i) => (
                <span key={label} className="flex items-center">
                  {i > 0 && <span className="text-white/30 mx-0.5">:</span>}
                  <input type="number" min="0" max={max} value={val}
                    onChange={(e) => {
                      const v = Math.min(max, Math.max(0, parseInt(e.target.value) || 0));
                      set(String(v).padStart(2, "0"));
                    }}
                    onBlur={applyCustomTimer}
                    className="w-12 text-center bg-transparent border-b border-white/20 focus:border-[#9b59b6] outline-none tabular-nums text-white/80 focus:text-white transition-colors"
                    style={{ appearance: "textfield" }} />
                  <span className="text-[10px] text-white/30 ml-0.5">{label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Preset chips */}
          {!timerRun && (
            <div className="flex gap-1.5 flex-wrap justify-center">
              {presets.map(({ label, secs }) => (
                <button key={label} onClick={() => {
                  setTimerTotal(secs); setTimerLeft(secs);
                  setTimerRun(false); setTimerDone(false);
                  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
                  setHh(String(h).padStart(2, "0")); setMm(String(m).padStart(2, "0")); setSs(String(s).padStart(2, "0"));
                }}
                  className={`px-3 py-1 rounded-full text-[11px] transition-all ${
                    timerTotal === secs ? "bg-[#9b59b6] text-white" : "text-white/40 hover:text-white hover:bg-white/8"
                  }`}
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>{label}</button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            <button onClick={() => { setTimerRun((p) => !p); setTimerDone(false); }}
              disabled={timerLeft === 0 && !timerDone}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
              style={{ background: timerRun ? "rgba(168,85,247,0.15)" : "linear-gradient(135deg,#9b59b6,#7c3aed)", boxShadow: timerRun ? "none" : "0 4px 20px rgba(155,89,182,0.4)" }}>
              {timerRun ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => { setTimerLeft(timerTotal); setTimerRun(false); setTimerDone(false); }}
              className="w-14 h-14 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
