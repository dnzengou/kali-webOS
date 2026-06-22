import { useState, useEffect, useRef, useCallback, useDeferredValue } from "react";
import { Copy, Check, Upload, KeyRound, RotateCcw } from "lucide-react";

type Algo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
type Mode = "text" | "hmac" | "file";

const ALGOS: Algo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

const LEN: Record<Algo, number> = { "SHA-1": 40, "SHA-256": 64, "SHA-384": 96, "SHA-512": 128 };

async function digest(algo: Algo, data: BufferSource): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(algo: Algo, keyStr: string, data: BufferSource): Promise<string> {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(keyStr), { name: "HMAC", hash: algo }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", keyMat, data);
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGen() {
  const [mode,    setMode]    = useState<Mode>("text");
  const [input,   setInput]   = useState("Hello, Kali WebOS!");
  const [secret,  setSecret]  = useState("my-secret-key");
  const [algo,    setAlgo]    = useState<Algo>("SHA-256");
  const [hashes,  setHashes]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [compare, setCompare] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  const deferred = useDeferredValue(input);

  const compute = useCallback(async (text: string, fileData?: ArrayBuffer) => {
    setLoading(true);
    const enc = new TextEncoder();
    const buf = fileData ?? enc.encode(text);
    try {
      const results: Record<string, string> = {};
      for (const a of ALGOS) {
        results[a] = mode === "hmac"
          ? await hmac(a, secret, buf)
          : await digest(a, buf);
      }
      setHashes(results);
    } catch (e) {
      setHashes({ error: String(e) } as any);
    }
    setLoading(false);
  }, [mode, secret]);

  // Re-compute on text/mode/secret change
  useEffect(() => {
    if (mode !== "file") compute(deferred);
  }, [deferred, mode, secret, compute]);

  const copy = async (h: string, key: string) => {
    await navigator.clipboard?.writeText(h);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  // File drop
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    setFileName(file.name);
    file.arrayBuffer().then((buf) => compute("", buf));
  }, [compute]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    file.arrayBuffer().then((buf) => compute("", buf));
  };

  useEffect(() => {
    const el = dropRef.current;
    if (!el || mode !== "file") return;
    const over = (e: DragEvent) => { e.preventDefault(); el.style.borderColor = "#a855f7"; };
    const leave = () => { el.style.borderColor = "rgba(255,255,255,0.1)"; };
    const drop = (e: DragEvent) => { leave(); handleDrop(e); };
    el.addEventListener("dragover", over);
    el.addEventListener("dragleave", leave);
    el.addEventListener("drop", drop);
    return () => { el.removeEventListener("dragover", over); el.removeEventListener("dragleave", leave); el.removeEventListener("drop", drop); };
  }, [mode, handleDrop]);

  const reset = () => { setInput("Hello, Kali WebOS!"); setFileName(null); setHashes({}); };

  const compareHash = hashes[algo] ?? "";
  const matchState = compare.length > 0
    ? (compare.toLowerCase() === compareHash.toLowerCase() ? "match" : compare.length === compareHash.length ? "mismatch" : "typing")
    : null;

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0a0e", color: "white" }}>
      {/* Mode tabs */}
      <div className="flex border-b border-white/[0.06] shrink-0">
        {([["text", "Text"], ["hmac", "HMAC"], ["file", "File"]] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setHashes({}); }}
            className={`px-4 py-2.5 text-[12px] font-medium transition-all border-b-2 ${
              mode === m ? "text-[#a855f7] border-[#a855f7]" : "text-white/35 border-transparent hover:text-white/60"
            }`}>{label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto os-scrollbar p-4 space-y-3">
        {/* Input area */}
        {mode === "text" && (
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            rows={3} placeholder="Enter text to hash…"
            className="w-full px-3 py-2.5 rounded-xl text-[13px] text-white/90 placeholder-white/20 outline-none resize-none font-mono"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
        )}

        {mode === "hmac" && (
          <div className="space-y-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              rows={3} placeholder="Message…"
              className="w-full px-3 py-2.5 rounded-xl text-[13px] text-white/90 placeholder-white/20 outline-none resize-none font-mono"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
            <div className="flex items-center gap-2">
              <KeyRound size={13} className="text-white/30 shrink-0" />
              <input value={secret} onChange={(e) => setSecret(e.target.value)}
                placeholder="Secret key…"
                className="flex-1 px-3 py-2 rounded-xl text-[12px] text-white/80 placeholder-white/20 outline-none font-mono"
                style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }} />
            </div>
          </div>
        )}

        {mode === "file" && (
          <div ref={dropRef}
            className="rounded-xl p-6 text-center transition-all cursor-pointer"
            style={{ border: "2px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
            onClick={() => document.getElementById("hash-file-input")?.click()}>
            <Upload size={24} className="mx-auto mb-2 text-white/25" />
            {fileName
              ? <p className="text-[13px] text-white/70 font-medium">{fileName}</p>
              : <><p className="text-[13px] text-white/40">Drop a file or click to browse</p><p className="text-[11px] text-white/20 mt-0.5">Hashes computed locally — nothing uploaded</p></>}
            <input id="hash-file-input" type="file" className="hidden" onChange={handleFileInput} />
            {fileName && (
              <button onClick={(e) => { e.stopPropagation(); reset(); }}
                className="mt-2 text-[11px] text-white/30 hover:text-red-400 transition-colors flex items-center gap-1 mx-auto">
                <RotateCcw size={10} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Algo selector */}
        <div className="flex gap-1.5 flex-wrap">
          {ALGOS.map((a) => (
            <button key={a} onClick={() => setAlgo(a)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                algo === a ? "text-white bg-[#9b59b6]" : "text-white/40 hover:text-white/70"
              }`}
              style={{ background: algo === a ? "#9b59b6" : "rgba(255,255,255,0.05)", border: `1px solid ${algo === a ? "#9b59b6" : "rgba(255,255,255,0.07)"}` }}>
              {a}
            </button>
          ))}
        </div>

        {/* Hash results */}
        {loading && (
          <div className="text-[12px] text-white/30 animate-pulse">Computing…</div>
        )}

        {!loading && Object.keys(hashes).length > 0 && (
          <div className="space-y-2">
            {ALGOS.map((a) => {
              const h = hashes[a] ?? "";
              const isCopied = copied === a;
              const isSelected = a === algo;
              return (
                <div key={a} className={`rounded-xl px-3 py-2.5 transition-all ${isSelected ? "ring-1 ring-[#9b59b6]/40" : ""}`}
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,${isSelected ? "0.1" : "0.05"})` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono" style={{ color: isSelected ? "#a855f7" : "rgba(255,255,255,0.35)" }}>{a} · {LEN[a]} chars</span>
                    <button onClick={() => copy(h, a)}
                      className="flex items-center gap-1 text-[10px] transition-all"
                      style={{ color: isCopied ? "#4ade80" : "rgba(255,255,255,0.3)" }}>
                      {isCopied ? <Check size={11} /> : <Copy size={11} />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono break-all leading-relaxed"
                    style={{ color: isSelected ? "#e2e8f0" : "rgba(255,255,255,0.5)" }}>{h || "—"}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Compare panel */}
        {!loading && hashes[algo] && (
          <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/35 mb-1.5 uppercase tracking-widest">Compare ({algo})</p>
            <input value={compare} onChange={(e) => setCompare(e.target.value)}
              placeholder="Paste a hash to verify…"
              className="w-full px-2.5 py-2 rounded-lg text-[11px] font-mono text-white/70 placeholder-white/20 outline-none transition-all"
              style={{
                background: matchState === "match" ? "rgba(74,222,128,0.08)" : matchState === "mismatch" ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.04)",
                border: matchState === "match" ? "1px solid rgba(74,222,128,0.3)" : matchState === "mismatch" ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(255,255,255,0.08)",
              }} />
            {matchState === "match"    && <p className="text-[11px] text-green-400 mt-1.5 flex items-center gap-1"><Check size={11} /> Match — hashes are identical</p>}
            {matchState === "mismatch" && <p className="text-[11px] text-red-400 mt-1.5">✗ Mismatch — hashes differ</p>}
          </div>
        )}
      </div>
    </div>
  );
}
