import { useState } from "react";

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });

  const winner = (b: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, c, d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    return b.every(Boolean) ? "D" : null;
  };

  const w = winner(board);

  const click = (i: number) => {
    if (board[i] || w) return;
    const nb = [...board];
    nb[i] = xTurn ? "X" : "O";
    setBoard(nb);
    setXTurn(!xTurn);
    const nw = winner(nb);
    if (nw === "X") setScores(s => ({ ...s, X: s.X + 1 }));
    else if (nw === "O") setScores(s => ({ ...s, O: s.O + 1 }));
    else if (nw === "D") setScores(s => ({ ...s, D: s.D + 1 }));
  };

  const reset = () => { setBoard(Array(9).fill(null)); setXTurn(true); };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-[13px]">
      <div className="flex gap-4 mb-3 text-[11px]">
        <span className="text-[#9b59b6]">X: {scores.X}</span>
        <span className="text-[#3498db]">O: {scores.O}</span>
        <span className="text-white/40">Draw: {scores.D}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 mb-3">
        {board.map((cell, i) => (
          <button key={i} className="w-20 h-20 bg-[#2d2d2d] rounded-lg text-[28px] font-bold flex items-center justify-center hover:bg-[#3d3d3d] transition-colors" style={{ color: cell === "X" ? "#9b59b6" : "#3498db" }} onClick={() => click(i)}>
            {cell}
          </button>
        ))}
      </div>
      {w && <div className="text-white/80 mb-2">{w === "D" ? "Draw!" : `${w} Wins!`}</div>}
      <button className="bg-[#9b59b6] text-white px-4 py-1.5 rounded-lg text-[12px]" onClick={reset}>New Game</button>
    </div>
  );
}
