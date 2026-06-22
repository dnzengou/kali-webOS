import { useState } from "react";

const TABS = [
  { n: "exploit.py", c: "#!/usr/bin/env python3\n# CVE-2024-1337 Exploit\n\nimport requests\nimport sys\n\ndef exploit(target):\n    payload = \"<script>alert(1)</script>\"\n    r = requests.post(f\"http://{target}/api/v1/upload\",\n                     data={\"file\": payload})\n    if r.status_code == 200:\n        print(f\"[+] Target {target} is vulnerable!\")\n    else:\n        print(f\"[-] Target {target} is not vulnerable\")\n\nif __name__ == \"__main__\":\n    exploit(sys.argv[1])\n" },
  { n: "scan.sh", c: "#!/bin/bash\n# Network scanner\n\necho \"[*] Starting scan...\"\nnmap -sV -O $1\necho \"[+] Scan complete\"\n" },
  { n: "config.json", c: '{\n  "target": "192.168.1.100",\n  "ports": [22, 80, 443, 8080],\n  "threads": 50,\n  "timeout": 30,\n  "output": "results.json"\n}' },
];

export default function CodeEditor() {
  const [tabs, setTabs] = useState(TABS);
  const [active, setActive] = useState(0);
  const t = tabs[active];
  const lines = t.c.split("\n");
  return (
    <div className="h-full flex flex-col text-[13px]">
      <div className="flex border-b border-[#3d3d3d] overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={i} className={`px-4 py-2 text-[11px] whitespace-nowrap ${active === i ? "bg-[#2d2d2d] text-white border-t-2 border-t-[#9b59b6]" : "text-white/50 hover:bg-white/5"}`} onClick={() => setActive(i)}>{tab.n}</button>
        ))}
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-10 shrink-0 text-right pr-2 pt-3 text-[11px] text-white/30 select-none border-r border-[#3d3d3d] font-mono">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea className="flex-1 bg-transparent text-white/90 p-3 text-[12px] outline-none resize-none terminal-text" style={{ tabSize: 4 }} value={t.c} onChange={e => setTabs(tabs.map((tab, i) => i === active ? { ...tab, c: e.target.value } : tab))} spellCheck={false} />
      </div>
      <div className="px-3 py-1 text-[10px] text-white/40 border-t border-[#3d3d3d]">{t.n} | {lines.length} lines | UTF-8</div>
    </div>
  );
}
