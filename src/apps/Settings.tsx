import { useState } from "react";
import {
  Wifi, Monitor, Volume2, Power, User, Palette, Globe, Shield,
  ChevronRight, Check, Cpu, HardDrive, Clock, Info, Lock,
  Key, Terminal, Eye, EyeOff,
} from "lucide-react";

const CATS = [
  { id: "wifi",       name: "Wi-Fi",       icon: Wifi    },
  { id: "display",    name: "Display",      icon: Monitor },
  { id: "sound",      name: "Sound",        icon: Volume2 },
  { id: "appearance", name: "Appearance",   icon: Palette },
  { id: "power",      name: "Power",        icon: Power   },
  { id: "users",      name: "Users & Auth", icon: User    },
  { id: "network",    name: "Network",      icon: Globe   },
  { id: "security",   name: "Security",     icon: Shield  },
  { id: "about",      name: "About",        icon: Info    },
];

const WALLPAPERS = [
  { label: "Violet Storm",  g: "linear-gradient(135deg,#9b59b6,#1a1a2e)" },
  { label: "Cyber Teal",    g: "linear-gradient(135deg,#00d4aa,#0d1117)" },
  { label: "Hacker Orange", g: "linear-gradient(135deg,#ff6b35,#180a00)" },
];

const ACCENTS = [
  { color: "#9b59b6", name: "Violet"  },
  { color: "#22c55e", name: "Green"   },
  { color: "#3b82f6", name: "Blue"    },
  { color: "#f59e0b", name: "Amber"   },
  { color: "#ef4444", name: "Red"     },
  { color: "#ec4899", name: "Pink"    },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-5.5 rounded-full transition-all flex-shrink-0"
      style={{
        background: value ? "#9b59b6" : "rgba(255,255,255,0.1)",
        width: 40, height: 22,
      }}
    >
      <span
        className="absolute top-[3px] rounded-full bg-white transition-all"
        style={{ width: 16, height: 16, left: value ? 21 : 3 }}
      />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-4 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div>
        <p className="text-[13px] text-white/80">{label}</p>
        {sub && <p className="text-[11px] text-white/35 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export default function Settings() {
  const [active, setActive] = useState("wifi");
  const [brightness, setBrightness] = useState(80);
  const [volume,     setVolume]     = useState(60);
  const [wifiOn,     setWifiOn]     = useState(true);
  const [darkMode,   setDarkMode]   = useState(true);
  const [animations, setAnimations] = useState(true);
  const [blurFx,     setBlurFx]     = useState(true);
  const [firewall,   setFirewall]   = useState(true);
  const [sshOn,      setSshOn]      = useState(false);
  const [autoLock,   setAutoLock]   = useState(true);
  const [wallpaper,  setWallpaper]  = useState(0);
  const [accent,     setAccent]     = useState("#9b59b6");
  const [showKey,    setShowKey]    = useState(false);

  const SliderRow = ({ label, sub, value, onChange, color = "#9b59b6" }: {
    label: string; sub?: string; value: number; onChange: (v: number) => void; color?: string;
  }) => (
    <div className="py-2.5 px-4 rounded-xl space-y-2"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex justify-between">
        <div><p className="text-[13px] text-white/80">{label}</p>{sub && <p className="text-[11px] text-white/35">{sub}</p>}</div>
        <span className="text-[13px] text-white/50 tabular-nums">{value}%</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: color }} />
    </div>
  );

  return (
    <div className="h-full flex text-[13px]" style={{ background: "#111" }}>
      {/* Sidebar */}
      <div className="w-48 shrink-0 border-r border-white/[0.07] p-3 flex flex-col gap-0.5">
        <p className="text-[10px] text-white/25 uppercase tracking-widest px-2 py-2">Settings</p>
        {CATS.map((c) => (
          <button key={c.id}
            onClick={() => setActive(c.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
              active === c.id
                ? "bg-white/10 text-white"
                : "text-white/50 hover:bg-white/6 hover:text-white/80"
            }`}
          >
            <c.icon size={14} className={active === c.id ? "text-[#9b59b6]" : ""} />
            <span className="text-[12px]">{c.name}</span>
            {active === c.id && <ChevronRight size={12} className="ml-auto text-white/30" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* ── Wi-Fi ── */}
        {active === "wifi" && (<>
          <Section title="Wireless Networks">
            <Row label="Wi-Fi" sub={wifiOn ? "Connected to KaliNet-5G" : "Disabled"} right={<Toggle value={wifiOn} onChange={setWifiOn} />} />
          </Section>
          {wifiOn && (
            <Section title="Available Networks">
              {[
                { name: "KaliNet-5G",       sig: 4, locked: true,  connected: true  },
                { name: "GuestWiFi",         sig: 3, locked: true,  connected: false },
                { name: "Corporate_Secure",  sig: 2, locked: true,  connected: false },
                { name: "OpenHotspot",       sig: 1, locked: false, connected: false },
              ].map((n) => (
                <div key={n.name} className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-white/[0.03] transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-end gap-[2px]">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-1 rounded-sm" style={{ height: 4 + i * 3, background: i <= n.sig ? "#4ade80" : "rgba(255,255,255,0.15)" }} />
                      ))}
                    </div>
                    <div>
                      <p className="text-white/80">{n.name}</p>
                      <p className="text-[11px] text-white/35">{n.connected ? "● Connected" : n.locked ? "Secured" : "Open"}</p>
                    </div>
                  </div>
                  {n.connected
                    ? <span className="text-[10px] text-green-400 px-2 py-0.5 rounded-full bg-green-500/10">Connected</span>
                    : <button className="text-[11px] px-3 py-1 rounded-lg bg-white/8 hover:bg-white/15 text-white/70 transition-colors">Join</button>}
                </div>
              ))}
            </Section>
          )}
        </>)}

        {/* ── Display ── */}
        {active === "display" && (<>
          <Section title="Brightness">
            <SliderRow label="Display Brightness" sub="Main display" value={brightness} onChange={setBrightness} />
          </Section>
          <Section title="Resolution & Refresh">
            <Row label="Resolution" right={
              <select className="text-[12px] rounded-lg px-2 py-1 outline-none text-white"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <option>1920 × 1080</option>
                <option>2560 × 1440</option>
                <option>3840 × 2160</option>
              </select>
            } />
            <Row label="Refresh Rate" right={
              <select className="text-[12px] rounded-lg px-2 py-1 outline-none text-white"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <option>60 Hz</option><option>120 Hz</option><option>144 Hz</option><option>240 Hz</option>
              </select>
            } />
          </Section>
          <Section title="Night Mode">
            <Row label="Night Light" sub="Reduce blue light after sunset" right={<Toggle value={false} onChange={() => {}} />} />
          </Section>
        </>)}

        {/* ── Sound ── */}
        {active === "sound" && (<>
          <Section title="Output">
            <SliderRow label="Output Volume" sub="Built-in speakers" value={volume} onChange={setVolume} color="#22c55e" />
          </Section>
          <Section title="Output Devices">
            {["Built-in Speakers", "HDMI Audio", "Bluetooth Headset"].map((d, i) => (
              <Row key={d} label={d} sub={i === 0 ? "Default" : ""} right={
                i === 0 ? <Check size={14} className="text-[#9b59b6]" /> : <button className="text-[11px] text-white/40 hover:text-white/80 transition-colors">Select</button>
              } />
            ))}
          </Section>
          <Section title="Input">
            <SliderRow label="Microphone Volume" value={75} onChange={() => {}} color="#f59e0b" />
          </Section>
        </>)}

        {/* ── Appearance ── */}
        {active === "appearance" && (<>
          <Section title="Theme">
            <Row label="Dark Mode" sub="System-wide dark theme" right={<Toggle value={darkMode} onChange={setDarkMode} />} />
            <Row label="Animations" sub="Window & transition effects" right={<Toggle value={animations} onChange={setAnimations} />} />
            <Row label="Blur Effects" sub="Glassmorphism panels" right={<Toggle value={blurFx} onChange={setBlurFx} />} />
          </Section>
          <Section title="Accent Color">
            <div className="flex gap-2 flex-wrap px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {ACCENTS.map((a) => (
                <button key={a.color} onClick={() => setAccent(a.color)} title={a.name}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{ background: a.color, outline: accent === a.color ? "2px solid white" : "none", outlineOffset: 2 }}>
                  {accent === a.color && <Check size={14} className="text-white m-auto" />}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Wallpaper">
            <div className="grid grid-cols-3 gap-2">
              {WALLPAPERS.map((w, i) => (
                <button key={i} onClick={() => setWallpaper(i)}
                  className="relative h-20 rounded-xl overflow-hidden transition-all hover:scale-[1.03]"
                  style={{ background: w.g, outline: wallpaper === i ? "2px solid white" : "none", outlineOffset: 2 }}>
                  {wallpaper === i && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check size={18} className="text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] text-white/70">{w.label}</span>
                </button>
              ))}
            </div>
          </Section>
        </>)}

        {/* ── Power ── */}
        {active === "power" && (<>
          <Section title="Power Management">
            <Row label="Auto-Lock" sub="Lock screen after inactivity" right={<Toggle value={autoLock} onChange={setAutoLock} />} />
            <Row label="Lock After" right={
              <select className="text-[12px] rounded-lg px-2 py-1 outline-none text-white"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <option>1 minute</option><option>5 minutes</option><option>15 minutes</option><option>30 minutes</option>
              </select>
            } />
          </Section>
          <Section title="Actions">
            <Row label="Lock Screen" right={
              <button className="text-[12px] px-3 py-1 rounded-lg text-white/70 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <Lock size={13} />
              </button>
            } />
            <Row label="Restart" right={
              <button className="text-[12px] px-3 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors">Restart</button>
            } />
            <Row label="Shutdown" right={
              <button className="text-[12px] px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">Shutdown</button>
            } />
          </Section>
        </>)}

        {/* ── Users ── */}
        {active === "users" && (<>
          <Section title="Current User">
            <div className="flex items-center gap-4 py-3 px-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: "radial-gradient(circle at 35% 35%, #9b59b6, #4a1a6b)" }}>K</div>
              <div>
                <p className="text-[15px] font-semibold text-white">root</p>
                <p className="text-[12px] text-white/40">Administrator · UID 0</p>
              </div>
            </div>
          </Section>
          <Section title="Authentication">
            <Row label="Change Password" right={<ChevronRight size={14} className="text-white/30" />} />
            <Row label="SSH Key" sub={showKey ? "id_rsa.pub" : "••••••••"} right={
              <button onClick={() => setShowKey(!showKey)} className="text-white/40 hover:text-white/80 transition-colors">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            } />
            {showKey && (
              <div className="px-3 py-2 rounded-lg text-[10px] font-mono text-green-400/80 break-all"
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,200,0,0.15)" }}>
                ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC... root@kali-os
              </div>
            )}
          </Section>
        </>)}

        {/* ── Network ── */}
        {active === "network" && (<>
          <Section title="Interfaces">
            {[
              { name: "eth0",  ip: "192.168.1.100", status: "Connected", speed: "1 Gbps"  },
              { name: "wlan0", ip: "—",             status: "Disabled",  speed: "—"       },
              { name: "lo",    ip: "127.0.0.1",     status: "Loopback",  speed: "—"       },
            ].map((iface) => (
              <Row key={iface.name} label={iface.name} sub={`${iface.ip} · ${iface.speed}`}
                right={<span className={`text-[11px] px-2 py-0.5 rounded-full ${iface.status === "Connected" ? "bg-green-500/15 text-green-400" : "bg-white/8 text-white/35"}`}>{iface.status}</span>} />
            ))}
          </Section>
          <Section title="DNS">
            <Row label="Primary DNS"   right={<span className="text-[12px] font-mono text-white/50">8.8.8.8</span>} />
            <Row label="Secondary DNS" right={<span className="text-[12px] font-mono text-white/50">1.1.1.1</span>} />
          </Section>
          <Section title="Proxy">
            <Row label="HTTP Proxy" sub="No proxy configured" right={<button className="text-[11px] px-2 py-1 rounded bg-white/8 text-white/60 hover:text-white transition-colors">Configure</button>} />
          </Section>
        </>)}

        {/* ── Security ── */}
        {active === "security" && (<>
          <Section title="Firewall">
            <Row label="Firewall" sub={firewall ? "Active — blocking all incoming" : "Disabled"} right={<Toggle value={firewall} onChange={setFirewall} />} />
            <Row label="SSH Server" sub={sshOn ? "Listening on port 22" : "Stopped"} right={<Toggle value={sshOn} onChange={setSshOn} />} />
          </Section>
          <Section title="Audit">
            {[
              { label: "Last Login",       val: "Today, 09:14 — 192.168.1.5" },
              { label: "Failed Attempts",  val: "3 in last 24h" },
              { label: "Active Sessions",  val: "1 (this session)" },
            ].map((r) => (
              <Row key={r.label} label={r.label} right={<span className="text-[11px] text-white/40">{r.val}</span>} />
            ))}
          </Section>
          <Section title="Tools">
            <Row label="Generate SSH Key" right={<button className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all"><Key size={12} /> Generate</button>} />
            <Row label="Open Terminal" right={<button className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all"><Terminal size={12} /> Open</button>} />
          </Section>
        </>)}

        {/* ── About ── */}
        {active === "about" && (
          <div className="space-y-5">
            {/* Logo card */}
            <div className="py-8 rounded-2xl flex flex-col items-center gap-3"
              style={{ background: "linear-gradient(135deg, rgba(155,89,182,0.15), rgba(26,26,46,0.4))", border: "1px solid rgba(155,89,182,0.2)" }}>
              <div className="text-5xl">🐉</div>
              <div className="text-center">
                <p className="text-[18px] font-bold text-white">Kali WebOS</p>
                <p className="text-[13px] text-white/45 mt-0.5">AetherClaw Edition — v2.0.0</p>
              </div>
            </div>

            <Section title="System">
              {[
                { icon: Cpu,       label: "Processor",   val: "Intel Xeon W × 32 cores" },
                { icon: HardDrive, label: "Storage",      val: "512 GB SSD · 390 GB used" },
                { icon: Monitor,   label: "Display",      val: "1920 × 1080 · 60 Hz" },
                { icon: Clock,     label: "Uptime",       val: "4h 23m" },
              ].map(({ label, val }) => (
                <Row key={label} label={label} right={<span className="text-[12px] text-white/50">{val}</span>} />
              ))}
            </Section>

            <Section title="Software">
              {[
                { label: "Kernel",    val: "6.6.0-kali-web" },
                { label: "Shell",     val: "ksh 2.0.0" },
                { label: "React",     val: "19.2.0" },
                { label: "TypeScript",val: "5.9.3" },
              ].map(({ label, val }) => (
                <Row key={label} label={label} right={<span className="text-[12px] font-mono text-white/45">{val}</span>} />
              ))}
            </Section>

            <div className="text-center text-[11px] text-white/20 pt-2">
              Built with ❤️ using React + TypeScript + Vite
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
