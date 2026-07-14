import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";

const MATCH_COLORS = ["#a855f7","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899"];

const PRESETS: { label: string; pattern: string; flags: string }[] = [
  { label: "Integer",      pattern: "-?\\d+",                                    flags: "g"  },
  { label: "Float",        pattern: "-?\\d+\\.\\d+",                             flags: "g"  },
  { label: "Email",        pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.]+",               flags: "gi" },
  { label: "URL",          pattern: "https?://[\\w/:%#$&?()~.=+-]+",             flags: "g"  },
  { label: "IPv4",         pattern: "\\b(\\d{1,3}\\.){3}\\d{1,3}\\b",           flags: "g"  },
  { label: "IPv6",         pattern: "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}",  flags: "gi" },
  { label: "Hex color",    pattern: "#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b",     flags: "gi" },
  { label: "Date YYYY-MM", pattern: "\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])", flags: "g" },
  { label: "Word",         pattern: "\\b[a-zA-Z]+\\b",                           flags: "g"  },
  { label: "Whitespace",   pattern: "\\s+",                                      flags: "g"  },
  { label: "HTML tag",     pattern: "<[^>]+>",                                   flags: "g"  },
  { label: "JWT",          pattern: "[A-Za-z0-9_-]{2,}\\.([A-Za-z0-9_-]{2,}\\.){1}[A-Za-z0-9_-]{2,}", flags: "g" },
];

const DEFAULT_TEXT = `User: alice@example.com logged in from 192.168.1.42 at 2024-05-15.
Profile: https://kali-os.local/users/alice?tab=profile
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
Colors: #fff #1a2b3c #abc123  Numbers: -42 3.14 100`;

type FlagKey = "g" | "i" | "m" | "s";
const FLAG_OPTS: { key: FlagKey; desc: string }[] = [
  { key: "g", desc: "Global"      },
  { key: "i", desc: "Insensitive" },
  { key: "m", desc: "Multiline"   },
  { key: "s", desc: "Dotall"      },
];

interface MatchResult {
  match:  string;
  index:  number;
  groups: (string | undefined)[];
}

export default function Regex() {
  const [pattern, setPattern] = useState("[\\w.+-]+@[\\w-]+\\.[\\w.]+");
  const [flags,   setFlags]   = useState<Set<FlagKey>>(new Set(["g", "i"]));
  const [text,    setText]    = useState(DEFAULT_TEXT);
  const [copied,  setCopied]  = useState<number | null>(null);

  const flagStr = [...flags].join("");

  const { matches, error } = useMemo<{ matches: MatchResult[]; error: string | null }>(() => {
    if (!pattern) return { matches: [], error: null };
    try {
      const re = new RegExp(pattern, flagStr);
      const results: MatchResult[] = [];
      if (flags.has("g")) {
        let m: RegExpExecArray | null;
        re.lastIndex = 0;
        while ((m = re.exec(text)) !== null) {
          results.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m[0].length === 0) re.lastIndex++; // avoid infinite loop on zero-width
        }
      } else {
        const m = re.exec(text);
        if (m) results.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      return { matches: results, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flagStr, text, flags]);

  // Build highlighted spans from match positions
  const highlighted = useMemo(() => {
    if (!matches.length || error) return null;
    const parts: React.JSX.Element[] = [];
    let pos = 0;
    matches.forEach((m, i) => {
      if (m.index > pos) parts.push(<span key={`t${i}`}>{text.slice(pos, m.index)}</span>);
      const color = MATCH_COLORS[i % MATCH_COLORS.length];
      parts.push(
        <mark key={`m${i}`} style={{ background: `${color}33`, color, borderRadius: 3, padding: "0 1px", outline: `1px solid ${color}55` }}>
          {m.match}
        </mark>
      );
      pos = m.index + m.match.length;
    });
    if (pos < text.length) parts.push(<span key="tail">{text.slice(pos)}</span>);
    return parts;
  }, [matches, text, error]);

  const toggleFlag = (f: FlagKey) =>
    setFlags((prev) => { const next = new Set(prev); next.has(f) ? next.delete(f) : next.add(f); return next; });

  const copy = async (s: string, idx: number) => {
    await navigator.clipboard?.writeText(s);
    setCopied(idx); setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0a0e", color: "white" }}>

      {/* Pattern bar */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[16px] text-white/30">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          placeholder="pattern…"
          className="flex-1 bg-transparent font-mono text-[13px] text-white outline-none placeholder-white/20"
          style={{ color: error ? "#f87171" : "white" }} />
        <span className="font-mono text-[16px] text-white/30">/</span>
        <span className="font-mono text-[13px] w-8 text-center" style={{ color: "#a855f7" }}>{flagStr || "—"}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-1.5 text-[11px] text-red-400 shrink-0" style={{ background: "rgba(248,113,113,0.07)" }}>
          SyntaxError: {error}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Flags row */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] shrink-0">
          <span className="text-[10px] text-white/30 uppercase tracking-widest mr-1">Flags</span>
          {FLAG_OPTS.map(({ key, desc }) => (
            <button key={key} onClick={() => toggleFlag(key)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] transition-all"
              style={{
                background: flags.has(key) ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${flags.has(key) ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.07)"}`,
                color: flags.has(key) ? "#c084fc" : "rgba(255,255,255,0.3)",
              }}>
              <span className="font-mono">{key}</span>
              <span className="hidden sm:inline text-white/30">{desc}</span>
            </button>
          ))}
          <span className="ml-auto text-[10px] font-medium" style={{ color: error ? "#f87171" : matches.length ? "#a855f7" : "rgba(255,255,255,0.2)" }}>
            {error ? "error" : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
          </span>
        </div>

        {/* Presets */}
        <div className="flex gap-1 px-3 py-1.5 border-b border-white/[0.04] overflow-x-auto shrink-0">
          {PRESETS.map((p) => (
            <button key={p.label}
              onClick={() => { setPattern(p.pattern); setFlags(new Set(p.flags.split("") as FlagKey[])); }}
              className="shrink-0 px-2 py-0.5 rounded-full text-[10px] text-white/35 hover:text-white/70 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Test string + highlight */}
        <div className="flex flex-col border-b border-white/[0.04] shrink-0">
          <p className="text-[9px] text-white/25 px-3 pt-2 pb-1 uppercase tracking-widest">Test string</p>
          <textarea
            className="px-3 pb-2 bg-transparent text-[12px] font-mono text-white/70 outline-none resize-none placeholder-white/15 os-scrollbar"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            placeholder="Paste text to test…" />

          {/* Highlighted preview */}
          {highlighted && (
            <>
              <div className="mx-3 mb-2 h-px bg-white/[0.05]" />
              <div className="px-3 pb-2 text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                {highlighted}
              </div>
            </>
          )}
        </div>

        {/* Match table */}
        <div className="flex-1 overflow-y-auto os-scrollbar">
          {matches.length === 0 && !error && (
            <p className="text-[12px] text-white/20 text-center mt-6">No matches</p>
          )}
          {matches.length > 0 && (
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-white/25 text-[9px] uppercase tracking-wider"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-3 py-1.5 w-10">#</th>
                  <th className="text-left px-2 py-1.5 w-16">Index</th>
                  <th className="text-left px-2 py-1.5">Match</th>
                  <th className="text-left px-2 py-1.5">Groups</th>
                  <th className="px-2 py-1.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => {
                  const color = MATCH_COLORS[i % MATCH_COLORS.length];
                  return (
                    <tr key={i} className="group transition-all"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: i % 2 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                      <td className="px-3 py-1.5">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                          style={{ background: `${color}22`, color }}>{i + 1}</span>
                      </td>
                      <td className="px-2 py-1.5 text-white/35">{m.index}</td>
                      <td className="px-2 py-1.5 max-w-[180px]">
                        <span className="truncate block" style={{ color }}>{m.match}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        {m.groups.filter(Boolean).length > 0
                          ? m.groups.map((g, gi) => (
                            <span key={gi} className="inline-block mr-1 px-1.5 py-0.5 rounded text-[9px]"
                              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}>
                              {g}
                            </span>
                          ))
                          : <span className="text-white/20">—</span>}
                      </td>
                      <td className="px-2 py-1.5">
                        <button onClick={() => copy(m.match, i)}
                          className="opacity-0 group-hover:opacity-100 transition-all text-white/25 hover:text-[#a855f7]">
                          {copied === i ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
