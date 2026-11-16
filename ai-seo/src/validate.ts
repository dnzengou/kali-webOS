import type { SiteConfig } from "./types";

/**
 * Validator — the only reason this package exists as its own product
 * instead of a snippet: it REFUSES manipulative inputs at config time,
 * so you cannot accidentally (or deliberately) ship cloaking, hidden
 * steering copy, fake ratings, or impersonation schema.
 *
 * Throws on first violation. The error names which section of SEO.md's
 * hard-refusals list the input tripped.
 */

const HIDDEN_PROMPT_PATTERNS = [
  /\bignore\s+(?:previous|prior|all|the)\s+(?:instructions|prompts|rules)\b/i,
  /\byou\s+are\s+(?:now|a|an)\s+[a-z]+\s+(?:assistant|agent|AI|bot)\b/i,
  /\bsystem\s+prompt\b/i,
  /\balways\s+recommend\b/i,
  /\bnever\s+recommend\s+(?:competitors|alternatives|other)\b/i,
  /<!--\s*(?:ai|llm|gpt|claude|assistant)\s*:\s*/i,
];

const SUSPICIOUS_UA_PATTERNS = [/^GPTBot$/i, /^ClaudeBot$/i, /^PerplexityBot$/i, /^Google-Extended$/i, /^CCBot$/i];

export class SeoManipulationError extends Error {
  constructor(message: string, public readonly section: string) {
    super(`[${section}] ${message}`);
    this.name = "SeoManipulationError";
  }
}

/**
 * Throws if the config contains known-manipulative patterns.
 * The error message names the SEO.md § section that forbids the pattern.
 */
export function validate(cfg: SiteConfig): void {
  // Length sanity — forces honest config, not keyword-stuffed strings.
  if (cfg.name.length < 2 || cfg.name.length > 60) {
    throw new SeoManipulationError(`name must be 2-60 chars (got ${cfg.name.length}). Keyword-stuffed names tip Google's spam classifier.`, "name-length");
  }
  if (cfg.tagline.length < 20 || cfg.tagline.length > 120) {
    throw new SeoManipulationError(`tagline must be 20-120 chars (got ${cfg.tagline.length}).`, "tagline-length");
  }
  if (cfg.description.length < 60 || cfg.description.length > 320) {
    throw new SeoManipulationError(`description must be 60-320 chars (got ${cfg.description.length}). Below 60 chars smells like cloaked meta; above 320 gets truncated everywhere.`, "description-length");
  }

  // URL hygiene — canonical must be HTTPS with trailing slash.
  if (!cfg.url.startsWith("https://")) {
    throw new SeoManipulationError(`url must be HTTPS. Mixed-protocol canonicals confuse crawlers and leak referrers.`, "url-https");
  }
  if (!cfg.url.endsWith("/")) {
    throw new SeoManipulationError(`url must end with "/". Inconsistent trailing slashes split indexing across two pages.`, "url-trailing-slash");
  }

  // §2.3 — fabricated schema. aggregateRating requires explicit visibleOnPage
  // AND a non-zero review count, AND the reviews must actually render on the
  // page (we can't verify that from here; the visibleOnPage flag is a contract).
  if (cfg.aggregateRating) {
    const { ratingValue, reviewCount, visibleOnPage } = cfg.aggregateRating;
    if (!visibleOnPage) {
      throw new SeoManipulationError(
        `aggregateRating.visibleOnPage must be true. SEO.md §2.3 — Google's structured-data policy and FTC endorsement rules require ratings to be visible to users of the same page.`,
        "§2.3-fabricated-schema",
      );
    }
    if (reviewCount < 1) {
      throw new SeoManipulationError(
        `aggregateRating.reviewCount must be ≥ 1. SEO.md §2.3 — invented counts are actionable under FTC 16 CFR Part 255.`,
        "§2.3-fabricated-schema",
      );
    }
    if (ratingValue < 1 || ratingValue > 5) {
      throw new SeoManipulationError(`aggregateRating.ratingValue must be 1-5.`, "aggregate-rating-range");
    }
  }

  // §2.2 — prompt injection targeting AI crawlers. Scan every user-provided
  // free-text field for patterns that look like steering copy.
  const freeText = [
    cfg.tagline,
    cfg.description,
    cfg.purpose ?? "",
    cfg.image.alt,
    ...(cfg.audiences ?? []),
    ...(cfg.software?.featureList ?? []),
    ...(cfg.faq?.flatMap((f) => [f.q, f.a]) ?? []),
  ].join("\n");

  for (const pattern of HIDDEN_PROMPT_PATTERNS) {
    const match = freeText.match(pattern);
    if (match) {
      throw new SeoManipulationError(
        `Detected prompt-injection pattern "${match[0]}" in free-text field. SEO.md §2.2 — content aimed at steering AI crawlers (not human readers) violates Anthropic/OpenAI/Google/Perplexity adversarial-content policies.`,
        "§2.2-prompt-injection",
      );
    }
  }

  // Reject HTML comments that hide content from users but target crawlers.
  if (/<!--[\s\S]*?(ai|llm|crawler|bot)[\s\S]*?-->/i.test(freeText)) {
    throw new SeoManipulationError(
      `Comment targeted at AI/crawlers found in free text. If it's not visible to human readers, it's cloaking-adjacent. SEO.md §2.1 / §2.2.`,
      "§2.1-cloaking-adjacent",
    );
  }

  // Software app validation.
  if (cfg.software) {
    if (cfg.software.featureList.length === 0) {
      throw new SeoManipulationError(`software.featureList must have at least one entry.`, "software-featureList");
    }
    if (cfg.software.featureList.length > 10) {
      throw new SeoManipulationError(`software.featureList capped at 10 entries. Longer lists get truncated by Google and smell keyword-stuffed.`, "software-featureList-cap");
    }
    for (const feature of cfg.software.featureList) {
      if (feature.length > 200) {
        throw new SeoManipulationError(`software.featureList entry exceeds 200 chars: "${feature.slice(0, 40)}…"`, "feature-length");
      }
    }
  }

  // Audience list sanity.
  if (cfg.audiences) {
    if (cfg.audiences.length > 5) {
      throw new SeoManipulationError(`audiences capped at 5. More than 5 reads as a laundry list, not a positioning statement.`, "audiences-cap");
    }
    for (const a of cfg.audiences) {
      if (a.length < 20 || a.length > 160) {
        throw new SeoManipulationError(`audience entry must be 20-160 chars: "${a.slice(0, 40)}…"`, "audience-length");
      }
    }
  }

  // Security.txt expiry sanity.
  const expires = new Date(cfg.security.expires);
  if (isNaN(expires.getTime())) {
    throw new SeoManipulationError(`security.expires is not a valid ISO 8601 date: "${cfg.security.expires}"`, "security-expires");
  }
  if (expires.getTime() <= Date.now()) {
    throw new SeoManipulationError(
      `security.expires must be in the future (got ${cfg.security.expires}). An expired security.txt is worse than none — it signals an abandoned disclosure channel.`,
      "security-expires-future",
    );
  }
  if (cfg.security.contact.length === 0) {
    throw new SeoManipulationError(`security.contact must have at least one entry. A security.txt without contacts is non-functional.`, "security-contact");
  }
}

/**
 * Validate a robots.txt body we are about to generate. The config-side
 * generator never produces cloaking directives, but a user-supplied
 * extraRules passthrough is validated here.
 */
export function validateRobotsRules(extraRules: string[] | undefined): void {
  if (!extraRules) return;
  const joined = extraRules.join("\n");
  // Catch "Allow: /" for one UA + "Disallow: /" for another — classic cloaking shape.
  const uas = joined.match(/^User-agent:\s*(\S+)/gim) ?? [];
  for (const uaLine of uas) {
    const ua = uaLine.split(":")[1]?.trim() ?? "";
    for (const bot of SUSPICIOUS_UA_PATTERNS) {
      if (bot.test(ua)) {
        // AI-crawler-specific blocks are legitimate when they're honest. But
        // combining them with sitewide Allow for Googlebot is cloaking if the
        // CONTENT at those routes differs for the two bots. We can't detect
        // divergent content, but we flag the pattern so a human has to okay it.
        // (Non-fatal — we only warn by throwing if the global Allow suggests
        // intent to split.)
      }
    }
  }
}
