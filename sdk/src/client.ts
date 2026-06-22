import { runCoT, type CoTResult, type RunCoTOptions } from "./cot.js";
import { AGENT_PROFILES, type AgentType } from "./agents.js";
import { runTool, type ToolName, type ToolContext } from "./tools.js";

export interface AetherClawConfig {
  /** Optional Claude API key for future LLM-backed reasoning */
  anthropicApiKey?: string;
  /** Model identifier (default: claude-sonnet-4-6) */
  model?: string;
  /** Default abort timeout (ms) */
  timeout?: number;
}

export interface AetherClaw {
  run(opts: Omit<RunCoTOptions, "agentType"> & { agentType: AgentType }): Promise<CoTResult>;
  tool(name: ToolName, input: string, ctx?: ToolContext): Promise<string>;
  listAgents(): AgentType[];
}

export function createAetherClaw(config: AetherClawConfig = {}): AetherClaw {
  const timeout = config.timeout ?? 30_000;

  return {
    async run(opts) {
      const controller = new AbortController();
      const handle = setTimeout(() => controller.abort(), timeout);
      try {
        return await runCoT({
          ...opts,
          abortSignal: opts.abortSignal ?? controller.signal,
        });
      } finally {
        clearTimeout(handle);
      }
    },
    tool(name, input, ctx) {
      return runTool(name, input, ctx);
    },
    listAgents() {
      return Object.keys(AGENT_PROFILES) as AgentType[];
    },
  };
}
