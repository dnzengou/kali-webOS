import { useState } from "react";
const VENDORS: Record<string, string> = { "00:1A:2B": "Cisco Systems", "00:1B:11": "Intel", "00:50:56": "VMware", "B8:27:EB": "Raspberry Pi", "AC:DE:48": "Apple" };
export default function MacLookup() {
  const [mac, setMac] = useState("00:1A:2B:3C:4D:5E");
  const [result, setResult] = useState<{vendor: string, oui: string} | null>(null);
  const lookup = () => { const oui = mac.slice(0, 8).toUpperCase(); setResult({ vendor: VENDORS[oui] || "Unknown Vendor", oui }); };
  const random = () => { const prefixes = Object.keys(VENDORS); const p = prefixes[Math.floor(Math.random() * prefixes.length)]; setMac(p + ":" + Array.from({length:6}, () => Math.floor(Math.random()*256).toString(16).padStart(2,"0")).join(":").match(/.{2}/g)?.join(":") || ""); };
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none font-mono" value={mac} onChange={(e) => setMac(e.target.value)} />
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg hover:bg-[#b07cc6]" onClick={lookup}>Lookup</button>
      </div>
      <button className="text-[12px] text-white/50 hover:text-white mb-4" onClick={random}>Generate random MAC</button>
      {result && <div className="bg-[#2d2d2d] rounded-lg p-4 space-y-2"><div className="text-white/50">OUI: <span className="text-white/80 font-mono">{result.oui}</span></div><div className="text-white/50">Vendor: <span className="text-white/80">{result.vendor}</span></div></div>}
    </div>
  );
}
