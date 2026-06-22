import { useState } from "react";
import { Play } from "lucide-react";

const PORTS = [
  { port: 22, service: "SSH", state: "open", version: "OpenSSH 8.9" },
  { port: 80, service: "HTTP", state: "open", version: "nginx 1.24" },
  { port: 443, service: "HTTPS", state: "open", version: "nginx 1.24" },
  { port: 3306, service: "MySQL", state: "closed", version: "" },
  { port: 8080, service: "HTTP-Proxy", state: "open", version: "Apache" },
  { port: 21, service: "FTP", state: "filtered", version: "" },
  { port: 25, service: "SMTP", state: "closed", version: "" },
  { port: 53, service: "DNS", state: "open", version: "BIND 9.16" },
];

export default function Nmap() {
  const [target, setTarget] = useState("192.168.1.1");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<typeof PORTS | null>(null);
  const [progress, setProgress] = useState(0);

  const scan = () => {
    setScanning(true);
    setResults(null);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setResults(PORTS.sort(() => Math.random() - 0.5));
        setScanning(false);
      }
    }, 200);
  };

  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none focus:border-[#9b59b6]" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target IP/hostname" />
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#b07cc6] disabled:opacity-50" onClick={scan} disabled={scanning}><Play size={14} />{scanning ? "Scanning..." : "Scan"}</button>
      </div>
      {scanning && (
        <div className="mb-4">
          <div className="flex justify-between text-white/50 mb-1"><span>Scanning {target}...</span><span>{progress}%</span></div>
          <div className="w-full h-2 bg-[#2d2d2d] rounded-full overflow-hidden"><div className="h-full bg-[#9b59b6] transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      {results && (
        <div className="flex-1 overflow-y-auto os-scrollbar">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#2d2d2d] text-[11px] text-white/50"><tr><th className="px-3 py-2 text-left">PORT</th><th className="px-3 py-2 text-left">STATE</th><th className="px-3 py-2 text-left">SERVICE</th><th className="px-3 py-2 text-left">VERSION</th></tr></thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t border-[#3d3d3d]">
                  <td className="px-3 py-2 text-white/80">{r.port}/tcp</td>
                  <td className="px-3 py-2"><span className={`text-[11px] px-2 py-0.5 rounded ${r.state === "open" ? "bg-[#27ae60]/20 text-[#27ae60]" : r.state === "closed" ? "bg-[#e74c3c]/20 text-[#e74c3c]" : "bg-[#f39c12]/20 text-[#f39c12]"}`}>{r.state}</span></td>
                  <td className="px-3 py-2 text-white/70">{r.service}</td>
                  <td className="px-3 py-2 text-white/50">{r.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
