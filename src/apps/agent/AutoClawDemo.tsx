import { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield, Wrench, Rocket, Activity, Zap,
  Play, Pause, SkipForward, RotateCcw, Sparkles, Check, ArrowRight, ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useOsStore } from "@/store/useOsStore";
import { APP_REGISTRY } from "@/apps/registry";

// ── Step + Scenario shape ──────────────────────────────────────────────────
type StepType = "think" | "tool_call" | "final_answer";

interface DemoStep {
  stepType: StepType;
  content: string;
  toolName?: string;
  toolResult?: string;
  latencyMs: number;
}

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  agent: "builder" | "security" | "deployer" | "monitor" | "optimizer";
  icon: LucideIcon;
  accent: string;
  prompt: string;
  steps: DemoStep[];
}

// ── Curated scenarios (mirror server SIMULATED_TOOLS) ──────────────────────
const SCENARIOS: Scenario[] = [
  {
    id: "audit",
    title: "Security audit",
    subtitle: "Full recon → SSL → CVE cross-check on example.com",
    agent: "security",
    icon: Shield,
    accent: "#ef4444",
    prompt: "Audit example.com — ports, TLS, exposed CVEs",
    steps: [
      { stepType: "think", content: "Task: perimeter audit on example.com. Plan: port scan → TLS check → subdomain enum → cross-ref CVE database.", latencyMs: 320 },
      { stepType: "tool_call", toolName: "scan_ports", content: "Invoking scan_ports on example.com", toolResult: "Open: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL exposed ⚠), 8080 (HTTP-alt)", latencyMs: 720 },
      { stepType: "think", content: "MySQL on 3306 flagged — public DB exposure is high risk. Continuing with TLS.", latencyMs: 280 },
      { stepType: "tool_call", toolName: "check_ssl", content: "Invoking check_ssl on example.com", toolResult: "TLS 1.3 ✓, cert valid until 2027-04, HSTS ✓, OCSP stapling ✓", latencyMs: 550 },
      { stepType: "tool_call", toolName: "dns_enum", content: "Invoking dns_enum for reconnaissance", toolResult: "A 104.21.45.2 · MX mail.example.com · TXT spf1 include:_spf.google.com", latencyMs: 480 },
      { stepType: "final_answer", content: "Audit complete. 1 critical: MySQL/3306 world-open. 0 medium. TLS posture strong. Recommend: firewall 3306, review SSH keys, enable fail2ban.", latencyMs: 200 },
    ],
  },
  {
    id: "ship",
    title: "Ship a release",
    subtitle: "Build → test → deploy to production",
    agent: "deployer",
    icon: Rocket,
    accent: "#22c55e",
    prompt: "Ship kali-webos v2.1 to production",
    steps: [
      { stepType: "think", content: "Deploy pipeline: type-check → build → test → deploy → smoke. Rollback plan: last-known-good tag v2.0.9.", latencyMs: 300 },
      { stepType: "tool_call", toolName: "build_project", content: "Invoking build_project", toolResult: "✓ tsc -b (0 errors) · ✓ vite build 14.1s · dist/ 480KB gzipped", latencyMs: 900 },
      { stepType: "tool_call", toolName: "run_tests", content: "Invoking run_tests", toolResult: "✓ 42/42 unit · ✓ 8/8 integration · Coverage 87%", latencyMs: 640 },
      { stepType: "tool_call", toolName: "deploy", content: "Invoking deploy → production", toolResult: "✓ upload · ✓ CDN invalidate · ✓ /health 200 OK · Live at https://kali-webos.kimi.page", latencyMs: 780 },
      { stepType: "final_answer", content: "v2.1 shipped. Build 14.1s, 480KB gzip, healthcheck green. Rollback tag v2.0.9 held for 24h.", latencyMs: 200 },
    ],
  },
  {
    id: "optimize",
    title: "Bundle optimization",
    subtitle: "Diagnose bloat, propose cuts",
    agent: "optimizer",
    icon: Zap,
    accent: "#eab308",
    prompt: "Reduce bundle size — biggest wins",
    steps: [
      { stepType: "think", content: "Profile → identify heavy chunks → cross-check imports → recommend lazy-load or removal.", latencyMs: 280 },
      { stepType: "tool_call", toolName: "build_project", content: "Building for bundle analysis", toolResult: "vendor-recharts 357KB (99KB gz) · vendor-react 269KB · vendor-trpc 84KB · app 54KB", latencyMs: 700 },
      { stepType: "think", content: "recharts dominates — used only by Monitor app. Already lazy. Try replacing with lightweight canvas charts?", latencyMs: 240 },
      { stepType: "final_answer", content: "Top win: swap recharts (99KB gz) for a canvas sparkline in Monitor (~5KB). Saves 94KB on the Monitor route. Overall initial load already lean (198KB gz).", latencyMs: 200 },
    ],
  },
  {
    id: "monitor",
    title: "Uptime probe",
    subtitle: "Health-check production endpoint",
    agent: "monitor",
    icon: Activity,
    accent: "#06b6d4",
    prompt: "Monitor kali-webos.kimi.page",
    steps: [
      { stepType: "think", content: "Health probe: DNS resolution → port reachability → SSL sanity.", latencyMs: 260 },
      { stepType: "tool_call", toolName: "dns_enum", content: "Resolving kali-webos.kimi.page", toolResult: "A 104.21.45.2 · TTL 300s · propagation OK across 12 resolvers", latencyMs: 420 },
      { stepType: "tool_call", toolName: "nmap_scan", content: "Reachability check", toolResult: "22/tcp open ssh · 80/tcp open http · 443/tcp open https · avg latency 42ms", latencyMs: 580 },
      { stepType: "final_answer", content: "All green. DNS resolves, 443 reachable, latency 42ms nominal. No paging.", latencyMs: 180 },
    ],
  },
  {
    id: "build",
    title: "Build new project",
    subtitle: "Scaffold + verify",
    agent: "builder",
    icon: Wrench,
    accent: "#3b82f6",
    prompt: "Build and validate acme-web",
    steps: [
      { stepType: "think", content: "Standard build path: compile → assets → test → report.", latencyMs: 260 },
      { stepType: "tool_call", toolName: "build_project", content: "Invoking build_project on acme-web", toolResult: "✓ TypeScript ✓ Vite ✓ Assets optimized · dist/ 312KB", latencyMs: 680 },
      { stepType: "tool_call", toolName: "run_tests", content: "Invoking run_tests", toolResult: "✓ 24 tests · 0 fail · Coverage 82%", latencyMs: 520 },
      { stepType: "final_answer", content: "acme-web built clean. 312KB output, 24/24 tests green. Ready for CI upload.", latencyMs: 200 },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function AutoClawDemo() {
  const [idx, setIdx] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(2);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openWindow = useOsStore((s) => s.openWindow);

  const scenario = SCENARIOS[idx];
  const totalSteps = scenario.steps.length;
  const done = revealedSteps >= totalSteps;

  // Clear timer on unmount / scenario change
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Step ticker
  useEffect(() => {
    if (!running || done) return;
    const next = scenario.steps[revealedSteps];
    if (!next) return;
    timerRef.current = setTimeout(() => {
      setRevealedSteps((r) => r + 1);
    }, next.latencyMs / speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, revealedSteps, done, scenario, speed]);

  // Auto-advance to next scenario when current one finishes
  useEffect(() => {
    if (!done || !autoAdvance || !running) return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % SCENARIOS.length);
      setRevealedSteps(0);
    }, 1800 / speed);
    return () => clearTimeout(t);
  }, [done, autoAdvance, running, speed]);

  const play = useCallback(() => {
    if (done) { setRevealedSteps(0); }
    setRunning(true);
  }, [done]);

  const pause = useCallback(() => setRunning(false), []);
  const skip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealedSteps(totalSteps);
  }, [totalSteps]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIdx(0); setRevealedSteps(0); setRunning(false);
  }, []);

  const jumpTo = useCallback((newIdx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIdx(newIdx); setRevealedSteps(0);
  }, []);

  const openRealAgent = useCallback(() => {
    const app = APP_REGISTRY.find((a) => a.id === "agentchat");
    if (app) openWindow(app);
  }, [openWindow]);

  const Icon = scenario.icon;

  return (
    <div className="flex flex-col h-full bg-[#0a0a1a] text-gray-100 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-900/40 shrink-0">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <span className="font-semibold text-sm">AutoClaw</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-300">Demo · no auth</span>
        <div className="ml-auto flex items-center gap-1">
          {([1, 2, 4] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[10px] w-8 h-6 rounded transition-colors ${speed === s ? "bg-purple-600/40 text-purple-200" : "text-gray-500 hover:bg-white/5"}`}
            >{s}×</button>
          ))}
        </div>
      </div>

      {/* ── Scenario picker ── */}
      <div className="grid grid-cols-5 gap-1 px-3 py-2 border-b border-purple-900/20 shrink-0">
        {SCENARIOS.map((s, i) => {
          const ScenarioIcon = s.icon;
          const active = i === idx;
          return (
            <button
              key={s.id}
              onClick={() => jumpTo(i)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[9px] transition-all ${active ? "bg-purple-900/40" : "hover:bg-white/5"}`}
              style={{ border: active ? `1px solid ${s.accent}55` : "1px solid transparent" }}
            >
              <ScenarioIcon size={16} style={{ color: active ? s.accent : "rgba(255,255,255,0.4)" }} />
              <span className={active ? "text-white/90" : "text-white/40"}>{s.title.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* ── Stage ── */}
      <div className="flex-1 overflow-y-auto os-scrollbar px-4 py-4 space-y-3">
        {/* Scenario title card */}
        <div
          className="rounded-xl p-3 flex items-start gap-3"
          style={{ background: `${scenario.accent}0d`, border: `1px solid ${scenario.accent}30` }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${scenario.accent}20`, border: `1px solid ${scenario.accent}40` }}
          >
            <Icon size={20} style={{ color: scenario.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-white/95">{scenario.title}</p>
              <span className="text-[9px] uppercase tracking-wider text-white/40">{scenario.agent}</span>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">{scenario.subtitle}</p>
            <p className="text-[11px] text-white/70 mt-2 font-mono">&gt; {scenario.prompt}</p>
          </div>
        </div>

        {/* Steps (revealed progressively) */}
        <div className="space-y-2">
          {scenario.steps.slice(0, revealedSteps).map((step, i) => (
            <div
              key={i}
              className="rounded-lg p-2.5 animate-in fade-in slide-in-from-left-2 duration-300"
              style={{
                background: step.stepType === "final_answer" ? `${scenario.accent}12` : "rgba(255,255,255,0.03)",
                border: step.stepType === "final_answer"
                  ? `1px solid ${scenario.accent}50`
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    step.stepType === "think" ? "bg-blue-400" :
                    step.stepType === "tool_call" ? "bg-green-400" : "bg-purple-400"
                  }`}
                />
                <span className="text-[9px] uppercase tracking-wider text-white/40">
                  {step.stepType.replace("_", " ")}
                </span>
                {step.toolName && (
                  <span className="text-[10px] font-mono text-purple-300/70">→ {step.toolName}()</span>
                )}
                <span className="ml-auto text-[9px] text-white/25 tabular-nums">{step.latencyMs}ms</span>
              </div>
              <p className="text-[12px] text-white/85 leading-relaxed">{step.content}</p>
              {step.toolResult && (
                <pre className="mt-2 p-2 rounded bg-black/40 text-[10px] text-green-300/90 whitespace-pre-wrap font-mono overflow-x-auto">
                  {step.toolResult}
                </pre>
              )}
            </div>
          ))}

          {/* In-flight indicator */}
          {running && !done && (
            <div className="flex items-center gap-2 text-[11px] text-purple-300/70 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Thinking · step {revealedSteps + 1}/{totalSteps}
            </div>
          )}

          {/* CTA when scenario complete */}
          {done && (
            <div className="mt-3 rounded-xl p-3 flex items-center gap-3 animate-in fade-in duration-300"
              style={{ background: "rgba(155,89,182,0.08)", border: "1px solid rgba(155,89,182,0.3)" }}
            >
              <Check size={16} className="text-purple-400 shrink-0" />
              <p className="text-[12px] text-white/80 flex-1">
                Chain complete. Try your own prompt in the real agent.
              </p>
              <button
                onClick={openRealAgent}
                className="text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/40 text-purple-100 transition-colors"
              >
                Open Agent Chat <ExternalLink size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-purple-900/40 shrink-0">
        {!running ? (
          <button
            onClick={play}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[12px] font-medium transition-colors"
          >
            <Play size={13} /> {done ? "Replay" : revealedSteps > 0 ? "Resume" : "Start demo"}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[12px] font-medium transition-colors"
          >
            <Pause size={13} /> Pause
          </button>
        )}
        <button
          onClick={skip}
          disabled={done}
          className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[11px] text-white/60 hover:bg-white/5 hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Skip to end of scenario"
        >
          <SkipForward size={12} /> Skip
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[11px] text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
          title="Reset all"
        >
          <RotateCcw size={12} /> Reset
        </button>
        <label className="ml-auto flex items-center gap-1.5 text-[11px] text-white/60 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
            className="accent-purple-500 w-3 h-3"
          />
          Auto-advance
        </label>
        <span className="text-[11px] text-white/40 flex items-center gap-1">
          {idx + 1}/{SCENARIOS.length} <ArrowRight size={10} />
        </span>
      </div>
    </div>
  );
}
