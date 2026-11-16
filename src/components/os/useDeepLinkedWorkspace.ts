import { useEffect } from "react";
import { useOsStore } from "@/store/useOsStore";
import { getAppById } from "@/apps/registry";
import { getWorkspacePreset } from "@/apps/workspaces";

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
