#!/usr/bin/env node
import { createAetherClaw } from "./client.js";
import type { AgentType } from "./agents.js";
import type { CoTStep } from "./cot.js";

interface Args {
  agent: AgentType;
  prompt: string;
  json: boolean;
  quiet: boolean;
  timeout: number;
  maxSteps: number;
  help: boolean;
}

const AGENTS: AgentType[] = ["builder", "security", "deployer", "monitor", "optimizer"];

const HELP = `aetherclaw — CoT multi-agent CLI (v2.0.0)

USAGE
  aetherclaw [options] <prompt>
  aetherclaw security "recon kali-webos.io"
  echo "audit ./src" | aetherclaw -a optimizer

OPTIONS
  -a, --agent <name>     ${AGENTS.join(" | ")}  (default: security)
  -t, --timeout <ms>     per-run abort  (default: 45000)
  -m, --max-steps <n>    max CoT steps  (default: 8)
  -j, --json             emit NDJSON (one step per line) + final result
  -q, --quiet            suppress step trace; only print final answer
  -h, --help             this help

EXIT CODES
  0  success                1  invocation error
  2  agent run error        3  aborted
`;

function parseArgs(argv: string[]): Args {
  const args: Args = {
    agent: "security",
    prompt: "",
    json: false,
    quiet: false,
    timeout: 45_000,
    maxSteps: 8,
    help: false,
  };
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    switch (a) {
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-j":
      case "--json":
        args.json = true;
        break;
      case "-q":
      case "--quiet":
        args.quiet = true;
        break;
      case "-a":
      case "--agent": {
        const v = argv[++i];
        if (!v || !AGENTS.includes(v as AgentType)) {
          throw new Error(`invalid agent: ${v}. expected one of ${AGENTS.join(", ")}`);
        }
        args.agent = v as AgentType;
        break;
      }
      case "-t":
      case "--timeout": {
        const v = parseInt(argv[++i] ?? "", 10);
        if (!Number.isFinite(v) || v <= 0) throw new Error("invalid --timeout");
        args.timeout = v;
        break;
      }
      case "-m":
      case "--max-steps": {
        const v = parseInt(argv[++i] ?? "", 10);
        if (!Number.isFinite(v) || v <= 0) throw new Error("invalid --max-steps");
        args.maxSteps = v;
        break;
      }
      default:
        if (a.startsWith("-")) throw new Error(`unknown flag: ${a}`);
        positional.push(a);
    }
  }
  if (positional.length === 1) {
    args.prompt = positional[0]!;
  } else if (positional.length >= 2 && AGENTS.includes(positional[0] as AgentType)) {
    args.agent = positional[0] as AgentType;
    args.prompt = positional.slice(1).join(" ");
  } else {
    args.prompt = positional.join(" ");
  }
  return args;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main(): Promise<number> {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`error: ${(err as Error).message}\n\n${HELP}`);
    return 1;
  }
  if (args.help) {
    process.stdout.write(HELP);
    return 0;
  }
  if (!args.prompt) {
    args.prompt = await readStdin();
  }
  if (!args.prompt) {
    process.stderr.write("error: no prompt (positional or stdin)\n\n" + HELP);
    return 1;
  }

  const claw = createAetherClaw({ timeout: args.timeout });
  const controller = new AbortController();
  process.on("SIGINT", () => controller.abort());
  process.on("SIGTERM", () => controller.abort());

  try {
    const result = await claw.run({
      agentType: args.agent,
      prompt: args.prompt,
      maxSteps: args.maxSteps,
      abortSignal: controller.signal,
      onStep: (step: CoTStep) => {
        if (args.quiet) return;
        if (args.json) {
          process.stdout.write(JSON.stringify({ kind: "step", ...step }) + "\n");
        } else {
          process.stderr.write(`  [${step.stepType}] ${step.content} (${step.latencyMs}ms)\n`);
          if (step.toolResult) process.stderr.write(`    → ${step.toolResult}\n`);
        }
      },
    });
    if (args.json) {
      process.stdout.write(JSON.stringify({ kind: "done", ...result }) + "\n");
    } else {
      process.stdout.write(result.finalAnswer + "\n");
    }
    return controller.signal.aborted ? 3 : 0;
  } catch (err) {
    const msg = (err as Error).message;
    process.stderr.write(`error: ${msg}\n`);
    return controller.signal.aborted ? 3 : 2;
  }
}

main().then((code) => process.exit(code), (e) => {
  process.stderr.write(`fatal: ${(e as Error).message}\n`);
  process.exit(2);
});
