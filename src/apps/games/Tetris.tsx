import { useState, useEffect, useCallback } from "react";
const W = 10; const H = 20;
const SHAPES = [[[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,1,1],[1,0,0]],[[1,1,1],[0,0,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
const COLORS = ["#3498db","#f39c12","#9b59b6","#2ecc71","#e74c3c","#1abc9c","#e67e22"];
export default function Tetris() {
  const [board, setBoard] = useState(() => Array(H).fill(null).map(() => Array(W).fill(0)));
  const [piece, setPiece] = useState({ shape: SHAPES[0], x: 3, y: 0, color: COLORS[0] });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const place = useCallback(() => {
    setBoard(b => {
      const nb = b.map(r => [...r]);
      piece.shape.forEach((row, dy) => row.forEach((cell, dx) => { if (cell && piece.y + dy >= 0) nb[piece.y + dy][piece.x + dx] = piece.color; }));
      let lines = 0;
      for (let y = H - 1; y >= 0; y--) { if (nb[y].every(c => c !== 0)) { nb.splice(y, 1); nb.unshift(Array(W).fill(0)); lines++; y++; } }
      if (lines > 0) setScore(s => s + lines * 100);
      return nb;
    });
    const idx = Math.floor(Math.random() * SHAPES.length);
    setPiece({ shape: SHAPES[idx], x: 3, y: 0, color: COLORS[idx] });
  }, [piece]);
  useEffect(() => {
    if (!running || over) return;
    const t = setInterval(() => {
      setPiece(p => {
        const next = { ...p, y: p.y + 1 };
        if (p.y + p.shape.length >= H || p.shape.some((row, dy) => row.some((cell, dx) => cell && board[p.y + dy + 1]?.[p.x + dx]))) { place(); return p; }
        return next;
      });
    }, 500);
    return () => clearInterval(t);
  }, [running, over, board, place]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!running) return;
      if (e.key === "ArrowLeft") setPiece(p => ({ ...p, x: Math.max(0, p.x - 1) }));
      if (e.key === "ArrowRight") setPiece(p => ({ ...p, x: Math.min(W - p.shape[0].length, p.x + 1) }));
      if (e.key === "ArrowDown") setPiece(p => ({ ...p, y: p.y + 1 }));
      if (e.key === "ArrowUp") setPiece(p => ({ ...p, shape: p.shape[0].map((_, i) => p.shape.map(r => r[i]).reverse()) }));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [running]);
  const display = board.map(r => [...r]);
  piece.shape.forEach((row, dy) => row.forEach((cell, dx) => { if (cell && piece.y + dy >= 0) display[piece.y + dy][piece.x + dx] = piece.color; }));
  const reset = () => { setBoard(Array(H).fill(null).map(() => Array(W).fill(0))); setScore(0); setOver(false); setRunning(true); };
  return (
    <div className="h-full flex flex-col items-center p-2 text-[13px]">
      <div className="text-white/80 mb-1">{score}</div>
      <div className="bg-[#0c0c0c] rounded-lg p-1">
        {display.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => <div key={x} className="w-[18px] h-[18px] border border-[#1a1a1a]" style={{ background: cell || "#0c0c0c" }} />)}
          </div>
        ))}
      </div>
      {!running && !over && <button className="mt-2 bg-[#9b59b6] text-white px-3 py-1 rounded text-[12px]" onClick={() => setRunning(true)}>Start</button>}
      {over && <div className="mt-2 text-center"><div className="text-[#e74c3c] text-[12px]">Game Over</div><button className="bg-[#9b59b6] text-white px-3 py-1 rounded text-[12px]" onClick={reset}>Restart</button></div>}
    </div>
  );
}
