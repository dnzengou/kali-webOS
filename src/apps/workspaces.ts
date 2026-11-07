import type { LucideIcon } from "lucide-react";
import {
  Shield, Hammer, Activity, Sparkles, Palette,
} from "lucide-react";

/**
 * A workspace preset is a named layout — a short list of apps to open
 * together with optional prompts for the AetherClaw agent. They exist
 * to let a new user feel the "OS + agent" story in one click, instead
 * of hunting apps one by one.
 *
 * Each preset is also reachable by URL: `?demo=<id>` auto-triggers on
 * page load (desktop mounts, preset opens).
 *
 * Add a new preset: push an entry below. The `apps` order drives the
 * open sequence and their z-index — the last app opened ends up focused.
 */

export interface WorkspacePreset {
  /** Stable id used in URLs (`?demo=<id>`) and dock buttons. */
  id: string;
  /** Short human name shown on the card. */
  name: string;
  /** One-line pitch. */
  blurb: string;
  /** Lucide icon rendered on the card. */
  icon: LucideIcon;
  /** Accent color — matches category hues the user already knows. */
  color: string;
  /** Does this preset require a signed-in session? (Agent + DB apps do.) */
  needsAuth: boolean;
  /** App ids to open, in order. The last one gets focus. */
  apps: string[];
  /**
   * Optional preset chat prompt. When present, Agent Chat is opened last
   * (regardless of order) and its input is pre-filled.
   * The user still presses Send — never autoruns on their behalf.
   */
  agentPrompt?: string;
}

export const WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: "pentest",
    name: "Pentest Lab",
    blurb: "Recon → enumerate → verify. WHOIS + DNS + Nmap + SSL + Security agent.",
    icon: Shield,
    color: "#ef4444",
    needsAuth: true,
    apps: ["whois", "dnslookup", "nmap", "sslscan", "agentchat"],
    agentPrompt: "Perform a full security audit on example.com — port scan, DNS/SSL review, and surface anything notable.",
  },
  {
    id: "dev",
    name: "Dev Workspace",
    blurb: "Code Editor + Terminal + Browser + Builder agent — everything you need to ship.",
    icon: Hammer,
    color: "#3b82f6",
    needsAuth: true,
    apps: ["codeeditor", "terminal", "browser", "agentchat"],
    agentPrompt: "Build and test my project, then suggest the smallest change to improve bundle size.",
  },
  {
    id: "soc",
    name: "SOC Dashboard",
    blurb: "Live threat map + system monitor + agent monitor + Monitor agent on standby.",
    icon: Activity,
    color: "#06b6d4",
    needsAuth: true,
    apps: ["attackmap", "monitor", "agentmon", "agentchat"],
    agentPrompt: "Monitor service health and alert on anomalies — summarise every 5 minutes.",
  },
  {
    id: "showcase",
    name: "AI Agent Showcase",
    blurb: "Watch the CoT engine work. AutoClaw demo runs without login.",
    icon: Sparkles,
    color: "#a855f7",
    needsAuth: false,
    apps: ["autoclaw", "agentchat", "cottrace", "pipeline"],
  },
  {
    id: "studio",
    name: "Content Studio",
    blurb: "Markdown + Whiteboard + Image Viewer + Music — a quiet corner to create.",
    icon: Palette,
    color: "#f59e0b",
    needsAuth: false,
    apps: ["markdown", "whiteboard", "images", "music"],
  },
];

export function getWorkspacePreset(id: string): WorkspacePreset | undefined {
  return WORKSPACE_PRESETS.find((p) => p.id === id);
}
