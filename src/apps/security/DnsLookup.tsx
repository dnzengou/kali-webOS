import { useState } from "react";
const TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"];
const SAMPLE: Record<string, {type: string, value: string, ttl: string}[]> = {
  A: [{ type: "A", value: "192.168.1.100", ttl: "300" }, { type: "A", value: "192.168.1.101", ttl: "300" }],
  MX: [{ type: "MX", value: "10 mail.kali.org", ttl: "3600" }, { type: "MX", value: "20 mail2.kali.org", ttl: "3600" }],
  NS: [{ type: "NS", value: "ns1.kali.org", ttl: "86400" }, { type: "NS", value: "ns2.kali.org", ttl: "86400" }],
};
export default function DnsLookup() {
  const [domain, setDomain] = useState("kali.org");
  const [type, setType] = useState("A");
  const [results, setResults] = useState<typeof SAMPLE["A"]>([]);
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none" value={domain} onChange={(e) => setDomain(e.target.value)} />
        <select className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 text-white outline-none" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg hover:bg-[#b07cc6]" onClick={() => setResults(SAMPLE[type] || [{ type, value: "No records found", ttl: "-" }])}>Lookup</button>
      </div>
      {results.length > 0 && (
        <table className="w-full"><thead className="text-[11px] text-white/50"><tr><th className="text-left px-3 py-2">Type</th><th className="text-left px-3 py-2">Value</th><th className="text-left px-3 py-2">TTL</th></tr></thead><tbody>{results.map((r, i) => <tr key={i} className="border-t border-[#3d3d3d]"><td className="px-3 py-2 text-white/70">{r.type}</td><td className="px-3 py-2 text-white/80 font-mono text-[12px]">{r.value}</td><td className="px-3 py-2 text-white/50">{r.ttl}</td></tr>)}</tbody></table>
      )}
    </div>
  );
}
