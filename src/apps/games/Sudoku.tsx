import { useState } from "react";

const PUZZLE = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9],
];

const SOLUTION = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9],
];

export default function Sudoku() {
  const [grid, setGrid] = useState(PUZZLE.map(r => [...r]));
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const isFixed = (r: number, c: number) => PUZZLE[r][c] !== 0;

  const setNum = (num: number) => {
    if (!sel) return;
    const [r, c] = sel;
    if (isFixed(r, c)) return;
    const ng = grid.map(row => [...row]);
    ng[r][c] = num;
    setGrid(ng);

    const ne = new Set(errors);
    if (num !== 0 && num !== SOLUTION[r][c]) { ne.add(`${r}-${c}`); } else { ne.delete(`${r}-${c}`); }
    setErrors(ne);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-3 text-[13px]">
      <div className="grid grid-cols-9 gap-0 border-2 border-[#3d3d3d] rounded-lg overflow-hidden mb-3">
        {grid.map((row, r) => row.map((cell, c) => (
          <button key={`${r}-${c}`} className={`w-[36px] h-[36px] text-[14px] font-medium flex items-center justify-center border border-[#3d3d3d]/50
            ${sel && sel[0] === r && sel[1] === c ? "bg-[#9b59b6]/30" : (r + c) % 2 === 0 ? "bg-[#2d2d2d]" : "bg-[#1a1a1a]"}
            ${isFixed(r, c) ? "text-white font-bold" : cell ? (errors.has(`${r}-${c}`) ? "text-[#e74c3c]" : "text-[#2ecc71]") : ""}
            ${r % 3 === 2 && r !== 8 ? "border-b border-b-[#666]" : ""}
            ${c % 3 === 2 && c !== 8 ? "border-r border-r-[#666]" : ""}
          `} onClick={() => setSel([r, c])}>
            {cell || ""}
          </button>
        )))}
      </div>
      <div className="grid grid-cols-5 gap-1 mb-2">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className="w-10 h-10 bg-[#2d2d2d] text-white rounded-lg text-[14px] hover:bg-[#3d3d3d]" onClick={() => setNum(n)}>{n}</button>
        ))}
      </div>
      <button className="bg-[#3d3d3d] text-white px-3 py-1 rounded text-[11px]" onClick={() => { setGrid(PUZZLE.map(r => [...r])); setErrors(new Set()); }}>Reset</button>
    </div>
  );
}
