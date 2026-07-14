import React, { useState, useMemo, useCallback } from "react";
import { Copy, Check, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";

type ViewMode = "format" | "minify" | "tree" | "validate";

const SAMPLE = `{
  "name": "Kali WebOS",
  "version": "2.0.0",
  "tools": ["nmap", "metasploit", "wireshark", "burpsuite"],
  "config": {
    "theme": "dark",
    "language": "en",
    "autoUpdate": true,
    "maxConnections": 42
  },
  "active": true,
  "deprecated": null
}`;

// ── Syntax highlighter ────────────────────────────────────────────────────────
const C = {
  key:    "#c084fc",  // purple  — object keys
  str:    "#86efac",  // green   — string values
  num:    "#60a5fa",  // blue    — numbers
  bool:   "#fb923c",  // orange  — booleans
  null:   "#f87171",  // red     — null
  punct:  "rgba(255,255,255,0.3)", // dim — {}[],:
  ln:     "rgba(255,255,255,0.15)",
};

function highlightJson(text: string): React.JSX.Element[] {
  // Tokenise line by line
  const lines = text.split("\n");
  return lines.map((line, li) => {
    const tokens: React.JSX.Element[] = [];
    let i = 0;

    const push = (content: string, color: string, idx: number) =>
      tokens.push(<span key={idx} style={{ color }}>{content}</span>);

    while (i < line.length) {
      const ch = line[i];

      // Whitespace
      if (ch === " " || ch === "\t") { push(ch, "transparent", i); i++; continue; }

      // String
      if (ch === '"') {
        let j = i + 1;
        while (j < line.length && !(line[j] === '"' && line[j - 1] !== "\\")) j++;
        const raw = line.slice(i, j + 1);
        // Peek after closing quote (skip spaces) to detect key
        let k = j + 1;
        while (k < line.length && line[k] === " ") k++;
        const isKey = line[k] === ":";
        push(raw, isKey ? C.key : C.str, i);
        i = j + 1;
        continue;
      }

      // Number
      if ((ch >= "0" && ch <= "9") || (ch === "-" && line[i + 1] >= "0" && line[i + 1] <= "9")) {
        let j = i; while (j < line.length && /[\d.eE+-]/.test(line[j])) j++;
        push(line.slice(i, j), C.num, i); i = j; continue;
      }

      // true / false / null
      if (line.slice(i, i + 4) === "true")  { push("true",  C.bool, i); i += 4; continue; }
      if (line.slice(i, i + 5) === "false") { push("false", C.bool, i); i += 5; continue; }
      if (line.slice(i, i + 4) === "null")  { push("null",  C.null, i); i += 4; continue; }

      // Punctuation
      push(ch, C.punct, i); i++;
    }

    return (
      <div key={li} className="flex">
        <span className="select-none w-8 text-right mr-3 shrink-0 text-[10px] pt-px" style={{ color: C.ln }}>
          {li + 1}
        </span>
        <span>{tokens.length ? tokens : <span>&nbsp;</span>}</span>
      </div>
    );
  });
}

// ── Tree node ─────────────────────────────────────────────────────────────────
function TreeNode({ k, v, depth }: { k: string | null; v: unknown; depth: number }) {
  const [open, setOpen] = useState(depth < 2);

  const isObj  = v !== null && typeof v === "object" && !Array.isArray(v);
  const isArr  = Array.isArray(v);
  const isLeaf = !isObj && !isArr;

  const label = k !== null ? (
    <span style={{ color: C.key }}>"{k}"</span>
  ) : null;

  const colon = k !== null ? <span style={{ color: C.punct }}>: </span> : null;

  const leafColor = v === null ? C.null : typeof v === "boolean" ? C.bool : typeof v === "number" ? C.num : C.str;
  const leafVal   = v === null ? "null" : typeof v === "string" ? `"${v}"` : String(v);

  if (isLeaf) {
    return (
      <div className="flex items-start leading-5" style={{ paddingLeft: depth * 16 }}>
        <span className="text-[11px] font-mono">
          {label}{colon}<span style={{ color: leafColor }}>{leafVal}</span>
        </span>
      </div>
    );
  }

  const entries = isObj
    ? Object.entries(v as Record<string, unknown>)
    : (v as unknown[]).map((item, i) => [String(i), item] as [string, unknown]);

  const bracket = isArr ? ["[", "]"] : ["{", "}"];

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-0.5 text-[11px] font-mono text-white/80 hover:text-white transition-colors w-full text-left leading-5">
        {open ? <ChevronDown size={11} className="shrink-0" style={{ color: C.punct }} />
               : <ChevronRight size={11} className="shrink-0" style={{ color: C.punct }} />}
        {label}{colon}
        <span style={{ color: C.punct }}>{bracket[0]}</span>
        {!open && (
          <span className="text-[10px] ml-1" style={{ color: C.punct }}>
            {entries.length} {isArr ? "item" : "key"}{entries.length !== 1 ? "s" : ""} …{bracket[1]}
          </span>
        )}
      </button>
      {open && (
        <>
          {entries.map(([ek, ev]) => (
            <TreeNode key={ek} k={isArr ? null : ek} v={ev} depth={depth + 1} />
          ))}
          <div className="text-[11px] font-mono" style={{ paddingLeft: 14, color: C.punct }}>{bracket[1]}</div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function JsonFmt() {
  const [input,    setInput]    = useState(SAMPLE);
  const [mode,     setMode]     = useState<ViewMode>("format");
  const [sortKeys, setSortKeys] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [indent,   setIndent]   = useState(2);

  const parsed = useMemo(() => {
    try { return { ok: true, value: JSON.parse(input) as unknown, error: null }; }
    catch (e) { return { ok: false, value: null, error: e as SyntaxError }; }
  }, [input]);

  const sortObj = useCallback((v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sortObj);
    if (v !== null && typeof v === "object") {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, val]) => [k, sortObj(val)]));
    }
    return v;
  }, []);

  const output = useMemo(() => {
    if (!parsed.ok) return `// SyntaxError: ${parsed.error?.message}`;
    const val = sortKeys ? sortObj(parsed.value) : parsed.value;
    try {
      return mode === "minify"
        ? JSON.stringify(val)
        : JSON.stringify(val, null, indent);
    } catch { return "// Serialization error"; }
  }, [parsed, mode, sortKeys, sortObj, indent]);

  const copy = async () => {
    await navigator.clipboard?.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const MODES: [ViewMode, string][] = [["format","Format"],["minify","Minify"],["tree","Tree"],["validate","Validate"]];

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0a0e", color: "white" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] shrink-0 flex-wrap">
        {MODES.map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${mode === m ? "text-white bg-[#9b59b6]" : "text-white/40 hover:text-white/70 hover:bg-white/6"}`}>
            {label}
          </button>
        ))}
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <button onClick={() => setSortKeys((p) => !p)}
          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${sortKeys ? "text-[#a855f7] bg-purple-500/10" : "text-white/35 hover:text-white/60"}`}>
          Sort keys
        </button>
        {mode === "format" && (
          <select value={indent} onChange={(e) => setIndent(+e.target.value)}
            className="text-[11px] px-1.5 py-1 rounded-lg outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
            {[2, 4].map((n) => <option key={n} value={n}>{n}-space</option>)}
          </select>
        )}
        <button onClick={copy}
          className="ml-auto flex items-center gap-1 text-[11px] transition-all px-2.5 py-1 rounded-lg"
          style={{ color: copied ? "#4ade80" : "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)" }}>
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input */}
        <div className="flex-1 flex flex-col border-r border-white/[0.06]">
          <p className="text-[9px] text-white/25 px-3 pt-2 pb-1 uppercase tracking-widest shrink-0">Input</p>
          <textarea
            className="flex-1 bg-transparent px-3 pb-2 text-[11px] font-mono text-white/70 outline-none resize-none os-scrollbar placeholder-white/15"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false} />
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <p className="text-[9px] text-white/25 px-3 pt-2 pb-1 uppercase tracking-widest shrink-0">
            {mode === "validate" ? "Validation" : mode === "tree" ? "Tree" : "Output"}
          </p>

          {mode === "validate" ? (
            <div className="flex-1 p-3 overflow-y-auto os-scrollbar">
              {parsed.ok ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
                    <Check size={14} className="text-green-400 shrink-0" />
                    <span className="text-[12px] text-green-400 font-medium">Valid JSON</span>
                  </div>
                  {[
                    ["Type",  Array.isArray(parsed.value) ? "Array" : parsed.value !== null && typeof parsed.value === "object" ? "Object" : typeof parsed.value],
                    ["Keys",  parsed.value !== null && typeof parsed.value === "object" && !Array.isArray(parsed.value) ? String(Object.keys(parsed.value as object).length) : "—"],
                    ["Size",  `${new TextEncoder().encode(input).length} bytes`],
                    ["Depth", String((() => { const d = (v: unknown, n=0): number => v !== null && typeof v==="object" ? Math.max(...(Array.isArray(v)?v:Object.values(v as object)).map(c=>d(c,n+1)))  : n; return d(parsed.value); })())],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between px-3 py-1.5 rounded-lg text-[12px]"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="text-white/40">{k}</span>
                      <span className="font-mono" style={{ color: "#a855f7" }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                    <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[12px] text-red-400 font-medium">Invalid JSON</p>
                      <p className="text-[11px] text-red-300/70 mt-0.5">{parsed.error?.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : mode === "tree" ? (
            <div className="flex-1 overflow-y-auto os-scrollbar p-3">
              {parsed.ok
                ? <TreeNode k={null} v={parsed.value} depth={0} />
                : <p className="text-[11px] text-red-400">{parsed.error?.message}</p>}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto os-scrollbar px-3 pb-3">
              <div className="font-mono text-[11px] leading-5">
                {parsed.ok
                  ? highlightJson(output)
                  : <span className="text-red-400">{output}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
