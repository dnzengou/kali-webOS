import { useEffect } from "react";
import { X, Zap, Lock } from "lucide-react";
import { useOsStore } from "@/store/useOsStore";
import { getAppById } from "@/apps/registry";
import { WORKSPACE_PRESETS, getWorkspacePreset, type WorkspacePreset } from "@/apps/workspaces";

interface WorkspacesLauncherProps {
  onClose: () => void;
}

/**
 * Modal picker for workspace presets — the "low-hanging-fruit" demo surface.
 * A new user who doesn't know what to try gets five one-click scenarios
 * that showcase the OS + agent story end-to-end.
 */
export default function WorkspacesLauncher({ onClose }: WorkspacesLauncherProps) {
  // Dismiss on Escape or backdrop click.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center p-6 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
    >
      <button className="fixed inset-0 -z-10" onClick={onClose} aria-label="Dismiss" />

      <div
        className="relative w-full max-w-[920px] max-h-[82vh] overflow-y-auto rounded-3xl p-6 pb-4"
        style={{
          background: "rgba(22,22,22,0.96)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 72px rgba(0,0,0,0.65)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-purple-400" />
            <h2 className="text-[15px] font-semibold text-white/90">Workspaces</h2>
            <span className="text-[11px] text-white/35">one-click layouts to explore the OS</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKSPACE_PRESETS.map((p) => (
            <PresetCard key={p.id} preset={p} onLaunched={onClose} />
          ))}
        </div>

        <p className="mt-4 text-[11px] text-white/35 text-center">
          Tip: share any preset with <span className="text-white/60">?demo={"<id>"}</span> in the URL · Esc to close
        </p>
      </div>
    </div>
  );
}

function PresetCard({ preset, onLaunched }: { preset: WorkspacePreset; onLaunched: () => void }) {
  const isGuest              = useOsStore((s) => s.isGuest);
  const openWindow           = useOsStore((s) => s.openWindow);
  const closeWindow          = useOsStore((s) => s.closeWindow);
  const windows              = useOsStore((s) => s.windows);
  const setPendingAgentPrompt = useOsStore((s) => s.setPendingAgentPrompt);

  const willHitAuth = preset.needsAuth && isGuest;

  const launch = () => {
    // Close everything that isn't already in the preset — keep a clean canvas.
    const keep = new Set(preset.apps);
    windows.forEach((w) => { if (!keep.has(w.appId)) closeWindow(w.id); });

    // Stage the prompt BEFORE opening Agent Chat so its mount reads it.
    if (preset.agentPrompt) setPendingAgentPrompt(preset.agentPrompt);

    // Open each app in order; AgentChat moves to the end so it lands focused.
    const order = preset.apps.includes("agentchat")
      ? [...preset.apps.filter((id) => id !== "agentchat"), "agentchat"]
      : preset.apps;

    order.forEach((appId, i) => {
      const app = getAppById(appId);
      if (!app) return;
      // Small stagger so windows cascade visibly rather than snap-overlap.
      setTimeout(() => openWindow(app), i * 80);
    });

    onLaunched();
  };

  const Icon = preset.icon;

  return (
    <button
      onClick={launch}
      className="group text-left flex flex-col gap-2.5 p-4 rounded-2xl transition-all duration-150 relative"
      style={{
        background: "rgba(40,40,40,0.5)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
          style={{ background: `${preset.color}22`, border: `1px solid ${preset.color}55` }}
        >
          <Icon size={18} style={{ color: preset.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-white/90">{preset.name}</div>
          <div className="text-[11px] text-white/45 mt-0.5 leading-snug">{preset.blurb}</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        {preset.apps.map((appId) => {
          const app = getAppById(appId);
          if (!app) return null;
          const AppIcon = app.icon;
          return (
            <div
              key={appId}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-white/55"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
              title={app.name}
            >
              <AppIcon size={9} />
              <span>{app.name}</span>
            </div>
          );
        })}
      </div>

      {willHitAuth && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-300/80 mt-1">
          <Lock size={10} />
          Needs sign-in for agent runs
        </div>
      )}
    </button>
  );
}

/**
 * Deep-link handler — reads `?demo=<id>` from location on mount and
 * triggers the matching preset exactly once. Lives separately from the
 * modal so the trigger works even if the user never opens the modal.
 */
export function useDeepLinkedWorkspace() {
  const openWindow            = useOsStore((s) => s.openWindow);
  const setPendingAgentPrompt = useOsStore((s) => s.setPendingAgentPrompt);
  const isLocked              = useOsStore((s) => s.isLocked);

  useEffect(() => {
    if (isLocked) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("demo");
    if (!id) return;

    const preset = getWorkspacePreset(id);
    if (!preset) return;

    // Only fire once per URL load.
    const consumed = sessionStorage.getItem("kali-webos:demo-consumed");
    if (consumed === id) return;
    try { sessionStorage.setItem("kali-webos:demo-consumed", id); } catch { /* storage blocked */ }

    if (preset.agentPrompt) setPendingAgentPrompt(preset.agentPrompt);

    const order = preset.apps.includes("agentchat")
      ? [...preset.apps.filter((a) => a !== "agentchat"), "agentchat"]
      : preset.apps;
    order.forEach((appId, i) => {
      const app = getAppById(appId);
      if (!app) return;
      setTimeout(() => openWindow(app), i * 80);
    });
  }, [isLocked, openWindow, setPendingAgentPrompt]);
}
