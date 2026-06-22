import { useState } from "react";
import { Inbox, Send, FileText, Trash2, Star } from "lucide-react";
const EMAILS = [
  { from: "security@kali.org", subject: "Welcome to Kali WebOS", body: "Welcome! Start exploring the tools!", date: "10:30 AM", read: false, starred: true },
  { from: "alerts@offsec.com", subject: "New Exploit Available", body: "A critical exploit was added.", date: "9:15 AM", read: false, starred: false },
  { from: "team@hackthebox", subject: "Machine Pwned", body: "You rooted Escape!", date: "Yesterday", read: true, starred: true },
];
export default function Email() {
  const [selected, setSelected] = useState(0);
  const [compose, setCompose] = useState(false);
  const sel = EMAILS[selected];
  return (
    <div className="h-full flex text-[13px]">
      <div className="w-44 border-r border-[#3d3d3d] p-2 shrink-0">
        <button className="w-full bg-[#9b59b6] text-white py-2 rounded-lg mb-3 flex items-center justify-center gap-2" onClick={() => setCompose(true)}><Send size={14} />Compose</button>
        {[{i:Inbox,n:"Inbox",c:2},{i:Send,n:"Sent"},{i:FileText,n:"Drafts"},{i:Trash2,n:"Trash"}].map(f => (
          <button key={f.n} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-white/60 hover:bg-white/10">
            <f.i size={14} /><span className="flex-1">{f.n}</span>{f.c ? <span className="text-[10px] bg-[#9b59b6] text-white px-1.5 rounded-full">{f.c}</span> : null}
          </button>
        ))}
      </div>
      <div className="w-64 border-r border-[#3d3d3d] overflow-y-auto os-scrollbar">
        {EMAILS.map((e, i) => (
          <button key={i} className={`w-full text-left px-3 py-2.5 border-b border-[#3d3d3d] ${selected === i ? "bg-white/5" : ""} ${!e.read ? "border-l-2 border-l-[#9b59b6]" : ""}`} onClick={() => setSelected(i)}>
            <div className="flex gap-1"><Star size={10} className={e.starred ? "text-[#f39c12] fill-[#f39c12]" : "text-white/20"} /><span className={`text-[12px] ${!e.read ? "text-white font-medium" : "text-white/70"}`}>{e.from}</span></div>
            <div className={`text-[11px] truncate ${!e.read ? "text-white/80" : "text-white/50"}`}>{e.subject}</div>
            <div className="text-[10px] text-white/30">{e.date}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-y-auto os-scrollbar">
        {compose ? (
          <div className="space-y-3">
            <div className="flex justify-between"><h3 className="text-white/90">New Message</h3><button className="text-white/40" onClick={() => setCompose(false)}>Close</button></div>
            <input className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-[12px] outline-none" placeholder="To" />
            <input className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-[12px] outline-none" placeholder="Subject" />
            <textarea className="w-full h-48 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-[12px] outline-none resize-none" placeholder="Message body..." />
            <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg" onClick={() => setCompose(false)}>Send</button>
          </div>
        ) : (
          <div><h2 className="text-[16px] text-white font-medium mb-3">{sel.subject}</h2>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#3d3d3d]">
            <div className="w-8 h-8 rounded-full bg-[#9b59b6] flex items-center justify-center text-white text-[12px]">{sel.from[0].toUpperCase()}</div>
            <div><div className="text-white/80">{sel.from}</div><div className="text-white/40 text-[11px]">{sel.date}</div></div>
          </div>
          <p className="text-white/70">{sel.body}</p></div>
        )}
      </div>
    </div>
  );
}
