import type { GenerateResult, SiteConfig } from "./types";
import { validate, validateRobotsRules } from "./validate";
import {
  generateLlmsTxt,
  generateRobotsTxt,
  generateSitemapXml,
  generateSecurityTxt,
  generateHumansTxt,
} from "./generators";
import { generateHead, generateMeta, generateJsonLd } from "./head";

export type { SiteConfig, GenerateResult } from "./types";
export { SeoManipulationError } from "./validate";
export {
  generateLlmsTxt,
  generateRobotsTxt,
  generateSitemapXml,
  generateSecurityTxt,
  generateHumansTxt,
  generateHead,
  generateMeta,
  generateJsonLd,
};

/**
 * Run the validator + all generators. Returns strings only — no I/O.
 * Pass the result to a file writer in your deploy pipeline, or to the CLI
 * which handles writing for you.
 */
export function generate(cfg: SiteConfig, opts: { robotsDisallow?: string[] } = {}): GenerateResult {
  validate(cfg);
  validateRobotsRules(opts.robotsDisallow);
  return {
    "llms.txt": generateLlmsTxt(cfg),
    "robots.txt": generateRobotsTxt(cfg, opts.robotsDisallow),
    "sitemap.xml": generateSitemapXml(cfg),
    "humans.txt": generateHumansTxt(cfg),
    ".well-known/security.txt": generateSecurityTxt(cfg),
    "head.html": generateHead(cfg),
  };
}
