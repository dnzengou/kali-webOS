import { useState } from "react";
export default function Whois() {
  const [domain, setDomain] = useState("kali.org");
  const [result, setResult] = useState<null | Record<string, string>>(null);

  const lookup = () => {
    setResult({
      "Domain Name": domain,
      "Registrar": "GoDaddy.com, LLC",
      "Creation Date": "2013-03-12",
      "Expiry Date": "2027-03-12",
      "Name Server": "ns1.kali.org, ns2.kali.org",
      "Status": "clientDeleteProhibited",
      "Admin Email": "redacted for privacy",
    });
  };

  return (
    <div className="h-full flex flex-col p-4 text-[13px]">
      <div className="flex gap-2 mb-4">
        <input className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white outline-none focus:border-[#9b59b6]" value={domain} onChange={(e) => setDomain(e.target.value)} />
        <button className="bg-[#9b59b6] text-white px-4 py-2 rounded-lg hover:bg-[#b07cc6]" onClick={lookup}>Lookup</button>
      </div>
      {result && (
        <div className="flex-1 overflow-y-auto os-scrollbar bg-[#2d2d2d] rounded-lg p-3">
          {Object.entries(result).map(([k, v]) => (
            <div key={k} className="flex py-2 border-b border-[#3d3d3d] last:border-0"><span className="w-32 text-white/50 shrink-0">{k}</span><span className="text-white/80">{v}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
