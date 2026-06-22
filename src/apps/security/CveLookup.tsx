import { useState } from "react";
const CVES = [
  { id: "CVE-2024-1234", severity: "Critical", desc: "Remote code execution in Apache HTTP Server", date: "2024-01-15" },
  { id: "CVE-2024-5678", severity: "High", desc: "SQL injection vulnerability in WordPress plugin", date: "2024-02-20" },
  { id: "CVE-2024-9012", severity: "Medium", desc: "Information disclosure in OpenSSL", date: "2024-03-10" },
  { id: "CVE-2024-3456", severity: "High", desc: "Buffer overflow in Nginx", date: "2024-04-05" },
  { id: "CVE-2024-7890", severity: "Critical", desc: "Privilege escalation in Linux kernel", date: "2024-05-01" },
];
const COLORS: Record<string, string> = { Critical: "bg-[#e74c3c]/20 text-[#e74c3c]", High: "bg-[#f39c12]/20 text-[#f39c12]", Medium: "bg-[#3498db]/20 text-[#3498db]", Low: "bg-[#27ae60]/20 text-[#27ae60]" };
export default function CveLookup() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = CVES.filter((c) => (filter === "All" || c.severity === filter) && (!query || c.id.includes(query) || c.desc.toLowerCase().includes(query.toLowerCase())));
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-3">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none" placeholder="Search CVEs..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="flex gap-1 mb-3">{["All", "Critical", "High", "Medium"].map((f) => <button key={f} className={`px-2 py-1 text-[11px] rounded-full ${filter === f ? "bg-[#9b59b6] text-white" : "bg-[#2d2d2d] text-white/50"}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
      <div className="flex-1 overflow-y-auto os-scrollbar space-y-2">
        {filtered.map((c) => (
          <div key={c.id} className="bg-[#2d2d2d] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1"><span className="font-mono text-[12px] text-white/90">{c.id}</span><span className={`text-[10px] px-2 py-0.5 rounded ${COLORS[c.severity]}`}>{c.severity}</span></div>
            <div className="text-[12px] text-white/60">{c.desc}</div>
            <div className="text-[10px] text-white/40 mt-1">{c.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
