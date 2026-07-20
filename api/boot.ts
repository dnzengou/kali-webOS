import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT     = 120;
const RATE_MAP_MAX   = 10_000;
const rateMap        = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request, remoteAddr?: string): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (fwd) return fwd;
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return remoteAddr ?? "unknown";
}

function sweepRateMap(now: number): void {
  if (rateMap.size < RATE_MAP_MAX) return;
  for (const [k, v] of rateMap) if (now > v.resetAt) rateMap.delete(k);
}

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.use("/api/*", async (c, next) => {
  const now = Date.now();
  sweepRateMap(now);
  const ip = getClientIp(c.req.raw, c.env?.incoming?.socket?.remoteAddress);
  let entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateMap.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return c.json({ error: "Too Many Requests" }, 429);
  }
  c.header("X-RateLimit-Limit",     String(RATE_LIMIT));
  c.header("X-RateLimit-Remaining", String(Math.max(0, RATE_LIMIT - entry.count)));
  return next();
});

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
