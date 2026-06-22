import { useState, useEffect, useCallback, useRef } from "react";

const CELL = 22;
const COLS = 24;
const ROWS = 18;
const W = COLS * CELL;
const H = ROWS * CELL;

type Pt = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const SPEEDS = [180, 150, 120, 100, 85, 70]; // ms per tick, by level
const SNAKE_COLORS = ["#9b59b6", "#a855f7", "#c084fc"];
const FOOD_COLORS  = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];

function randFood(snake: Pt[]): Pt {
  let p: Pt;
  do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export default function Snake() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef({
    snake:   [{ x: 12, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 9 }] as Pt[],
    dir:     { x: 1, y: 0 } as Pt,
    nextDir: { x: 1, y: 0 } as Pt,
    food:    { x: 18, y: 9 } as Pt,
    score:   0,
    level:   0,
    foodCount: 0,
    running: false,
    gameOver: false,
    particles: [] as Particle[],
    foodColor: FOOD_COLORS[0],
    animFrame: 0,
  });

  const [ui, setUi] = useState({ score: 0, level: 1, gameOver: false, running: false });
  const [hiScore, setHiScore] = useState(() => parseInt(localStorage.getItem("snake-hi") ?? "0"));
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const st  = stateRef.current;

    // Background grid
    ctx.fillStyle = "#0c0c0f";
    ctx.fillRect(0, 0, W, H);

    // Faint grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Particles
    ctx.save();
    st.particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.04;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    st.particles = st.particles.filter((p) => p.life > 0);
    ctx.restore();

    // Food — glowing circle
    const fx = st.food.x * CELL + CELL / 2;
    const fy = st.food.y * CELL + CELL / 2;
    const pulse = 0.7 + 0.3 * Math.sin(st.animFrame * 0.1);
    ctx.save();
    ctx.shadowBlur   = 18 * pulse;
    ctx.shadowColor  = st.foodColor;
    ctx.fillStyle    = st.foodColor;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL * 0.36 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Snake body
    st.snake.forEach((seg, i) => {
      const t = 1 - i / st.snake.length;
      const r = Math.round(CELL * 0.42);
      const sx = seg.x * CELL + 2, sy = seg.y * CELL + 2;
      const sw = CELL - 4,        sh = CELL - 4;

      // Gradient per segment
      const grad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
      grad.addColorStop(0, SNAKE_COLORS[0] + Math.round(t * 255).toString(16).padStart(2, "0"));
      grad.addColorStop(1, SNAKE_COLORS[2] + Math.round(t * 200).toString(16).padStart(2, "0"));

      ctx.save();
      if (i === 0) { ctx.shadowBlur = 10; ctx.shadowColor = SNAKE_COLORS[0]; }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, r);
      ctx.fill();
      ctx.restore();

      // Eyes on head
      if (i === 0) {
        const ex = seg.x * CELL + CELL / 2 + st.dir.x * 4;
        const ey = seg.y * CELL + CELL / 2 + st.dir.y * 4;
        const perp = { x: -st.dir.y, y: st.dir.x };
        [-4, 4].forEach((off) => {
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(ex + perp.x * off, ey + perp.y * off, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#1a1a2e";
          ctx.beginPath();
          ctx.arc(ex + perp.x * off + st.dir.x, ey + perp.y * off + st.dir.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });

    // Game over overlay
    if (st.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "white";
      ctx.font      = "bold 28px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 20);
      ctx.font      = "16px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText(`Score: ${st.score}`, W / 2, H / 2 + 10);
      ctx.fillText("Press Space / Enter to restart", W / 2, H / 2 + 36);
      ctx.textAlign = "left";
    }

    st.animFrame++;
  }, []);

  // ── Tick ────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const st = stateRef.current;
    if (!st.running) return;

    st.dir = st.nextDir;
    const head = { x: st.snake[0].x + st.dir.x, y: st.snake[0].y + st.dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      st.running  = false; st.gameOver = true;
      setUi({ score: st.score, level: st.level + 1, gameOver: true, running: false });
      if (st.score > hiScore) { setHiScore(st.score); localStorage.setItem("snake-hi", String(st.score)); }
      draw(); return;
    }
    // Self collision
    if (st.snake.some((s) => s.x === head.x && s.y === head.y)) {
      st.running = false; st.gameOver = true;
      setUi({ score: st.score, level: st.level + 1, gameOver: true, running: false });
      if (st.score > hiScore) { setHiScore(st.score); localStorage.setItem("snake-hi", String(st.score)); }
      draw(); return;
    }

    st.snake.unshift(head);

    // Food eaten
    if (head.x === st.food.x && head.y === st.food.y) {
      st.score     += 10 + st.level * 2;
      st.foodCount++;
      // Particles burst
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        st.particles.push({
          x: head.x * CELL + CELL / 2, y: head.y * CELL + CELL / 2,
          vx: Math.cos(angle) * (2 + Math.random() * 3),
          vy: Math.sin(angle) * (2 + Math.random() * 3),
          life: 1, color: st.foodColor,
        });
      }
      st.food      = randFood(st.snake);
      st.foodColor = FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)];
      // Level up every 5 foods
      if (st.foodCount % 5 === 0) st.level = Math.min(SPEEDS.length - 1, st.level + 1);
      setUi({ score: st.score, level: st.level + 1, gameOver: false, running: true });
    } else {
      st.snake.pop();
    }

    draw();
    tickRef.current = setTimeout(tick, SPEEDS[st.level]);
  }, [draw, hiScore]);

  const start = useCallback(() => {
    const st = stateRef.current;
    st.snake    = [{ x: 12, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 9 }];
    st.dir      = { x: 1, y: 0 };
    st.nextDir  = { x: 1, y: 0 };
    st.food     = randFood(st.snake);
    st.score    = 0; st.level = 0; st.foodCount = 0;
    st.running  = true; st.gameOver = false; st.particles = [];
    st.foodColor = FOOD_COLORS[0];
    setUi({ score: 0, level: 1, gameOver: false, running: true });
    if (tickRef.current) clearTimeout(tickRef.current);
    tickRef.current = setTimeout(tick, SPEEDS[0]);
  }, [tick]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const st = stateRef.current;
      const map: Record<string, Pt> = {
        ArrowUp:    { x: 0, y: -1 }, ArrowDown:  { x: 0, y: 1 },
        ArrowLeft:  { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      };
      const newDir = map[e.key];
      if (newDir) {
        e.preventDefault();
        // Prevent 180-degree reversal
        if (newDir.x !== -st.dir.x || newDir.y !== -st.dir.y) st.nextDir = newDir;
      }
      if ((e.key === " " || e.key === "Enter") && !st.running) { e.preventDefault(); start(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [start]);

  // Animation loop for particles
  useEffect(() => {
    let id: number;
    const loop = () => { draw(); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); if (tickRef.current) clearTimeout(tickRef.current); };
  }, [draw]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-3" style={{ background: "#0c0c0f" }}>
      {/* HUD */}
      <div className="flex items-center gap-6 text-[13px] w-full max-w-[528px]">
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Score</span>
          <span className="text-[20px] font-bold text-white tabular-nums">{ui.score}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Level</span>
          <span className="text-[20px] font-bold text-[#9b59b6] tabular-nums">{ui.level}</span>
        </div>
        <div className="flex flex-col items-start ml-auto">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Best</span>
          <span className="text-[20px] font-bold text-[#facc15] tabular-nums">{hiScore}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden" style={{ boxShadow: "0 0 40px rgba(155,89,182,0.2), 0 0 0 1px rgba(155,89,182,0.15)" }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: "block" }} />
      </div>

      {/* Start / status */}
      {!ui.running && !ui.gameOver && (
        <button
          onClick={start}
          className="px-8 py-2.5 rounded-xl font-semibold text-white text-[14px] transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #9b59b6, #7c3aed)", boxShadow: "0 4px 20px rgba(155,89,182,0.4)" }}
        >
          Start Game
        </button>
      )}
      {ui.running && (
        <p className="text-[11px] text-white/25">↑ ↓ ← → or WASD to steer</p>
      )}
    </div>
  );
}
