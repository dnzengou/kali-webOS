import { useState } from "react";

const PIECES: Record<string, string> = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
};

const INITIAL = [
  "rnbqkbnr".split(""),
  "pppppppp".split(""),
  Array(8).fill(""),
  Array(8).fill(""),
  Array(8).fill(""),
  Array(8).fill(""),
  "PPPPPPPP".split(""),
  "RNBQKBNR".split(""),
];

export default function Chess() {
  const [board, setBoard] = useState(INITIAL.map(r => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [moves, setMoves] = useState<string[]>([]);

  const click = (row: number, col: number) => {
    const piece = board[row][col];
    if (selected) {
      const [sr, sc] = selected;
      if (sr === row && sc === col) { setSelected(null); return; }
      const nb = board.map(r => [...r]);
      const moving = nb[sr][sc];
      const target = nb[row][col];
      if (moving && target && ((moving === moving.toUpperCase()) === (target === target.toUpperCase()))) { setSelected([row, col]); return; }
      nb[row][col] = moving;
      nb[sr][sc] = "";
      setBoard(nb);
      setSelected(null);
      setTurn(t => t === "white" ? "black" : "white");
      
      const notation = `${String.fromCharCode(97 + sc)}${8 - sr}-${String.fromCharCode(97 + col)}${8 - row}`;
      setMoves(m => [...m, notation]);
    } else if (piece) {
      const isWhite = piece === piece.toUpperCase();
      if ((turn === "white" && isWhite) || (turn === "black" && !isWhite)) {
        setSelected([row, col]);
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-2 text-[13px]">
      <div className="text-white/60 text-[11px] mb-1">{turn === "white" ? "White" : "Black"} to move</div>
      <div className="border-2 border-[#3d3d3d] rounded-lg overflow-hidden">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <button key={c} className={`w-[50px] h-[50px] text-[28px] flex items-center justify-center ${(r + c) % 2 === 0 ? "bg-[#eeeed2]" : "bg-[#769656]"} ${selected && selected[0] === r && selected[1] === c ? "ring-2 ring-[#9b59b6]" : ""}`} style={{ color: cell === cell.toUpperCase() ? "#fff" : "#000" }} onClick={() => click(r, c)}>
                {cell ? PIECES[cell] : ""}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-white/40 max-w-[200px] truncate">{moves.slice(-3).join(", ")}</div>
    </div>
  );
}
