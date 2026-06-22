import { useState } from "react";
import { Globe } from "lucide-react";

export default function SSLScan() {
  const [url, setUrl] = useState("example.com");
  const [result, setResult] = useState<null | {grade: string, protocol: string, issuer: string, expiry: string, vulns: string[]}>(null);
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      const grades = ["A+", "A", "B", "C", "F"];
      setResult({
        grade: grades[Math.floor(Math.random() * grades.length)],
        protocol: ["TLS 1.3", "TLS 1.2", "TLS 1.1"][Math.floor(Math.random() * 3)],
        issuer: "Let's Encrypt Authority X3",
        expiry: "2026-08-15",
        vulns: Math.random() > 0.5 ? [] : ["BEAST"],
      });
      setScanning(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3"><Globe size={14} className="text-white/40" /><input className="bg-transparent text-white outline-none flex-1 py-2" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg hover:bg-[#b07cc6] disabled:opacity-50" onClick={scan} disabled={scanning}>{scanning ? "Scanning..." : "Scan"}</button>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${result.grade.startsWith("A") ? "bg-[#27ae60]/20 text-[#27ae60]" : result.grade === "B" ? "bg-[#f39c12]/20 text-[#f39c12]" : "bg-[#e74c3c]/20 text-[#e74c3c]"}`}>{result.grade}</div>
            <div><div className="text-white/90 font-medium">SSL Grade</div><div className="text-white/50 text-[11px]">Protocol: {result.protocol}</div></div>
          </div>
          <div className="bg-[#2d2d2d] rounded-lg p-3 space-y-2"><div className="text-white/50">Issuer</div><div className="text-white/80">{result.issuer}</div><div className="text-white/50">Expires</div><div className="text-white/80">{result.expiry}</div></div>
          {result.vulns.length > 0 && <div className="bg-[#e74c3c]/10 rounded-lg p-3"><div className="text-[#e74c3c] text-[12px]">Vulnerabilities: {result.vulns.join(", ")}</div></div>}
        </div>
      )}
    </div>
  );
}
