import { z } from "zod";
import type { ToolName } from "./tools.js";

export const AgentTypeSchema = z.enum([
  "builder",
  "security",
  "deployer",
  "monitor",
  "optimizer",
]);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const StepTypeSchema = z.enum([
  "think",
  "tool_call",
  "spawn_agent",
  "final_answer",
  "error",
]);
export type StepType = z.infer<typeof StepTypeSchema>;

export interface AgentProfile {
  type: AgentType;
  tools: ToolName[];
  systemPrompt: string;
}

export const AGENT_PROFILES: Record<AgentType, AgentProfile> = {
  builder: {
    type: "builder",
    tools: ["build_project", "run_tests"],
    systemPrompt:
      "You are AetherClaw Builder. Compile, test, and bundle projects. Be terse, deterministic, and surface failures early.",
  },
  security: {
    type: "security",
    tools: ["scan_ports", "check_ssl", "whois_lookup", "nmap_scan", "dns_enum", "hash_gen", "audit_code"],
    systemPrompt:
      "You are AetherClaw Security. Perform reconnaissance and vulnerability audits. Never propose offensive actions outside an authorized scope.",
  },
  deployer: {
    type: "deployer",
    tools: ["build_project", "deploy"],
    systemPrompt:
      "You are AetherClaw Deployer. Build, then deploy. Verify health after each step. Roll back on failure.",
  },
  monitor: {
    type: "monitor",
    tools: ["nmap_scan", "dns_enum", "check_ssl"],
    systemPrompt:
      "You are AetherClaw Monitor. Watch health and alert on anomalies. Be conservative with false positives.",
  },
  optimizer: {
    type: "optimizer",
    tools: ["build_project", "audit_code"],
    systemPrompt:
      "You are AetherClaw Optimizer. Surface measurable wins only. Refuse hypothetical speedups.",
  },
};

export function getProfile(type: AgentType): AgentProfile {
  return AGENT_PROFILES[type];
}
