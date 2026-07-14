import { useState, useEffect, useCallback } from "react";
import { Delete, RotateCcw } from "lucide-react";

type Mode = "basic" | "sci";

const ACCENTS: Record<string, string> = {
  "÷": "#7c3aed", "×": "#7c3aed", "−": "#7c3aed", "+": "#7c3aed",
  "=": "#9b59b6",
  "sin": "#2563eb", "cos": "#2563eb", "tan": "#2563eb",
  "log": "#0891b2", "ln": "#0891b2", "√": "#0891b2",
  "π": "#065f46",  "e": "#065f46",
  "x²": "#6d28d9", "xⁿ": "#6d28d9", "1/x": "#6d28d9",
  "C": "#991b1b",  "⌫": "#7f1d1d",
};

const BASIC_ROWS = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

const SCI_ROWS = [
  ["sin", "cos", "tan", "C",  "⌫"],
  ["log", "ln",  "√",   "%",  "÷"],
  ["π",   "e",   "7",   "8",  "9",  "×"],
  ["x²",  "xⁿ", "4",   "5",  "6",  "−"],
  ["1/x", "(",   "1",   "2",  "3",  "+"],
  ["[",   "]",   "±",   "0",  ".",  "="],
];

function evaluate(expr: string): string {
  try {
    const e = expr
      .replace(/÷/g,  "/")
      .replace(/×/g,  "*")
      .replace(/−/g,  "-")
      .replace(/π/g,  String(Math.PI))
      .replace(/e(?![0-9])/g, String(Math.E))
      .replace(/√\(([^)]+)\)/g, (_, n) => String(Math.sqrt(parseFloat(n))))
      .replace(/sin\(([^)]+)\)/g, (_, n) => String(Math.sin(parseFloat(n) * Math.PI / 180)))
      .replace(/cos\(([^)]+)\)/g, (_, n) => String(Math.cos(parseFloat(n) * Math.PI / 180)))
      .replace(/tan\(([^)]+)\)/g, (_, n) => String(Math.tan(parseFloat(n) * Math.PI / 180)))
      .replace(/log\(([^)]+)\)/g, (_, n) => String(Math.log10(parseFloat(n))))
      .replace(/ln\(([^)]+)\)/g,  (_, n) => String(Math.log(parseFloat(n))));
    const result = new Function("return " + e)();
    if (typeof result !== "number" || !isFinite(result)) return "Error";
    return String(Number(result.toFixed(10)));
  } catch {
    return "Error";
  }
}

export default function Calculator() {
  const [expr,     setExpr]     = useState("");
  const [display,  setDisplay]  = useState("0");
  const [history,  setHistory]  = useState<string[]>([]);
  const [mode,     setMode]     = useState<Mode>("basic");
  const [justCalc, setJustCalc] = useState(false);

  const append = useCallback((token: string) => {
    setExpr((prev) => {
      if (justCalc && /^[0-9π]$/.test(token)) {
        setJustCalc(false); setDisplay(token); return token;
      }
      setJustCalc(false);
      const next = prev + token;
      setDisplay(next || "0");
      return next;
    });
  }, [justCalc]);

  const press = useCallback((btn: string) => {
    switch (btn) {
      case "C":   setExpr(""); setDisplay("0"); setJustCalc(false); break;
      case "⌫":  setExpr((p) => { const n = p.slice(0, -1); setDisplay(n || "0"); return n; }); break;
      case "=": {
        if (!expr) break;
        const result = evaluate(expr);
        setHistory((h) => [`${expr} = ${result}`, ...h.slice(0, 9)]);
        setDisplay(result);
        setExpr(result === "Error" ? "" : result);
        setJustCalc(true);
        break;
      }
      case "±":  setExpr((p) => { const n = p.startsWith("-") ? p.slice(1) : "-" + p; setDisplay(n || "0"); return n; }); break;
      case "%":  setExpr((p) => { const r = String(parseFloat(evaluate(p)) / 100); setDisplay(r); return r; }); break;
      case "sin": case "cos": case "tan": case "log": case "ln": case "√":
        append(btn + "("); break;
      case "x²": setExpr((p) => { const r = evaluate(`(${p})*(${p})`); setDisplay(r); return r; }); break;
      case "xⁿ": append("**"); break;
      case "1/x": setExpr((p) => { const r = evaluate(`1/(${p})`); setDisplay(r); return r; }); break;
      default:   append(btn);
    }
  }, [expr, append]);

  // Keyboard support
  useEffect(() => {
    const MAP: Record<string, string> = {
      Enter: "=", Escape: "C", Backspace: "⌫",
      "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%", ".": ".", "(": "(", ")": ")",
    };
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const t = MAP[e.key] ?? (e.key.match(/^[0-9]$/) ? e.key : null);
      if (t) { e.preventDefault(); press(t); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [press]);

  const rows = mode === "sci" ? SCI_ROWS : BASIC_ROWS;
  const fontSize = display.length > 12 ? "18px" : display.length > 8 ? "24px" : "32px";

  return (
    <div className="h-full flex flex-col" style={{ background: "#0f0f0f" }}>
      {/* Mode toggle */}
      <div className="flex gap-1 px-3 pt-3 pb-2">
        {(["basic","sci"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`text-[11px] px-3 py-1 rounded-full transition-all ${mode === m ? "bg-[#9b59b6] text-white" : "text-white/35 hover:text-white/60"}`}>
            {m === "sci" ? "Scientific" : "Basic"}
          </button>
        ))}
      </div>

      {/* Display */}
      <div className="px-4 pb-3 flex flex-col items-end border-b border-white/[0.06]">
        {history[0] && (
          <p className="text-[10px] text-white/20 truncate max-w-full mb-0.5">{history[0]}</p>
        )}
        {expr && expr !== display && (
          <p className="text-[12px] text-white/40 truncate max-w-full mb-0.5">{expr}</p>
        )}
        <p className="text-white font-light tabular-nums truncate max-w-full" style={{ fontSize }}>
          {display}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex-1 grid gap-1 p-2" style={{ gridTemplateRows: `repeat(${rows.length}, 1fr)` }}>
        {rows.map((row, ri) => (
          <div key={ri} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
            {row.map((btn) => {
              const ac = ACCENTS[btn];
              return (
                <button key={btn} onClick={() => press(btn)}
                  className="rounded-xl font-medium text-[14px] transition-all active:scale-95 flex items-center justify-center h-full select-none"
                  style={{
                    color: "white",
                    background: ac
                      ? (btn === "=" ? `linear-gradient(135deg, ${ac}, #7c3aed)` : `${ac}2e`)
                      : "rgba(255,255,255,0.06)",
                    border: `1px solid ${ac ? ac + "44" : "rgba(255,255,255,0.07)"}`,
                    boxShadow: btn === "=" ? `0 4px 16px ${ac}44` : "none",
                    opacity: ac && btn !== "=" ? 0.85 : 1,
                  }}
                >
                  {btn === "⌫" ? <Delete size={15} /> : btn === "C" ? <RotateCcw size={13} /> : btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
