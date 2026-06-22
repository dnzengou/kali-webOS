import { useRef, useEffect, useCallback, useState } from "react";

const W = 600, H = 380;
const PAD_W = 10, PAD_H = 64, BALL_R = 7, WIN_SCORE = 7;

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Diff = "Easy" | "Medium" | "Hard";

const CPU_SPEED: Record<Diff, number> = { Easy: 0.04, Medium: 0.09, Hard: 0.16 };

interface GState {
  ball:      { x: number; y: number; vx: number; vy: number };
  player:    { y: number };
  cpu:       { y: number };
  pScore:    number;
  cScore:    number;
  running:   boolean;
  over:      boolean;
  particles: Particle[];
  frame:     number;
  diff:      Diff;
  mouseY:    number;
}

function initState(diff: Diff): GState {
  return {
    ball:      { x: W / 2, y: H / 2, vx: 4.5, vy: 3 },
    player:    { y: H / 2 - PAD_H / 2 },
    cpu:       { y: H / 2 - PAD_H / 2 },
    pScore:    0,
    cScore:    0,
    running:   false,
    over:      false,
    particles: [],
    frame:     0,
    diff,
    mouseY:    H / 2,
  };
}

function burst(x: number, y: number, color: string): Particle[] {
  return Array.from({ length: 12 }, () => {
    const a = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 3;
    return { x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, color };
  });
}

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<GState>(initState("Medium"));
  const rafRef    = useRef<number>(0);
  const [ui, setUi] = useState({ pScore: 0, cScore: 0, running: false, over: false, diff: "Medium" as Diff });

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const st = stateRef.current;

    // Background
    ctx.fillStyle = "#07070d";
    ctx.fillRect(0, 0, W, H);

    // Centre dashed line
    ctx.setLineDash([8, 10]);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // Particles
    st.particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.035;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    st.particles = st.particles.filter((p) => p.life > 0);
    ctx.globalAlpha = 1;

    // Player paddle (left) — purple glow
    ctx.save();
    ctx.shadowBlur  = 18; ctx.shadowColor = "#a855f7";
    ctx.fillStyle   = "#a855f7";
    ctx.beginPath();
    ctx.roundRect(16, st.player.y, PAD_W, PAD_H, 4);
    ctx.fill();
    ctx.restore();

    // CPU paddle (right) — cyan glow
    ctx.save();
    ctx.shadowBlur  = 18; ctx.shadowColor = "#22d3ee";
    ctx.fillStyle   = "#22d3ee";
    ctx.beginPath();
    ctx.roundRect(W - 16 - PAD_W, st.cpu.y, PAD_W, PAD_H, 4);
    ctx.fill();
    ctx.restore();

    // Ball — white glow
    ctx.save();
    ctx.shadowBlur  = 22; ctx.shadowColor = "white";
    ctx.fillStyle   = "white";
    ctx.beginPath(); ctx.arc(st.ball.x, st.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Score in canvas
    ctx.font      = "bold 40px Inter, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillText(String(st.pScore), W / 4,     52);
    ctx.fillText(String(st.cScore), W * 3 / 4, 52);

    // Game over overlay
    if (st.over) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "white";
      ctx.font      = "bold 30px Inter, sans-serif";
      ctx.fillText(st.pScore >= WIN_SCORE ? "You Win!" : "CPU Wins", W / 2, H / 2 - 18);
      ctx.font      = "16px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`${st.pScore} – ${st.cScore}`, W / 2, H / 2 + 14);
      ctx.fillText("Press Space or click Play to restart", W / 2, H / 2 + 40);
    }

    // Start hint
    if (!st.running && !st.over) {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font      = "15px Inter, sans-serif";
      ctx.fillText("Move mouse · Press Space or click Play to start", W / 2, H / 2);
    }

    ctx.textAlign = "left";
    st.frame++;
  }, []);

  const tick = useCallback(() => {
    const st = stateRef.current;
    if (!st.running || st.over) return;

    // Move player paddle toward mouse
    const targetY = st.mouseY - PAD_H / 2;
    st.player.y += (targetY - st.player.y) * 0.35;
    st.player.y  = Math.max(0, Math.min(H - PAD_H, st.player.y));

    // CPU AI
    const cpuTarget = st.ball.y - PAD_H / 2;
    st.cpu.y += (cpuTarget - st.cpu.y) * CPU_SPEED[st.diff];
    st.cpu.y  = Math.max(0, Math.min(H - PAD_H, st.cpu.y));

    // Ball movement
    st.ball.x += st.ball.vx;
    st.ball.y += st.ball.vy;

    // Top / bottom wall
    if (st.ball.y - BALL_R <= 0)     { st.ball.vy = Math.abs(st.ball.vy);  st.ball.y = BALL_R; }
    if (st.ball.y + BALL_R >= H)     { st.ball.vy = -Math.abs(st.ball.vy); st.ball.y = H - BALL_R; }

    // Player paddle hit
    if (
      st.ball.x - BALL_R <= 26 + PAD_W &&
      st.ball.x - BALL_R >= 16 &&
      st.ball.y >= st.player.y &&
      st.ball.y <= st.player.y + PAD_H
    ) {
      const rel  = (st.ball.y - (st.player.y + PAD_H / 2)) / (PAD_H / 2);
      const spd  = Math.min(9, Math.hypot(st.ball.vx, st.ball.vy) * 1.04);
      const ang  = rel * 0.9;
      st.ball.vx = Math.abs(spd * Math.cos(ang));
      st.ball.vy = spd * Math.sin(ang);
      st.ball.x  = 26 + PAD_W + BALL_R;
      st.particles.push(...burst(st.ball.x, st.ball.y, "#a855f7"));
    }

    // CPU paddle hit
    if (
      st.ball.x + BALL_R >= W - 16 - PAD_W &&
      st.ball.x + BALL_R <= W - 16 &&
      st.ball.y >= st.cpu.y &&
      st.ball.y <= st.cpu.y + PAD_H
    ) {
      const rel  = (st.ball.y - (st.cpu.y + PAD_H / 2)) / (PAD_H / 2);
      const spd  = Math.min(9, Math.hypot(st.ball.vx, st.ball.vy) * 1.04);
      const ang  = rel * 0.9;
      st.ball.vx = -Math.abs(spd * Math.cos(ang));
      st.ball.vy = spd * Math.sin(ang);
      st.ball.x  = W - 16 - PAD_W - BALL_R;
      st.particles.push(...burst(st.ball.x, st.ball.y, "#22d3ee"));
    }

    // Score
    if (st.ball.x < 0) {
      st.cScore++;
      st.particles.push(...burst(W / 2, H / 2, "#22d3ee"));
      if (st.cScore >= WIN_SCORE) { st.over = true; st.running = false; }
      else { st.ball = { x: W / 2, y: H / 2, vx: -4.5, vy: 3 * (Math.random() > 0.5 ? 1 : -1) }; }
      setUi((u) => ({ ...u, cScore: st.cScore, over: st.over, running: st.running }));
    }
    if (st.ball.x > W) {
      st.pScore++;
      st.particles.push(...burst(W / 2, H / 2, "#a855f7"));
      if (st.pScore >= WIN_SCORE) { st.over = true; st.running = false; }
      else { st.ball = { x: W / 2, y: H / 2, vx: 4.5, vy: 3 * (Math.random() > 0.5 ? 1 : -1) }; }
      setUi((u) => ({ ...u, pScore: st.pScore, over: st.over, running: st.running }));
    }
  }, []);

  // RAF loop
  useEffect(() => {
    const loop = () => {
      tick();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, draw]);

  // Mouse tracking
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const onMove = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      stateRef.current.mouseY = e.clientY - rect.top;
    };
    c.addEventListener("mousemove", onMove);
    return () => c.removeEventListener("mousemove", onMove);
  }, []);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); startGame(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const startGame = useCallback(() => {
    const diff = stateRef.current.diff;
    stateRef.current = { ...initState(diff), diff };
    stateRef.current.running = true;
    setUi({ pScore: 0, cScore: 0, running: true, over: false, diff });
  }, []);

  const setDiff = (d: Diff) => {
    stateRef.current.diff = d;
    setUi((u) => ({ ...u, diff: d }));
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-3"
      style={{ background: "#07070d" }}>

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[600px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "#a855f7", boxShadow: "0 0 8px #a855f7" }} />
          <span className="text-[28px] font-bold tabular-nums" style={{ color: "#a855f7" }}>{ui.pScore}</span>
        </div>

        {/* Difficulty */}
        <div className="flex gap-1">
          {(["Easy", "Medium", "Hard"] as Diff[]).map((d) => (
            <button key={d} onClick={() => setDiff(d)}
              className={`px-2.5 py-1 rounded-full text-[10px] transition-all ${ui.diff === d ? "text-white" : "text-white/30 hover:text-white/60"}`}
              style={{
                background: ui.diff === d ? "rgba(168,85,247,0.2)" : "transparent",
                border: `1px solid ${ui.diff === d ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}>{d}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[28px] font-bold tabular-nums" style={{ color: "#22d3ee" }}>{ui.cScore}</span>
          <div className="w-3 h-3 rounded-full" style={{ background: "#22d3ee", boxShadow: "0 0 8px #22d3ee" }} />
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(168,85,247,0.1)" }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", cursor: "none" }} />
      </div>

      {/* Controls */}
      {!ui.running && (
        <button onClick={startGame}
          className="px-8 py-2.5 rounded-xl font-semibold text-white text-[14px] transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg,#9b59b6,#7c3aed)", boxShadow: "0 4px 20px rgba(155,89,182,0.4)" }}>
          {ui.over ? "Play Again" : "Play"}
        </button>
      )}
      {ui.running && (
        <p className="text-[11px] text-white/20">Move mouse to control · First to {WIN_SCORE} wins</p>
      )}
    </div>
  );
}
