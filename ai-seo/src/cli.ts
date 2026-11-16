#!/usr/bin/env node
/**
 * ai-seo CLI — the productized surface.
 *
 * Commands:
 *   ai-seo init [--out ./site.config.json]
 *     Writes a starter config with placeholder values + inline comments.
 *
 *   ai-seo generate --config ./site.config.json --out ./public
 *     Validates the config, generates all 5 files + head.html, writes them.
 *     Exits non-zero on manipulation refusals (perfect for CI gating).
 *
 *   ai-seo validate --config ./site.config.json
 *     Runs the validator only. For pre-commit hooks.
 *
 * Zero runtime deps — pure Node 18+ stdlib.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { generate } from "./index";
import { SeoManipulationError } from "./validate";
import type { SiteConfig } from "./types";

const USAGE = `ai-seo — AI-crawler-friendly SEO generator (@aetherclaw/ai-seo)

Usage:
  ai-seo init     [--out ./site.config.json] [--force]
  ai-seo generate --config ./site.config.json [--out ./public]
  ai-seo validate --config ./site.config.json
  ai-seo help

Exit codes:
  0  success
  1  usage error
  2  manipulation refusal (see SEO.md §2 for the hard-refusals list)
  3  I/O error
`;

function parseArgs(argv: string[]): { cmd: string; flags: Record<string, string | true> } {
  const [cmd, ...rest] = argv;
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a?.startsWith("--")) continue;
    const key = a.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i++;
    }
  }
  return { cmd: cmd ?? "help", flags };
}

async function cmdInit(flags: Record<string, string | true>): Promise<number> {
  const out = typeof flags.out === "string" ? flags.out : "./site.config.json";
  if (existsSync(out) && flags.force !== true) {
    console.error(`Refusing to overwrite ${out}. Pass --force to replace.`);
    return 1;
  }
  const template: SiteConfig = {
    url: "https://example.com/",
    name: "My Product",
    tagline: "A one-line pitch of what this does — 20 to 120 chars.",
    description:
      "A paragraph that matches what a human reader sees on the landing page. Between 60 and 320 characters. Honest, no keyword stuffing.",
    language: "en",
    author: "Maintainer Name",
    source: "https://github.com/you/repo",
    license: "MIT",
    version: "0.1.0",
    sameAs: ["https://github.com/you"],
    image: {
      url: "https://example.com/og.png",
      width: 1200,
      height: 630,
      alt: "Product name — one-line pitch",
    },
    software: {
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      price: "0",
      featureList: [
        "Thing the product does, visible on the landing page",
        "Second thing it does, also visible on the landing page",
      ],
    },
    audiences: [
      "Primary audience — who this is for and what they get out of it (20-160 chars)",
    ],
    purpose: "Optional longer purpose paragraph for llms.txt body.",
    installPaths: [{ label: "Hosted", forWho: "Anyone", how: "Open the URL" }],
    routes: [{ path: "/docs", changefreq: "monthly", priority: 0.8 }],
    security: {
      contact: ["mailto:security@example.com"],
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      canonical: "https://example.com/.well-known/security.txt",
      policy: "https://github.com/you/repo/blob/main/SECURITY.md",
      preferredLanguages: "en",
    },
    humans: {
      team: [{ role: "maintainer", name: "Maintainer Name" }],
      stack: ["TypeScript", "React"],
    },
  };
  await mkdir(dirname(resolve(out)), { recursive: true });
  await writeFile(out, JSON.stringify(template, null, 2) + "\n", "utf8");
  console.log(`✓ wrote ${out}`);
  console.log(`Next: edit the config, then run  ai-seo generate --config ${out}`);
  return 0;
}

async function loadConfig(path: string): Promise<SiteConfig> {
  const raw = await readFile(path, "utf8");
  try {
    return JSON.parse(raw) as SiteConfig;
  } catch (e) {
    throw new Error(`Config file is not valid JSON: ${path}\n  ${(e as Error).message}`, { cause: e });
  }
}

async function cmdGenerate(flags: Record<string, string | true>): Promise<number> {
  const cfgPath = typeof flags.config === "string" ? flags.config : "./site.config.json";
  const outDir  = typeof flags.out === "string" ? flags.out : "./public";

  let cfg: SiteConfig;
  try {
    cfg = await loadConfig(cfgPath);
  } catch (e) {
    console.error(`[I/O] ${(e as Error).message}`);
    return 3;
  }

  let result;
  try {
    result = generate(cfg);
  } catch (e) {
    if (e instanceof SeoManipulationError) {
      console.error(`[refused] ${e.message}`);
      console.error(`See SEO.md §${e.section.replace(/^§/, "")} for why this pattern is blocked.`);
      return 2;
    }
    console.error(`[validation] ${(e as Error).message}`);
    return 1;
  }

  await mkdir(outDir, { recursive: true });
  await mkdir(resolve(outDir, ".well-known"), { recursive: true });

  const writes: Array<[string, string]> = Object.entries(result).filter(
    ([name]) => name !== "head.html",
  );
  for (const [name, contents] of writes) {
    const dest = resolve(outDir, name);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, contents, "utf8");
    console.log(`✓ wrote ${dest}`);
  }
  // head.html goes next to outDir, not inside it — authors paste it manually
  // into their index.html. We emit it as a sibling for easy copy-paste.
  const headPath = resolve(outDir, "head.html");
  await writeFile(headPath, result["head.html"], "utf8");
  console.log(`✓ wrote ${headPath}  (paste its contents into your <head>)`);

  return 0;
}

async function cmdValidate(flags: Record<string, string | true>): Promise<number> {
  const cfgPath = typeof flags.config === "string" ? flags.config : "./site.config.json";
  let cfg: SiteConfig;
  try {
    cfg = await loadConfig(cfgPath);
  } catch (e) {
    console.error(`[I/O] ${(e as Error).message}`);
    return 3;
  }
  try {
    generate(cfg); // validate() runs first; we discard the result
    console.log(`✓ ${cfgPath} passes validation.`);
    return 0;
  } catch (e) {
    if (e instanceof SeoManipulationError) {
      console.error(`[refused] ${e.message}`);
      return 2;
    }
    console.error(`[validation] ${(e as Error).message}`);
    return 1;
  }
}

async function main(): Promise<number> {
  const { cmd, flags } = parseArgs(process.argv.slice(2));
  switch (cmd) {
    case "init":
      return cmdInit(flags);
    case "generate":
      return cmdGenerate(flags);
    case "validate":
      return cmdValidate(flags);
    case "help":
    case "--help":
    case "-h":
      console.log(USAGE);
      return 0;
    default:
      console.error(`Unknown command: ${cmd}`);
      console.error(USAGE);
      return 1;
  }
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(e);
  process.exit(3);
});
