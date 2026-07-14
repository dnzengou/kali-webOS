import { useState, useEffect, useRef } from "react";
import {
  Wifi, WifiOff, Volume2, VolumeX, Sun, Power,
  Lock, RotateCcw, Bolt, ChevronRight,
} from "lucide-react";
import { useOsStore } from "@/store/useOsStore";
import { format } from "date-fns";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function BatteryBar({ battery, charging }: { battery: number | null; charging: boolean }) {
  if (battery === null) return null;
  const color = battery <= 20 ? "#ef4444" : battery <= 40 ? "#f59e0b" : "#22c55e";
  return (
    <div className="flex items-center gap-1" title={`${battery}%${charging ? " ⚡" : ""}`}>
      <div className="relative w-5 h-2.5 rounded-sm border border-white/30 overflow-hidden">
        <div className="absolute inset-0" style={{ background: color, width: `${battery}%`, transition: "width 1s" }} />
      </div>
      <div className="w-0.5 h-1.5 rounded-r bg-white/30" />
      <span className="text-[10px] text-white/50">{battery}%</span>
    </div>
  );
}

export default function TopBar() {
  const [time,    setTime]    = useState(new Date());
  const [panel,   setPanel]   = useState(false);
  const [volume,  setVolume]  = useState(70);
  const [muted,   setMuted]   = useState(false);
  const [bright,  setBright]  = useState(80);
  const [wifi,    setWifi]    = useState(true);
  const [battery, setBattery] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const setShowLauncher = useOsStore((s) => s.setShowLauncher);
  const setLocked       = useOsStore((s) => s.setLocked);
  const panelRef        = useRef<HTMLDivElement>(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Battery API
  useEffect(() => {
    const nav = navigator as any;
    if (!nav.getBattery) return;
    nav.getBattery().then((bat: any) => {
      const upd = () => { setBattery(Math.round(bat.level * 100)); setCharging(bat.charging); };
      upd();
      bat.addEventListener("levelchange", upd);
      bat.addEventListener("chargingchange", upd);
    });
  }, []);

  // PWA install prompt
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!panel) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanel(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panel]);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-9 flex items-center justify-between px-3 z-[10000] select-none"
        style={{
          background: "rgba(12,12,12,0.90)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Left — Activities */}
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white/80 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/8 transition-all"
            onClick={() => setShowLauncher(true)}
          >
            <Bolt size={12} className="text-[#9b59b6]" />
            Activities
          </button>
        </div>

        {/* Center — Clock */}
        <button
          className="text-[12px] font-medium text-white/75 hover:text-white tabular-nums px-3 py-1 rounded-md hover:bg-white/8 transition-all"
          onClick={() => {
            const app = { id: "calendar", name: "Calendar", icon: () => null, category: "System", defaultWidth: 400, defaultHeight: 450, description: "" };
            useOsStore.getState().openWindow(app as any);
          }}
        >
          {format(time, "EEE, MMM d  ·  h:mm a")}
        </button>

        {/* Right — System tray */}
        <div className="flex items-center gap-2.5">
          {installPrompt && (
            <button
              className="text-[10px] text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full hover:border-purple-400/60 hover:text-purple-200 transition-all"
              onClick={async () => {
                await installPrompt.prompt();
                const { outcome } = await installPrompt.userChoice;
                if (outcome === "accepted") setInstallPrompt(null);
              }}
            >
              Install App
            </button>
          )}
          <BatteryBar battery={battery} charging={charging} />
          <button
            className="flex items-center gap-1.5 text-white/55 hover:text-white/90 px-2 py-1 rounded-md hover:bg-white/8 transition-all"
            onClick={() => setPanel((p) => !p)}
          >
            {wifi ? <Wifi size={13} /> : <WifiOff size={13} />}
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <Sun size={13} />
            <ChevronRight size={10} className={`transition-transform duration-200 ${panel ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Quick Settings Panel ── */}
      {panel && (
        <div
          ref={panelRef}
          className="fixed top-10 right-2 z-[10001] w-72 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200"
          style={{
            background: "rgba(22,22,22,0.95)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          }}
        >
          {/* Quick toggles */}
          <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/[0.07]">
            <QToggle active={wifi} icon={wifi ? Wifi : WifiOff} label="Wi-Fi" onClick={() => setWifi(!wifi)} />
            <QToggle active={!muted} icon={muted ? VolumeX : Volume2} label="Sound" onClick={() => setMuted(!muted)} />
            <QToggle active={true} icon={Sun} label="Bright" onClick={() => {}} />
          </div>

          {/* Sliders */}
          <div className="px-4 py-3 space-y-4 border-b border-white/[0.07]">
            {/* Volume */}
            <div className="flex items-center gap-3">
              <button onClick={() => setMuted(!muted)} className="text-white/50 hover:text-white/80 transition-colors shrink-0">
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div className="flex-1 relative">
                <input
                  type="range" min={0} max={100} value={muted ? 0 : volume}
                  onChange={(e) => { setVolume(+e.target.value); setMuted(false); }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#9b59b6" }}
                />
              </div>
              <span className="text-[11px] text-white/40 w-7 text-right tabular-nums">{muted ? 0 : volume}</span>
            </div>
            {/* Brightness */}
            <div className="flex items-center gap-3">
              <Sun size={14} className="text-white/50 shrink-0" />
              <div className="flex-1">
                <input
                  type="range" min={10} max={100} value={bright}
                  onChange={(e) => setBright(+e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#9b59b6" }}
                />
              </div>
              <span className="text-[11px] text-white/40 w-7 text-right tabular-nums">{bright}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 grid grid-cols-3 gap-2">
            <ActionBtn icon={Lock} label="Lock" onClick={() => { setLocked(true); setPanel(false); }} />
            <ActionBtn icon={RotateCcw} label="Restart" onClick={() => window.location.reload()} />
            <ActionBtn icon={Power} label="Shutdown" onClick={() => { document.body.style.opacity = "0"; setTimeout(() => window.location.reload(), 800); }} />
          </div>
        </div>
      )}
    </>
  );
}

function QToggle({ active, icon: Icon, label, onClick }: {
  active: boolean; icon: React.FC<any>; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
      style={{
        background: active ? "rgba(155,89,182,0.25)" : "rgba(255,255,255,0.06)",
        border: active ? "1px solid rgba(155,89,182,0.4)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Icon size={16} style={{ color: active ? "#c084fc" : "rgba(255,255,255,0.5)" }} />
      <span className="text-[10px]" style={{ color: active ? "#c084fc" : "rgba(255,255,255,0.4)" }}>{label}</span>
    </button>
  );
}

function ActionBtn({ icon: Icon, label, onClick }: { icon: React.FC<any>; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] transition-all"
    >
      <Icon size={14} className="text-white/60" />
      <span className="text-[10px] text-white/45">{label}</span>
    </button>
  );
}
