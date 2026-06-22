import { useState } from "react";
const WORDLIST = ["www", "mail", "ftp", "admin", "blog", "api", "dev", "staging", "vpn", "secure", "shop", "support", "docs", "portal", "cdn", "media", "static", "app", "test", "demo"];
export default function SubFinder() {
  const [domain, setDomain] = useState("kali.org");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [found, setFound] = useState<{sub: string, ip: string}[]>([]);

  const scan = () => {
    setScanning(true);
    setFound([]);
    setProgress(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setProgress(Math.floor((i / WORDLIST.length) * 100));
      if (Math.random() > 0.4) {
        setFound((f) => [...f, { sub: `${WORDLIST[i - 1]}.${domain}`, ip: `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}` }]);
      }
      if (i >= WORDLIST.length) { clearInterval(interval); setScanning(false); }
    }, 200);
  };

  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none" value={domain} onChange={(e) => setDomain(e.target.value)} />
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg hover:bg-[#b07cc6] disabled:opacity-50" onClick={scan} disabled={scanning}>{scanning ? `${progress}%` : "Scan"}</button>
      </div>
      {scanning && <div className="w-full h-2 bg-[#2d2d2d] rounded-full mb-3 overflow-hidden"><div className="h-full bg-[#9b59b6] transition-all" style={{ width: `${progress}%` }} /></div>}
      <div className="flex-1 overflow-y-auto os-scrollbar">
        <table className="w-full"><thead className="text-[11px] text-white/50 sticky top-0 bg-[#2d2d2d]"><tr><th className="text-left px-3 py-2">Subdomain</th><th className="text-left px-3 py-2">IP</th></tr></thead>
          <tbody>{found.map((f, i) => <tr key={i} className="border-t border-[#3d3d3d]"><td className="px-3 py-2 text-[#2ecc71] font-mono text-[12px]">{f.sub}</td><td className="px-3 py-2 text-white/60 font-mono text-[12px]">{f.ip}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
