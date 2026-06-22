import { useState } from "react";
import { GitBranch, CircleDot } from "lucide-react";
const BRANCHES = ["main", "feature/xss-scanner", "bugfix/ssl-issue", "develop"];
const COMMITS = [
  { h: "a1b2c3d", m: "Add XSS scanner", a: "hacker1", d: "2h ago" },
  { h: "e4f5g6h", m: "Fix SSL validation", a: "pentest_pro", d: "5h ago" },
  { h: "i7j8k9l", m: "Update exploit DB", a: "root_admin", d: "1d ago" },
  { h: "m0n1o2p", m: "Initial commit", a: "kali-os", d: "2d ago" },
];
const CHANGES = [
  { f: "src/scanner/xss.py", s: "modified" },
  { f: "src/ssl/validator.py", s: "modified" },
  { f: "README.md", s: "modified" },
  { f: "requirements.txt", s: "added" },
];
export default function Git() {
  const [tab, setTab] = useState<"commits" | "changes">("commits");
  const [branch, setBranch] = useState("main");
  return (
    <div className="h-full flex text-[13px]">
      <div className="w-44 border-r border-[#3d3d3d] p-2 shrink-0">
        <div className="text-[10px] text-white/40 mb-2">Branches</div>
        {BRANCHES.map(b => (
          <button key={b} className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] ${branch === b ? "bg-[#9b59b6]/20 text-[#9b59b6]" : "text-white/60 hover:bg-white/10"}`} onClick={() => setBranch(b)}>
            <GitBranch size={12} />{b}
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex border-b border-[#3d3d3d]">
          {(["commits", "changes"] as const).map(t => (
            <button key={t} className={`px-4 py-2 text-[12px] ${tab === t ? "text-[#9b59b6] border-b-2 border-[#9b59b6]" : "text-white/50"}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        {tab === "commits" ? (
          <div className="flex-1 overflow-y-auto os-scrollbar p-3 space-y-2">
            {COMMITS.map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center"><div className="w-2 h-2 rounded-full bg-[#9b59b6]" /><div className="w-px h-full bg-[#3d3d3d]" /></div>
                <div className="pb-3"><div className="text-white/80 text-[12px]">{c.m}</div><div className="flex gap-2 text-[10px] text-white/40"><span className="font-mono">{c.h}</span><span>{c.a}</span><span>{c.d}</span></div></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto os-scrollbar p-3">
            {CHANGES.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-[#3d3d3d]">
                <CircleDot size={12} className={c.s === "added" ? "text-[#27ae60]" : "text-[#f39c12]"} />
                <span className="text-white/70 text-[12px]">{c.f}</span>
                <span className="text-[10px] text-white/40 ml-auto">{c.s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
