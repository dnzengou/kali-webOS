import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2 } from "lucide-react";

// ── SVG arc gauge ──────────────────────────────────────────────────────────────
function ArcGauge({ value, max = 100, color, label, sublabel }: {
  value: number; max?: number; color: string; label: string; sublabel?: string;
}) {
  const pct = Math.min(value / max, 1);
  const R = 42; const SW = 7;
  const circ = Math.PI * R;
  const dash = pct * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={110} height={72} viewBox="0 0 110 72">
        <path d={`M 14 62 A ${R} ${R} 0 0 1 96 62`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SW} strokeLinecap="round" />
        <path d={`M 14 62 A ${R} ${R} 0 0 1 96 62`}
          fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.7s ease" }} />
        <text x="55" y="54" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
          {Math.round(value)}
        </text>
        <text x="55" y="66" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">
          / {max}
        </text>
      </svg>
      <p className="text-[12px] font-semibold" style={{ color }}>{label}</p>
      {sublabel && <p className="text-[10px] text-white/30">{sublabel}</p>}
    </div>
  );
}

function DiskBar({ mount, used, total }: { mount: string; used: number; total: number }) {
  const pct = (used / total) * 100;
  const color = pct > 85 ? "#f87171" : pct > 60 ? "#facc15" : "#4ade80";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[12px]">
        <span className="text-white/65 font-mono">{mount}</span>
        <span className="text-white/35">{used} GB / {total} GB</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

type Proc = { pid: number; name: string; cpu: number; mem: number; status: string; user: string };
type SortKey = "pid" | "name" | "cpu" | "mem";

const INIT_PROCS: Proc[] = [
  { pid: 1,    name: "systemd",    cpu: 0.1,  mem: 12,  status: "sleeping", user: "root"  },
  { pid: 1245, name: "nginx",      cpu: 2.3,  mem: 45,  status: "running",  user: "www"   },
  { pid: 2044, name: "postgres",   cpu: 1.2,  mem: 128, status: "running",  user: "pgsql" },
  { pid: 3102, name: "nmap",       cpu: 45.0, mem: 67,  status: "running",  user: "root"  },
  { pid: 3400, name: "metasploit", cpu: 12.5, mem: 256, status: "running",  user: "root"  },
  { pid: 4100, name: "chromium",   cpu: 8.7,  mem: 312, status: "running",  user: "user"  },
  { pid: 5200, name: "python3",    cpu: 3.1,  mem: 89,  status: "sleeping", user: "root"  },
  { pid: 6200, name: "wireshark",  cpu: 6.2,  mem: 156, status: "running",  user: "root"  },
  { pid: 7100, name: "burpsuite",  cpu: 9.8,  mem: 412, status: "running",  user: "user"  },
  { pid: 8000, name: "sshd",       cpu: 0.0,  mem: 8,   status: "sleeping", user: "root"  },
];

const mkData = (n: number) => Array.from({ length: n }, (_, i) => ({
  t: i,
  cpu: 20 + Math.random() * 40,
  mem: 40 + Math.random() * 30,
  net: Math.random() * 100,
}));

export default function Monitor() {
  const [tab,   setTab]   = useState<"overview" | "processes" | "disk" | "network">("overview");
  const [chart, setChart] = useState(mkData(30));
  const [procs, setProcs] = useState<Proc[]>(INIT_PROCS);
  const [sort,  setSort]  = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "cpu", dir: -1 });
  const [kill,  setKill]  = useState<number | null>(null);

  const last = chart[chart.length - 1];
  const cpu  = last?.cpu ?? 50;
  const mem  = last?.mem ?? 60;
  const net  = last?.net ?? 30;

  useEffect(() => {
    const t = setInterval(() => {
      setChart((prev) => {
        const l = prev[prev.length - 1];
        return [...prev.slice(1), {
          t:   l.t + 1,
          cpu: Math.max(5,   Math.min(95, l.cpu + (Math.random() - 0.48) * 8)),
          mem: Math.max(20,  Math.min(90, l.mem + (Math.random() - 0.49) * 4)),
          net: Math.random() * 120,
        }];
      });
      setProcs((prev) => prev.map((p) => ({
        ...p,
        cpu: Math.max(0,  Math.min(100, p.cpu + (Math.random() - 0.5) * 3)),
        mem: Math.max(4,  p.mem + Math.round((Math.random() - 0.5) * 8)),
      })));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    setSort((s) => s.key === key ? { key, dir: (s.dir === -1 ? 1 : -1) as 1 | -1 } : { key, dir: -1 });
  }, []);

  const sorted = [...procs].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key];
    return typeof av === "string"
      ? (av as string).localeCompare(bv as string) * sort.dir
      : ((av as number) - (bv as number)) * sort.dir;
  });

  const cpuColor = cpu > 70 ? "#f87171" : cpu > 45 ? "#facc15" : "#4ade80";
  const memColor = mem > 75 ? "#f87171" : mem > 55 ? "#facc15" : "#60a5fa";

  const T = (id: typeof tab) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`px-4 py-2.5 text-[12px] font-medium transition-all border-b-2 capitalize ${
        tab === id ? "text-[#9b59b6] border-[#9b59b6]" : "text-white/40 border-transparent hover:text-white/65"
      }`}
    >
      {id}
    </button>
  );

  return (
    <div className="h-full flex flex-col text-[13px]" style={{ background: "#111" }}>
      <div className="flex shrink-0 border-b border-white/[0.07]">
        {(["overview","processes","disk","network"] as (typeof tab)[]).map(T)}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="flex justify-around pt-2">
            <ArcGauge value={cpu} color={cpuColor} label="CPU %" sublabel="32 cores" />
            <ArcGauge value={mem} color={memColor} label="RAM %" sublabel={`${Math.round(mem * 1.28).toFixed(0)} / 128 GB`} />
            <ArcGauge value={net} max={120} color="#c084fc" label="Net MB/s" sublabel="eth0" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">CPU + Memory History</p>
            <div className="h-28 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 6, right: 8, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cpuColor} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={cpuColor} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={memColor} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={memColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
                    formatter={(v: any, name: string) => [`${Math.round(v)}%`, name === "cpu" ? "CPU" : "RAM"]}
                  />
                  <Area type="monotone" dataKey="cpu" stroke={cpuColor} strokeWidth={1.5} fill="url(#g1)" />
                  <Area type="monotone" dataKey="mem" stroke={memColor} strokeWidth={1.5} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Processes ── */}
      {tab === "processes" && (
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 border-b border-white/[0.07]" style={{ background: "#111" }}>
              <tr>
                {(["pid","name","cpu","mem"] as SortKey[]).map((k) => (
                  <th key={k} onClick={() => handleSort(k)}
                    className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-white/35 cursor-pointer hover:text-white/65 select-none"
                  >
                    {k} {sort.key === k ? (sort.dir === -1 ? "↓" : "↑") : ""}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-white/35">Status</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-white/35">User</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.pid} className="border-t border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                  <td className="px-3 py-2 font-mono text-[11px] text-white/30">{p.pid}</td>
                  <td className="px-3 py-2 text-white/80 font-medium">{p.name}</td>
                  <td className="px-3 py-2 font-mono text-[12px]"
                    style={{ color: p.cpu > 20 ? "#f87171" : "#4ade80" }}>
                    {p.cpu.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px] text-white/55">{p.mem} MB</td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      p.status === "running"
                        ? "bg-green-500/15 text-green-400"
                        : "bg-white/6 text-white/35"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-3 py-2 text-white/30 text-[11px]">{p.user}</td>
                  <td className="px-3 py-2">
                    {kill === p.pid ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          onClick={() => { setProcs((ps) => ps.filter((x) => x.pid !== p.pid)); setKill(null); }}
                        >Kill</button>
                        <button className="text-[10px] text-white/25 hover:text-white/60" onClick={() => setKill(null)}>✕</button>
                      </div>
                    ) : (
                      <button className="text-white/15 hover:text-red-400 transition-colors" onClick={() => setKill(p.pid)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Disk ── */}
      {tab === "disk" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Mounted Filesystems</p>
          <DiskBar mount="/"          used={234} total={512} />
          <DiskBar mount="/home"      used={89}  total={256} />
          <DiskBar mount="/var"       used={62}  total={128} />
          <DiskBar mount="/tmp"       used={4}   total={32}  />
          <DiskBar mount="/boot"      used={1}   total={2}   />
          <div className="mt-4 p-3 rounded-xl text-[12px] space-y-1.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-between"><span className="text-white/40">Total</span><span className="text-white/70">930 GB</span></div>
            <div className="flex justify-between"><span className="text-white/40">Used</span><span className="text-white/70">390 GB (42%)</span></div>
            <div className="flex justify-between"><span className="text-white/40">Free</span><span className="text-green-400">540 GB</span></div>
          </div>
        </div>
      )}

      {/* ── Network ── */}
      {tab === "network" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Network I/O</p>
          <div className="h-32 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 6, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="gnet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 120]} hide />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any) => [`${Math.round(v)} MB/s`, "Network"]}
                />
                <Area type="monotone" dataKey="net" stroke="#c084fc" strokeWidth={1.5} fill="url(#gnet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-[12px]">
            {[
              { iface: "eth0",  ip: "192.168.1.100", rx: "2.4 MB/s", tx: "0.8 MB/s", up: true  },
              { iface: "lo",    ip: "127.0.0.1",     rx: "0.1 MB/s", tx: "0.1 MB/s", up: true  },
              { iface: "wlan0", ip: "—",             rx: "—",        tx: "—",        up: false },
            ].map((n) => (
              <div key={n.iface}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${n.up ? "bg-green-400" : "bg-white/15"}`} />
                  <span className="font-mono text-white/70">{n.iface}</span>
                  <span className="text-white/30">{n.ip}</span>
                </div>
                <div className="flex gap-4 text-white/45">
                  <span>↓ {n.rx}</span>
                  <span>↑ {n.tx}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
