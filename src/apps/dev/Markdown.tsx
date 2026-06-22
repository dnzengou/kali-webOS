import { useState } from "react";
const DEFAULT_MD = "# Kali WebOS\\n\\n## Features\\n\\n- **55+ apps** built-in\\n- Dark theme with violet accents\\n\\n## Code\\n\\n```python\\ndef scan(target):\\n    print(f\"Scanning {target}\")\\n```\\n\\n> \"The quieter you become, the more you can hear.\"\\n\\n| Tool | Purpose |\\n|------|---------|\\n| Nmap | Port scanning |\\n| Metasploit | Exploitation |\\n";

function mdToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-[15px] font-bold text-white mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-[18px] font-bold text-[#9b59b6] mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-[24px] font-bold text-white mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-[#0c0c0c] px-1 py-0.5 rounded text-[#9b59b6] text-[11px]">$1</code>')
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-[#9b59b6] pl-3 my-2 text-white/60 italic">$1</blockquote>')
    .replace(/^---$/gim, '<hr class="border-[#3d3d3d] my-3" />')
    .replace(/^- (.*$)/gim, '<li class="ml-4 text-white/80 text-[12px]">$1</li>')
    .replace(/\n/g, '<br/>');
}

export default function Markdown() {
  const [md, setMd] = useState(DEFAULT_MD);
  return (
    <div className="h-full flex">
      <textarea className="flex-1 bg-[#2d2d2d] text-white/90 p-4 text-[12px] outline-none resize-none terminal-text overflow-y-auto os-scrollbar border-r border-[#3d3d3d]" value={md} onChange={e => setMd(e.target.value)} spellCheck={false} />
      <div className="flex-1 p-4 overflow-y-auto os-scrollbar text-[13px]" dangerouslySetInnerHTML={{ __html: mdToHtml(md) }} />
    </div>
  );
}
