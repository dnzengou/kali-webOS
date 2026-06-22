import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw } from "lucide-react";

const SIZE = 4;

// Gradient pairs [from, to] per tile value
const TILE_STYLE: Record<number, { bg: string; color: string; shadow?: string }> = {
  0:    { bg: "rgba(255,255,255,0.04)", color: "transparent" },
  2:    { bg: "rgba(255,255,255,0.08)", color: "#e2e8f0" },
  4:    { bg: "rgba(168,85,247,0.15)",  color: "#c084fc" },
  8:    { bg: "rgba(124,58,237,0.3)",   color: "#a78bfa", shadow: "0 0 12px rgba(124,58,237,0.4)" },
  16:   { bg: "rgba(59,130,246,0.3)",   color: "#93c5fd", shadow: "0 0 12px rgba(59,130,246,0.4)" },
  32:   { bg: "rgba(16,185,129,0.3)",   color: "#6ee7b7", shadow: "0 0 12px rgba(16,185,129,0.4)" },
  64:   { bg: "rgba(245,158,11,0.35)",  color: "#fcd34d", shadow: "0 0 14px rgba(245,158,11,0.45)" },
  128:  { bg: "rgba(239,68,68,0.35)",   color: "#fca5a5", shadow: "0 0 16px rgba(239,68,68,0.5)"  },
  256:  { bg: "rgba(236,72,153,0.4)",   color: "#f9a8d4", shadow: "0 0 18px rgba(236,72,153,0.5)" },
  512:  { bg: "rgba(168,85,247,0.5)",   color: "#e9d5ff", shadow: "0 0 20px rgba(168,85,247,0.6)" },
  1024: { bg: "rgba(250,204,21,0.45)",  color: "#fef08a", shadow: "0 0 24px rgba(250,204,21,0.6)" },
  2048: { bg: "linear-gradient(135deg,#a855f7,#7c3aed,#ec4899)", color: "#ffffff", shadow: "0 0 32px rgba(168,85,247,0.8)" },
};

function tileStyle(v: number) {
  return TILE_STYLE[v] ?? { bg: "rgba(255,255,255,0.6)", color: "white", shadow: "0 0 20px white" };
}

type Board = number[][];

function empty(): Board { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }

function addTile(b: Board): Board {
  const cells: [number, number][] = [];
  b.forEach((row, y) => row.forEach((v, x) => { if (!v) cells.push([y, x]); }));
  if (!cells.length) return b;
  const [y, x] = cells[Math.floor(Math.random() * cells.length)];
  const nb = b.map((r) => [...r]);
  nb[y][x] = Math.random() < 0.9 ? 2 : 4;
  return nb;
}

function slideRow(row: number[]): [number[], number] {
  const vals = row.filter(Boolean);
  let score = 0;
  for (let i = 0; i < vals.length - 1; i++) {
    if (vals[i] === vals[i + 1]) {
      vals[i] *= 2; score += vals[i]; vals[i + 1] = 0;
    }
  }
  const merged = vals.filter(Boolean);
  return [[...merged, ...Array(SIZE - merged.length).fill(0)], score];
}

function moveBoard(b: Board, dx: number, dy: number): [Board, number] {
  const nb = b.map((r) => [...r]);
  let total = 0;

  if (dx !== 0) {
    for (let y = 0; y < SIZE; y++) {
      const row = dx > 0 ? [...nb[y]].reverse() : [...nb[y]];
      const [merged, s] = slideRow(row);
      nb[y] = dx > 0 ? merged.reverse() : merged;
      total += s;
    }
  } else {
    for (let x = 0; x < SIZE; x++) {
      const col = Array.from({ length: SIZE }, (_, y) => nb[y][x]);
      const oriented = dy > 0 ? [...col].reverse() : [...col];
      const [merged, s] = slideRow(oriented);
      const final = dy > 0 ? merged.reverse() : merged;
      for (let y = 0; y < SIZE; y++) nb[y][x] = final[y];
      total += s;
    }
  }
  return [nb, total];
}

function boardChanged(a: Board, b: Board) {
  return a.some((row, y) => row.some((v, x) => v !== b[y][x]));
}

function hasWon(b: Board) { return b.some((r) => r.some((v) => v === 2048)); }

function isGameOver(b: Board) {
  if (b.some((r) => r.some((v) => !v))) return false;
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      if (x < SIZE - 1 && b[y][x] === b[y][x + 1]) return false;
      if (y < SIZE - 1 && b[y][x] === b[y + 1][x]) return false;
    }
  return true;
}

function newGame(): Board { return addTile(addTile(empty())); }
function loadBest() { return parseInt(localStorage.getItem("2048-best") ?? "0"); }

export default function G2048() {
  const [board,   setBoard]   = useState<Board>(newGame);
  const [score,   setScore]   = useState(0);
  const [best,    setBest]    = useState(loadBest);
  const [over,    setOver]    = useState(false);
  const [won,     setWon]     = useState(false);
  const [cont,    setCont]    = useState(false); // "keep going" after 2048
  const touchRef  = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (score > best) { setBest(score); localStorage.setItem("2048-best", String(score)); }
  }, [score, best]);

  const move = useCallback((dx: number, dy: number) => {
    setBoard((b) => {
      const [nb, s] = moveBoard(b, dx, dy);
      if (!boardChanged(b, nb)) return b;
      const next = addTile(nb);
      setScore((sc) => sc + s);
      if (!cont && hasWon(next)) setWon(true);
      if (isGameOver(next)) setOver(true);
      return next;
    });
  }, [cont]);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (over || (won && !cont)) return;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        ArrowUp:   [0, -1], ArrowDown:  [0, 1],
        a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1],
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); move(dir[0], dir[1]); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move, over, won, cont]);

  const reset = () => { setBoard(newGame()); setScore(0); setOver(false); setWon(false); setCont(false); };

  const fontSize = (v: number) => v >= 1000 ? "14px" : v >= 100 ? "18px" : v >= 10 ? "22px" : "26px";

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-4"
      style={{ background: "#0a0a0e", color: "white" }}>

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[340px]">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Score</p>
          <p className="text-[24px] font-bold tabular-nums" style={{ color: "#a855f7" }}>{score}</p>
        </div>
        <div className="text-center">
          <p className="text-[22px] font-black tracking-tight" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2048</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Best</p>
          <p className="text-[24px] font-bold tabular-nums text-[#facc15]">{best}</p>
        </div>
      </div>

      {/* Board */}
      <div className="relative rounded-2xl p-2 select-none"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        onTouchStart={(e) => { const t = e.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY }; }}
        onTouchEnd={(e) => {
          if (!touchRef.current) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - touchRef.current.x;
          const dy = t.clientY - touchRef.current.y;
          touchRef.current = null;
          if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
          if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
          else                              move(0, dy > 0 ? 1 : -1);
        }}>

        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, 76px)`, gridTemplateRows: `repeat(${SIZE}, 76px)` }}>
          {board.map((row, y) =>
            row.map((v, x) => {
              const { bg, color, shadow } = tileStyle(v);
              return (
                <div key={`${y}-${x}`}
                  className="rounded-xl flex items-center justify-center font-black transition-all duration-100"
                  style={{
                    background: bg, color, boxShadow: shadow ?? "none",
                    fontSize: fontSize(v),
                    fontFamily: "Inter, sans-serif",
                  }}>
                  {v || ""}
                </div>
              );
            })
          )}
        </div>

        {/* Win overlay */}
        {won && !cont && (
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(0,0,0,0.75)" }}>
            <p className="text-[32px] font-black" style={{ background: "linear-gradient(135deg,#a855f7,#facc15,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>You Win! 🎉</p>
            <div className="flex gap-2">
              <button onClick={() => { setCont(true); setWon(false); }}
                className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#9b59b6,#7c3aed)" }}>
                Keep Going
              </button>
              <button onClick={reset}
                className="px-5 py-2 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                New Game
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {over && (
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(0,0,0,0.75)" }}>
            <p className="text-[28px] font-black text-white">Game Over</p>
            <p className="text-[14px] text-white/50">Score: {score}</p>
            <button onClick={reset}
              className="px-6 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#9b59b6,#7c3aed)" }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4">
        <button onClick={reset}
          className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors">
          <RotateCcw size={12} /> New Game
        </button>
        <p className="text-[11px] text-white/20">Arrow keys or swipe</p>
      </div>
    </div>
  );
}
