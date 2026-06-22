import { useState } from "react";
const PAYLOADS = ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "<svg onload=alert(1)>", "javascript:alert(1)", "<iframe src=javascript:alert(1)>", "<body onload=alert(1)>"];
const TESTS = [
  { param: "search", payload: "<script>alert(1)</script>", severity: "High" },
  { param: "id", payload: "<img src=x onerror=alert(1)>", severity: "Critical" },
  { param: "redirect", payload: "javascript:alert(1)", severity: "Medium" },
];
export default function XssScan() {
  const [url, setUrl] = useState("https://target.com/search?q=test");
  const [results, setResults] = useState<typeof TESTS>([]);
  const [scanned, setScanned] = useState(false);
  const scan = () => { setResults(TESTS); setScanned(true); };
  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg hover:bg-[#b07cc6]" onClick={scan}>Scan</button>
      </div>
      <div className="flex-1 overflow-y-auto os-scrollbar">
        {scanned && results.map((r, i) => (
          <div key={i} className="bg-[#2d2d2d] rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2"><span className="text-[#e74c3c] font-medium">{r.param}</span><span className="text-[10px] bg-[#e74c3c]/20 text-[#e74c3c] px-2 py-0.5 rounded">{r.severity}</span></div>
            <div className="text-[11px] text-white/50 font-mono mt-1">{r.payload}</div>
          </div>
        ))}
        <div className="mt-4"><div className="text-[11px] text-white/40 mb-2">XSS Payload Library</div>{PAYLOADS.map((p, i) => <div key={i} className="text-[11px] text-white/50 font-mono py-0.5 border-b border-[#3d3d3d]/50">{p}</div>)}</div>
      </div>
    </div>
  );
}
