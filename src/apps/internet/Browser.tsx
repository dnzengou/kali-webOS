import { useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Star, Plus, X } from "lucide-react";

const HOMEPAGE = `<!DOCTYPE html><html><head><style>body{background:#1a1a1a;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:sans-serif;margin:0;}h1{font-size:28px;margin-bottom:10px;}p{color:#888;margin-bottom:30px;}a{color:#9b59b6;text-decoration:none;margin:0 15px;}</style></head><body><div style="font-size:48px;margin-bottom:20px;">&#128009;</div><h1>Kali Web Browser</h1><p>Enter a URL to start browsing</p><div><a href="#">Exploit-DB</a><a href="#">Kali Tools</a><a href="#">OffSec</a><a href="#">HackTheBox</a></div></body></html>`;

export default function Browser() {
  const [tabs, setTabs] = useState([{ id: 1, url: "kali:startpage", title: "New Tab" }]);
  const [activeTab, setActiveTab] = useState(1);
  const [url, setUrl] = useState("");
  const active = tabs.find((t) => t.id === activeTab);
  const navigate = () => { if (!url.trim()) return; setTabs(tabs.map((t) => t.id === activeTab ? { ...t, url: url.startsWith("http") ? url : `https://${url}`, title: url } : t)); };
  const newTab = () => { const id = Date.now(); setTabs([...tabs, { id, url: "kali:startpage", title: "New Tab" }]); setActiveTab(id); };
  const closeTab = (id: number) => { if (tabs.length === 1) return; const next = tabs.filter((t) => t.id !== id); setTabs(next); if (activeTab === id) setActiveTab(next[0].id); };
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[#3d3d3d] bg-[#1a1a1a] overflow-x-auto">
        {tabs.map((t) => (
          <div key={t.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg text-[11px] max-w-[140px] cursor-pointer ${activeTab === t.id ? "bg-[#2d2d2d] text-white" : "text-white/50 hover:bg-white/5"}`} onClick={() => setActiveTab(t.id)}>
            <span className="truncate flex-1">{t.title}</span><button className="text-white/30 hover:text-white ml-1" onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}><X size={10} /></button>
          </div>
        ))}
        <button className="text-white/50 hover:text-white px-2" onClick={newTab}><Plus size={14} /></button>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3d3d3d] bg-[#1a1a1a]">
        <button className="text-white/40 hover:text-white"><ArrowLeft size={14} /></button>
        <button className="text-white/40 hover:text-white"><ArrowRight size={14} /></button>
        <button className="text-white/40 hover:text-white"><RefreshCw size={14} /></button>
        <div className="flex-1 flex items-center bg-[#2d2d2d] rounded-lg px-3 py-1.5"><input className="bg-transparent text-white text-[12px] outline-none flex-1" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && navigate()} placeholder="Enter URL..." /></div>
        <button className="text-white/40 hover:text-[#f39c12]"><Star size={14} /></button>
      </div>
      <div className="flex-1">
        {active?.url === "kali:startpage" ? <iframe srcDoc={HOMEPAGE} className="w-full h-full border-none" title="browser" /> : (
          <div className="flex items-center justify-center h-full text-white/40 text-[13px]"><div className="text-center"><div className="mb-2">Unable to load page</div><div className="text-[11px] text-white/20">{active?.url}</div></div></div>
        )}
      </div>
    </div>
  );
}
