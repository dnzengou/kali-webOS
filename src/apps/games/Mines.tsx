import { useState } from "react";
const W = 10; const H = 10; const MINES = 10;
function createBoard() {
  const b = Array(H).fill(null).map(() => Array(W).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, adjacent: 0 })));
  let placed = 0;
  while (placed < MINES) { const x = Math.floor(Math.random() * W); const y = Math.floor(Math.random() * H); if (!b[y][x].mine) { b[y][x].mine = true; placed++; } }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (b[y][x].mine) continue; let count = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const ny = y + dy, nx = x + dx; if (ny >= 0 && ny < H && nx >= 0 && nx < W && b[ny][nx].mine) count++; } b[y][x].adjacent = count; }
  return b;
}
export default function Mines() {
  const [board, setBoard] = useState(createBoard);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(MINES);
  const reveal = (x: number, y: number) => {
    if (over || board[y][x].revealed || board[y][x].flagged) return;
    const nb = board.map(r => r.map(c => ({ ...c })));
    const queue = [[x, y]];
    while (queue.length) {
      const [cx, cy] = queue.shift()!;
      if (nb[cy][cx].revealed) continue;
      nb[cy][cx].revealed = true;
      if (nb[cy][cx].mine) { setOver(true); setBoard(nb); return; }
      if (nb[cy][cx].adjacent === 0) {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < W && ny >= 0 && ny < H && !nb[ny][nx].revealed && !nb[ny][nx].mine) queue.push([nx, ny]);
        }
      }
    }
    setBoard(nb);
    if (nb.every(r => r.every(c => c.mine || c.revealed))) setWon(true);
  };
  const flag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (over || board[y][x].revealed) return;
    const nb = board.map(r => r.map(c => ({ ...c })));
    nb[y][x].flagged = !nb[y][x].flagged;
    setBoard(nb);
    setFlags(f => nb[y][x].flagged ? f - 1 : f + 1);
  };
  const reset = () => { setBoard(createBoard()); setOver(false); setWon(false); setFlags(MINES); };
  return (
    <div className="h-full flex flex-col items-center justify-center p-2 text-[13px]">
      <div className="flex justify-between w-[300px] mb-2"><span className="text-white/80">💣 {flags}</span><span className="text-white/40">{won ? "You Win!" : over ? "Game Over" : ""}</span></div>
      <div className="bg-[#2d2d2d] rounded-lg p-1">
        {board.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <button key={x} className={`w-[28px] h-[28px] m-[1px] rounded text-[11px] font-bold flex items-center justify-center ${cell.revealed ? (cell.mine ? "bg-[#e74c3c]" : "bg-[#1a1a1a] text-white/60") : "bg-[#3d3d3d] hover:bg-[#4d4d4d]"}`}
                style={{ color: cell.adjacent === 1 ? "#3498db" : cell.adjacent === 2 ? "#2ecc71" : cell.adjacent === 3 ? "#e74c3c" : "#f39c12" }}
                onClick={() => reveal(x, y)} onContextMenu={(e) => flag(e, x, y)}>
                {cell.revealed ? (cell.mine ? "💣" : cell.adjacent || "") : cell.flagged ? "🚩" : ""}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button className="mt-2 bg-[#3d3d3d] text-white px-3 py-1 rounded text-[12px]" onClick={reset}>New Game</button>
    </div>
  );
}
