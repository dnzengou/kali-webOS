import { useState, useCallback, useMemo } from "react";
import { RefreshCw, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

const CHARSET = {
  upper:  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower:  "abcdefghijklmnopqrstuvwxyz",
  num:    "0123456789",
  sym:    "!@#$%^&*()_+-=[]{}|;:,.<>?",
  ambig:  "0O1lI",
};

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#a855f7"];

function entropy(chars: number, len: number) {
  if (chars === 0) return 0;
  return Math.floor(len * Math.log2(chars));
}

function calcStrength(pwd: string, bits: number): number {
  if (pwd.length < 6)  return 1;
  if (bits < 28)       return 1;
  if (bits < 40)       return 2;
  if (bits < 60)       return 3;
  if (bits < 80)       return 4;
  return 5;
}

function generate(
  len: number,
  upper: boolean, lower: boolean, num: boolean, sym: boolean,
  noAmbig: boolean,
): string {
  let pool = [
    upper ? CHARSET.upper : "",
    lower ? CHARSET.lower : "",
    num   ? CHARSET.num   : "",
    sym   ? CHARSET.sym   : "",
  ].join("");

  if (noAmbig) pool = pool.split("").filter((c) => !CHARSET.ambig.includes(c)).join("");
  if (!pool) return "";

  // Cryptographically random via getRandomValues
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => pool[v % pool.length]).join("");
}

interface HistoryEntry { pwd: string; copied: boolean; }

export default function PassGen() {
  const [len,     setLen]     = useState(20);
  const [upper,   setUpper]   = useState(true);
  const [lower,   setLower]   = useState(true);
  const [num,     setNum]     = useState(true);
  const [sym,     setSym]     = useState(true);
  const [noAmbig, setNoAmbig] = useState(false);
  const [pwd,     setPwd]     = useState(() => generate(20, true, true, true, true, false));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied,  setCopied]  = useState(false);
  const [showHist, setShowHist] = useState(false);

  const poolSize = useMemo(() => {
    let s = 0;
    if (upper) s += (noAmbig ? CHARSET.upper.split("").filter((c) => !CHARSET.ambig.includes(c)).length : 26);
    if (lower) s += (noAmbig ? CHARSET.lower.split("").filter((c) => !CHARSET.ambig.includes(c)).length : 26);
    if (num)   s += (noAmbig ? CHARSET.num.split("").filter((c)   => !CHARSET.ambig.includes(c)).length : 10);
    if (sym)   s += CHARSET.sym.length;
    return s;
  }, [upper, lower, num, sym, noAmbig]);

  const bits     = entropy(poolSize, len);
  const strength = calcStrength(pwd, bits);
  const strengthLabel = STRENGTH_LABELS[strength];
  const strengthColor = STRENGTH_COLORS[strength];

  const regen = useCallback(() => {
    const p = generate(len, upper, lower, num, sym, noAmbig);
    setPwd(p);
    setCopied(false);
  }, [len, upper, lower, num, sym, noAmbig]);

  const copyPwd = async (p: string, isHistory = false) => {
    await navigator.clipboard?.writeText(p);
    if (!isHistory) {
      setCopied(true);
      setHistory((h) => [{ pwd: p, copied: true }, ...h].slice(0, 12));
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const bulkGenerate = () => {
    const batch = Array.from({ length: 5 }, () => generate(len, upper, lower, num, sym, noAmbig));
    setHistory((h) => [...batch.map((b) => ({ pwd: b, copied: false })), ...h].slice(0, 12));
    setShowHist(true);
  };

  // Colour each char by charset
  const coloredPwd = pwd.split("").map((c, i) => {
    const color =
      CHARSET.upper.includes(c) ? "#c084fc" :
      CHARSET.lower.includes(c) ? "#e2e8f0" :
      CHARSET.num.includes(c)   ? "#60a5fa" :
      "#fb923c";
    return <span key={i} style={{ color }}>{c}</span>;
  });

  const Toggle = ({ label, val, set }: { label: string; val: boolean; set: (v: boolean) => void }) => (
    <button onClick={() => set(!val)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-all"
      style={{
        background: val ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${val ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.07)"}`,
        color: val ? "#c084fc" : "rgba(255,255,255,0.4)",
      }}>
      <span className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-all ${val ? "border-[#a855f7]" : "border-white/25"}`}
        style={{ background: val ? "#a855f7" : "transparent" }}>
        {val && <Check size={8} />}
      </span>
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0a0e", color: "white" }}>
      <div className="flex-1 overflow-y-auto os-scrollbar p-4 space-y-4">

        {/* Password display */}
        <div className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="font-mono text-[18px] leading-relaxed break-all tracking-wide mb-3 min-h-[54px]">
            {coloredPwd}
          </div>

          {/* Strength bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 flex gap-0.5 h-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex-1 rounded-full transition-all duration-300"
                  style={{ background: i < strength ? strengthColor : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
            <span className="text-[11px] font-medium shrink-0 transition-colors" style={{ color: strengthColor }}>
              {strengthLabel}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/30 mb-3">
            <span>{bits} bits entropy</span>
            <span>{poolSize} char pool · {len} chars</span>
          </div>

          <div className="flex gap-2">
            <button onClick={regen}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#9b59b6,#7c3aed)", boxShadow: "0 4px 18px rgba(155,89,182,0.35)" }}>
              <RefreshCw size={13} /> Generate
            </button>
            <button onClick={() => copyPwd(pwd)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] transition-all active:scale-95"
              style={{
                background: copied ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: copied ? "#4ade80" : "rgba(255,255,255,0.6)",
              }}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Length slider */}
        <div>
          <div className="flex justify-between text-[12px] mb-2">
            <span className="text-white/50">Length</span>
            <span className="font-mono font-semibold" style={{ color: "#a855f7" }}>{len}</span>
          </div>
          <input type="range" min={4} max={128} value={len}
            onChange={(e) => { setLen(+e.target.value); }}
            onMouseUp={regen} onTouchEnd={regen}
            className="w-full accent-[#9b59b6]" />
          <div className="flex justify-between text-[9px] text-white/20 mt-0.5">
            <span>4</span><span>32</span><span>64</span><span>128</span>
          </div>
        </div>

        {/* Character toggles */}
        <div className="grid grid-cols-2 gap-1.5">
          <Toggle label="A–Z Uppercase" val={upper} set={(v) => { setUpper(v); }} />
          <Toggle label="a–z Lowercase" val={lower} set={(v) => { setLower(v); }} />
          <Toggle label="0–9 Numbers"   val={num}   set={(v) => { setNum(v);   }} />
          <Toggle label="!@# Symbols"   val={sym}   set={(v) => { setSym(v);   }} />
        </div>

        {/* Extra options */}
        <div className="flex gap-1.5 flex-wrap">
          <Toggle label="No ambiguous (0/O, 1/l/I)" val={noAmbig} set={setNoAmbig} />
        </div>

        {/* Bulk + history */}
        <div className="flex gap-2">
          <button onClick={bulkGenerate}
            className="flex-1 py-2 rounded-xl text-[11px] text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            Generate 5
          </button>
          <button onClick={() => setShowHist((p) => !p)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] text-white/40 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            History {history.length > 0 && <span className="bg-[#9b59b6] text-white text-[9px] px-1.5 rounded-full">{history.length}</span>}
            {showHist ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {/* History list */}
        {showHist && history.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {history.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 group transition-all hover:bg-white/[0.03]"
                style={{ borderBottom: i < history.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span className="font-mono text-[11px] text-white/55 truncate flex-1 mr-2">{entry.pwd}</span>
                <button onClick={() => copyPwd(entry.pwd, true)}
                  className="text-white/20 hover:text-[#a855f7] transition-all opacity-0 group-hover:opacity-100 shrink-0">
                  <Copy size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
