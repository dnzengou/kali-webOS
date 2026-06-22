import { z } from "zod";

export const ToolNameSchema = z.enum([
  "scan_ports",
  "check_ssl",
  "whois_lookup",
  "nmap_scan",
  "dns_enum",
  "hash_gen",
  "build_project",
  "run_tests",
  "deploy",
  "audit_code",
]);

export type ToolName = z.infer<typeof ToolNameSchema>;

export interface ToolContext {
  abortSignal?: AbortSignal;
  fetch?: typeof fetch;
}

export type ToolFn = (input: string, ctx?: ToolContext) => Promise<string>;

export const SIMULATED_TOOLS: Record<ToolName, ToolFn> = {
  scan_ports: async (host) =>
    `Scanning ${host}...\nOpen ports: 22(SSH), 80(HTTP), 443(HTTPS), 3306(MySQL), 8080(HTTP-ALT)`,
  check_ssl: async (host) =>
    `SSL check for ${host}: TLS 1.3 enabled, cert valid, HSTS active`,
  whois_lookup: async (domain) =>
    `Domain: ${domain}\nRegistrar: NameCheap\nCreated: 2020-01-15\nExpires: 2026-01-15`,
  nmap_scan: async (target) =>
    `Nmap scan on ${target}:\n22/tcp open ssh\n80/tcp open http\n443/tcp open https`,
  dns_enum: async (domain) =>
    `DNS records for ${domain}:\nA: 104.21.45.2\nMX: mail.${domain}\nTXT: v=spf1 include:_spf.google.com`,
  hash_gen: async (input) => {
    const enc = new TextEncoder().encode(input);
    const md5 = Array.from(enc).slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const sha = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return `MD5(simulated): ${md5}\nSHA256: ${sha}`;
  },
  build_project: async (project) =>
    `Building ${project}...\n✓ TypeScript compile\n✓ Vite bundle\n✓ Assets optimized\nBuild complete: dist/`,
  run_tests: async (project) =>
    `Testing ${project}...\n✓ tests passed\n✓ 0 failed`,
  deploy: async (target) =>
    `Deploying to ${target}...\n✓ Uploading assets\n✓ Invalidating CDN\n✓ Health check passed`,
  audit_code: async (file) =>
    `Auditing ${file}...\n⚠ 2 warnings (unused vars)\n✓ No critical issues\nScore: 94/100`,
};

export function isToolName(name: string): name is ToolName {
  return ToolNameSchema.safeParse(name).success;
}

export async function runTool(
  name: ToolName,
  input: string,
  ctx?: ToolContext,
): Promise<string> {
  const fn = SIMULATED_TOOLS[name];
  if (!fn) throw new Error(`Unknown tool: ${name}`);
  if (ctx?.abortSignal?.aborted) throw new Error("Aborted");
  return fn(input, ctx);
}
