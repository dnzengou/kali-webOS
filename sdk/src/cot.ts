import { AGENT_PROFILES, type AgentType, type StepType } from "./agents.js";
import { runTool, type ToolName, type ToolContext } from "./tools.js";

export interface CoTStep {
  stepType: StepType;
  content: string;
  toolName?: ToolName;
  toolResult?: string;
  stepOrder: number;
  latencyMs: number;
}

export interface CoTResult {
  steps: CoTStep[];
  finalAnswer: string;
  totalLatencyMs: number;
}

export interface RunCoTOptions {
  agentType: AgentType;
  prompt: string;
  maxSteps?: number;
  onStep?: (step: CoTStep) => void;
  toolContext?: ToolContext;
  abortSignal?: AbortSignal;
}

interface PlannedStep {
  stepType: StepType;
  content: string;
  toolName?: ToolName;
  toolInput?: string;
}

function planSteps(
  agentType: AgentType,
  prompt: string,
  maxSteps: number,
): PlannedStep[] {
  const profile = AGENT_PROFILES[agentType];
  const target = extractTarget(prompt);
  const steps: PlannedStep[] = [
    {
      stepType: "think",
      content: `Analyzing request as ${profile.type}: "${prompt.slice(0, 120)}"`,
    },
  ];
  const toolBudget = Math.max(1, Math.min(maxSteps - 2, profile.tools.length));
  for (const tool of profile.tools.slice(0, toolBudget)) {
    steps.push({
      stepType: "tool_call",
      content: `Invoking ${tool} on ${target}`,
      toolName: tool,
      toolInput: target,
    });
  }
  steps.push({
    stepType: "final_answer",
    content: `Completed ${profile.type} run on ${target}. Review tool outputs above.`,
  });
  return steps;
}

function extractTarget(prompt: string): string {
  const url = prompt.match(/https?:\/\/[^\s]+/)?.[0];
  if (url) return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const domain = prompt.match(/[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?/i)?.[0];
  if (domain) return domain;
  const ip = prompt.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/)?.[0];
  if (ip) return ip;
  return "target";
}

export async function runCoT(opts: RunCoTOptions): Promise<CoTResult> {
  const { agentType, prompt, maxSteps = 8, onStep, toolContext, abortSignal } = opts;
  const planned = planSteps(agentType, prompt, maxSteps);
  const steps: CoTStep[] = [];
  const t0 = Date.now();

  for (let i = 0; i < planned.length; i++) {
    if (abortSignal?.aborted) {
      steps.push({
        stepType: "error",
        content: "Aborted by caller",
        stepOrder: i,
        latencyMs: 0,
      });
      break;
    }
    const stepStart = Date.now();
    const plan = planned[i]!;
    let toolResult: string | undefined;
    if (plan.stepType === "tool_call" && plan.toolName && plan.toolInput) {
      try {
        toolResult = await runTool(plan.toolName, plan.toolInput, {
          ...toolContext,
          abortSignal,
        });
      } catch (err) {
        const step: CoTStep = {
          stepType: "error",
          content: `Tool ${plan.toolName} failed: ${(err as Error).message}`,
          stepOrder: i,
          latencyMs: Date.now() - stepStart,
        };
        steps.push(step);
        onStep?.(step);
        continue;
      }
    }
    const step: CoTStep = {
      stepType: plan.stepType,
      content: plan.content,
      toolName: plan.toolName,
      toolResult,
      stepOrder: i,
      latencyMs: Date.now() - stepStart,
    };
    steps.push(step);
    onStep?.(step);
  }

  const finalStep = [...steps].reverse().find((s) => s.stepType === "final_answer");
  return {
    steps,
    finalAnswer: finalStep?.content ?? "No final answer produced.",
    totalLatencyMs: Date.now() - t0,
  };
}
