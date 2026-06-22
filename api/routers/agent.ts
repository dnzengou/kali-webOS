import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { agentSessions, agentRuns, pipelines } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const SIMULATED_TOOLS: Record<string, (input: string) => Promise<string>> = {
  scan_ports: async (host: string) =>
    `Scanning ${host}...\nOpen ports: 22(SSH), 80(HTTP), 443(HTTPS), 3306(MySQL), 8080(HTTP-ALT)`,
  check_ssl: async (host: string) =>
    `SSL check for ${host}: TLS 1.3 enabled, cert valid, HSTS active`,
  whois_lookup: async (domain: string) =>
    `Domain: ${domain}\nRegistrar: NameCheap\nCreated: 2020-01-15\nExpires: 2026-01-15`,
  nmap_scan: async (target: string) =>
    `Nmap scan on ${target}:\n22/tcp open ssh\n80/tcp open http\n443/tcp open https`,
  dns_enum: async (domain: string) =>
    `DNS records for ${domain}:\nA: 104.21.45.2\nMX: mail.${domain}\nTXT: v=spf1 include:_spf.google.com`,
  hash_gen: async (input: string) =>
    `MD5: ${btoa(input).slice(0, 32)}\nSHA256: ${btoa(input).repeat(2).slice(0, 64)}`,
  build_project: async (project: string) =>
    `Building ${project}...\n✓ TypeScript compile\n✓ Vite bundle\n✓ Assets optimized\nBuild complete: dist/ (${Math.floor(Math.random() * 500 + 100)}KB)`,
  run_tests: async (project: string) =>
    `Testing ${project}...\n✓ 42 tests passed\n✓ 0 failed\nCoverage: 87%`,
  deploy: async (target: string) =>
    `Deploying to ${target}...\n✓ Uploading assets\n✓ Invalidating CDN\n✓ Health check passed\nLive at: https://${target}.kimi.page`,
  audit_code: async (file: string) =>
    `Auditing ${file}...\n⚠ 2 warnings (unused vars)\n✓ No critical issues\nScore: 94/100`,
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const agentRouter = createRouter({
  listSessions: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = getDb();
    return db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.userId, Number(ctx.user.id)))
      .orderBy(desc(agentSessions.createdAt));
  }),

  createSession: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        agentType: z.enum(["builder", "security", "deployer", "monitor", "optimizer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = getDb();
      const result = await db.insert(agentSessions).values({
        userId: Number(ctx.user.id),
        name: input.name,
        agentType: input.agentType,
        status: "running",
      });
      const id = Number(result[0].insertId);
      return { id, ...input, status: "running" as const };
    }),

  updateSession: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["running", "paused", "completed", "failed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = getDb();
      await db
        .update(agentSessions)
        .set({ status: input.status })
        .where(eq(agentSessions.id, input.id));
      return { ok: true };
    }),

  getRuns: publicQuery
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(agentRuns)
        .where(eq(agentRuns.sessionId, input.sessionId))
        .orderBy(agentRuns.stepOrder);
    }),

  runAgent: publicQuery
    .input(
      z.object({
        sessionId: z.number(),
        prompt: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = getDb();

      const [session] = await db
        .select()
        .from(agentSessions)
        .where(eq(agentSessions.id, input.sessionId));
      if (!session) throw new Error("Session not found");

      const steps = generateCoTSteps(session.agentType, input.prompt);
      const results: (typeof agentRuns.$inferSelect)[] = [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const start = Date.now();

        if (step.toolName && SIMULATED_TOOLS[step.toolName]) {
          try {
            const toolResult = await SIMULATED_TOOLS[step.toolName](input.prompt);
            step.toolResult = toolResult;
          } catch {
            step.toolResult = `Tool ${step.toolName} failed`;
          }
        }

        await delay(600);

        const insertResult = await db.insert(agentRuns).values({
          sessionId: input.sessionId,
          stepType: step.stepType,
          content: step.content,
          toolName: step.toolName || null,
          toolResult: step.toolResult || null,
          stepOrder: i + 1,
          latencyMs: Date.now() - start,
        });

        results.push({
          id: Number(insertResult[0].insertId),
          sessionId: input.sessionId,
          stepType: step.stepType,
          content: step.content,
          toolName: step.toolName || null,
          toolResult: step.toolResult || null,
          stepOrder: i + 1,
          latencyMs: Date.now() - start,
          createdAt: new Date(),
        });
      }

      await db
        .update(agentSessions)
        .set({ status: "completed" })
        .where(eq(agentSessions.id, input.sessionId));

      return { steps: results, status: "completed" };
    }),

  listPipelines: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = getDb();
    return db
      .select()
      .from(pipelines)
      .where(eq(pipelines.userId, Number(ctx.user.id)))
      .orderBy(desc(pipelines.createdAt));
  }),

  createPipeline: publicQuery
    .input(z.object({ name: z.string().min(1), stages: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = getDb();
      const result = await db.insert(pipelines).values({
        userId: Number(ctx.user.id),
        name: input.name,
        stages: input.stages,
        status: "idle",
        currentStage: 0,
      });
      return { id: Number(result[0].insertId), ...input, status: "idle" as const };
    }),

  runPipeline: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = getDb();
      await db
        .update(pipelines)
        .set({ status: "running", currentStage: 1 })
        .where(eq(pipelines.id, input.id));

      const stages = ["build", "test", "security-scan", "deploy", "monitor"];
      for (let i = 0; i < stages.length; i++) {
        await delay(1200);
        await db
          .update(pipelines)
          .set({ currentStage: i + 1 })
          .where(eq(pipelines.id, input.id));
      }

      await db
        .update(pipelines)
        .set({ status: "completed", currentStage: stages.length })
        .where(eq(pipelines.id, input.id));

      return { status: "completed" };
    }),

  deletePipeline: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(pipelines).where(eq(pipelines.id, input.id));
      return { ok: true };
    }),
});

function generateCoTSteps(
  agentType: string,
  prompt: string
): Array<{
  stepType: "think" | "tool_call" | "spawn_agent" | "final_answer" | "error";
  content: string;
  toolName?: string;
  toolResult?: string;
}> {
  const host = prompt.match(/[\w.-]+\.[a-z]{2,}/i)?.[0] || "target.local";
  const project = prompt.match(/(\w+)(?:\s+project)?/i)?.[1] || "app";

  switch (agentType) {
    case "builder":
      return [
        { stepType: "think", content: `Task: Build ${project}. Need to compile, test, bundle.` },
        { stepType: "tool_call", content: `Running build for ${project}...`, toolName: "build_project" },
        { stepType: "tool_call", content: `Executing test suite...`, toolName: "run_tests" },
        { stepType: "think", content: `Build passed. Tests green. Ready for security scan.` },
        { stepType: "final_answer", content: `Build complete. ${project} compiled, tested, optimized. Output: dist/` },
      ];
    case "security":
      return [
        { stepType: "think", content: `Security audit target: ${host}. Multi-vector scan.` },
        { stepType: "tool_call", content: `Port scanning ${host}...`, toolName: "scan_ports" },
        { stepType: "tool_call", content: `Checking SSL/TLS config...`, toolName: "check_ssl" },
        { stepType: "tool_call", content: `Auditing source code...`, toolName: "audit_code" },
        { stepType: "think", content: `Scan complete. Analyzing results...` },
        { stepType: "final_answer", content: `Security report for ${host}: TLS 1.3 active, ports scanned, code score 94/100. No critical issues.` },
      ];
    case "deployer":
      return [
        { stepType: "think", content: `Deploy ${project} to production. Verify build, upload, check health.` },
        { stepType: "tool_call", content: `Running final build check...`, toolName: "build_project" },
        { stepType: "tool_call", content: `Deploying to production...`, toolName: "deploy" },
        { stepType: "think", content: `Deployment successful. Verifying health...` },
        { stepType: "final_answer", content: `Deployed ${project} to production. Live and healthy.` },
      ];
    case "monitor":
      return [
        { stepType: "think", content: `Monitor ${host} health: uptime, latency, errors.` },
        { stepType: "tool_call", content: `Pinging ${host}...`, toolName: "nmap_scan" },
        { stepType: "tool_call", content: `DNS resolution check...`, toolName: "dns_enum" },
        { stepType: "think", content: `All services nominal. Response time <50ms.` },
        { stepType: "final_answer", content: `${host} is healthy. Uptime 99.9%. DNS stable. No anomalies.` },
      ];
    case "optimizer":
      return [
        { stepType: "think", content: `Optimize ${project}: bundle size, render perf, memory.` },
        { stepType: "tool_call", content: `Analyzing bundle composition...` },
        { stepType: "think", content: `Found optimization opportunities: lazy loading, tree-shaking.` },
        { stepType: "tool_call", content: `Applying optimizations...`, toolName: "build_project" },
        { stepType: "final_answer", content: `${project} optimized. Bundle reduced 34%. Render time improved 22%.` },
      ];
    default:
      return [
        { stepType: "think", content: `Processing: ${prompt}` },
        { stepType: "final_answer", content: `Task completed: ${prompt}` },
      ];
  }
}
