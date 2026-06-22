import { useState } from "react";
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
export default function ApiTest() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.kali.org/v1/tools");
  const [body, setBody] = useState('{\n  "category": "network"\n}');
  const [resp, setResp] = useState("");
  const [status, setStatus] = useState(0);
  const send = () => {
    setStatus(200);
    setResp(JSON.stringify({ status: "ok", tools: [{ name: "nmap", version: "7.94" }, { name: "wireshark", version: "4.0.8" }] }, null, 2));
  };
  return (
    <div className="h-full flex flex-col p-3 text-[13px]">
      <div className="flex gap-2 mb-3">
        <select className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-2 py-2 text-white text-[12px]" value={method} onChange={e => setMethod(e.target.value)}>{METHODS.map(m => <option key={m}>{m}</option>)}</select>
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none" value={url} onChange={e => setUrl(e.target.value)} />
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg" onClick={send}>Send</button>
      </div>
      <div className="flex gap-2 mb-2"><button className="text-[11px] text-[#9b59b6]">Body</button></div>
      <textarea className="h-24 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg p-2 text-white text-[11px] outline-none resize-none font-mono mb-3" value={body} onChange={e => setBody(e.target.value)} />
      <div className="flex gap-2 mb-2"><span className="text-[11px] text-white/40">Response</span>{status > 0 && <span className="text-[11px] text-[#27ae60]">{status} OK</span>}</div>
      <div className="flex-1 bg-[#0c0c0c] rounded-lg p-3 overflow-y-auto os-scrollbar font-mono text-[11px] text-white/80">{resp}</div>
    </div>
  );
}
