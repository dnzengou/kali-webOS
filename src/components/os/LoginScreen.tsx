import { useState, useEffect, useRef } from "react";
import { Lock, User, Power, Eye, EyeOff } from "lucide-react";
import { useOsStore } from "@/store/useOsStore";

const BOOT_LINES = [
  "[ 0.000] Initializing Kali WebOS kernel...",
  "[ 0.042] Loading security modules... OK",
  "[ 0.118] Mounting virtual filesystem... OK",
  "[ 0.245] Starting network stack... OK",
  "[ 0.389] Launching desktop environment...",
  "[ 0.512] AetherClaw v2.0.0 ready.",
];

export default function LoginScreen() {
  const setLocked = useOsStore((s) => s.setLocked);
  const [phase,    setPhase]    = useState<"boot" | "login">("boot");
  const [bootIdx,  setBootIdx]  = useState(0);
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [shaking,  setShaking]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence
  useEffect(() => {
    if (phase !== "boot") return;
    if (bootIdx >= BOOT_LINES.length) {
      const t = setTimeout(() => setPhase("login"), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBootIdx((i) => i + 1), 160 + Math.random() * 80);
    return () => clearTimeout(t);
  }, [phase, bootIdx]);

  // Focus input after transition to login
  useEffect(() => {
    if (phase === "login") setTimeout(() => inputRef.current?.focus(), 400);
  }, [phase]);

  const handleUnlock = () => {
    if (password === "kali" || password === "") {
      setLocked(false);
    } else {
      setError("Incorrect password");
      setShaking(true);
      setTimeout(() => { setShaking(false); setError(""); setPassword(""); }, 700);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0a0a12" }}
    >
      {/* Animated grid bg */}
      <GridBackground />

      {/* Purple orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: "radial-gradient(circle, #9b59b6, transparent)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: "radial-gradient(circle, #6c3483, transparent)", animationDelay: "1.5s" }} />
      </div>

      {/* Boot screen */}
      {phase === "boot" && (
        <div
          className="relative z-10 font-mono text-[12px] text-green-400/80 space-y-1 w-[480px] max-w-[90vw] p-6 rounded-xl animate-in fade-in duration-500"
          style={{ background: "rgba(0,20,0,0.6)", border: "1px solid rgba(0,200,0,0.15)" }}
        >
          <div className="text-green-300 text-[11px] mb-3 font-bold tracking-widest uppercase">
            Kali WebOS — AetherClaw Edition
          </div>
          {BOOT_LINES.slice(0, bootIdx).map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-green-600/60">{line.split("]")[0]}]</span>
              <span>{line.split("] ")[1]}</span>
            </div>
          ))}
          {bootIdx < BOOT_LINES.length && (
            <span className="inline-block w-2 h-4 bg-green-400/80 animate-pulse" />
          )}
        </div>
      )}

      {/* Login form */}
      {phase === "login" && (
        <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 35% 35%, #9b59b6, #4a1a6b)",
              boxShadow: "0 0 0 3px rgba(155,89,182,0.3), 0 0 40px rgba(155,89,182,0.2)",
            }}
          >
            <User size={40} className="text-white/90" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-white">root</h1>
            <p className="text-[12px] text-white/40">Kali WebOS — AetherClaw</p>
          </div>

          {/* Password field */}
          <div className={`w-[300px] space-y-3 ${shaking ? "animate-shake" : ""}`}>
            <div className="relative">
              <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
              <input
                ref={inputRef}
                type={showPw ? "text" : "password"}
                className="w-full h-11 rounded-xl pl-10 pr-10 text-[14px] text-white outline-none transition-all"
                style={{
                  background: "rgba(40,40,40,0.85)",
                  border: error
                    ? "1px solid rgba(239,68,68,0.6)"
                    : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
                placeholder="Password  (default: kali)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                autoComplete="current-password"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <p className="text-[12px] text-red-400 text-center animate-in fade-in duration-200">{error}</p>
            )}

            <button
              className="w-full h-11 rounded-xl font-medium text-[14px] text-white transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #9b59b6, #7d3c98)",
                boxShadow: "0 4px 20px rgba(155,89,182,0.35)",
              }}
              onClick={handleUnlock}
            >
              Unlock
            </button>

            <button
              className="w-full text-[12px] text-white/35 hover:text-white/60 transition-colors py-1"
              onClick={() => setLocked(false)}
            >
              Continue as Guest →
            </button>
          </div>
        </div>
      )}

      {/* Restart button */}
      <button
        className="absolute bottom-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-all hover:bg-white/8"
        onClick={() => window.location.reload()}
        title="Restart"
      >
        <Power size={15} />
      </button>

      {/* Time */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[12px] text-white/25 tabular-nums">
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}

function GridBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9b59b6" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
