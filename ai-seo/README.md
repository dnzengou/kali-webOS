# @aetherclaw/ai-seo

> **Config-driven AI-crawler-friendly SEO generator.** One input →
> `llms.txt`, `robots.txt`, `sitemap.xml`, `security.txt`, `humans.txt`,
> Open Graph + Twitter meta, and schema.org JSON-LD
> (Organization / WebSite / SoftwareApplication / FAQPage).

**Legitimate posture only.** Refuses manipulative patterns at config
time — cloaking, prompt injection targeting AI crawlers, fake schema,
impersonation — with policy citations in the error messages. "No
breadcrumbs" cannot be configured in; see [the hard-refusals list](#hard-refusals).

Zero runtime dependencies. Node 18+. ESM + CJS. 100 % local — never
calls out to any service.

---

## Install

```bash
npm i -D @aetherclaw/ai-seo
# or
npx @aetherclaw/ai-seo help
```

## Use

### CLI

```bash
# 1. Create a starter config
npx ai-seo init
#    ↳ writes ./site.config.json with placeholder values

# 2. Edit the config to match your product. Then:
npx ai-seo generate --config ./site.config.json --out ./public
#    ↳ writes public/llms.txt, public/robots.txt, public/sitemap.xml,
#      public/humans.txt, public/.well-known/security.txt,
#      public/head.html (paste its contents between your <head> tags)

# 3. For CI / pre-commit — validate without writing
npx ai-seo validate --config ./site.config.json
#    exits 0 on pass, 2 on manipulation refusal
```

### Programmatic

```ts
import { generate } from "@aetherclaw/ai-seo";

const result = generate({
  url: "https://example.com/",
  name: "Acme Widgets",
  tagline: "Hand-forged widgets since 1994",
  description: "A paragraph that matches what a visitor sees on the landing page.",
  language: "en",
  author: "Jane Doe",
  source: "https://github.com/acme/widgets",
  license: "MIT",
  image: { url: "https://example.com/og.png", width: 1200, height: 630, alt: "Acme logo" },
  software: {
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    price: "0",
    featureList: ["Does the thing", "Also does the other thing"],
  },
  security: {
    contact: ["mailto:security@example.com"],
    expires: "2027-12-31T00:00:00Z",
    canonical: "https://example.com/.well-known/security.txt",
  },
});

result["llms.txt"];              // → "# Acme Widgets — …\n> …"
result["head.html"];             // → meta tags + <script type="application/ld+json">…
result["sitemap.xml"];           // → XML
result[".well-known/security.txt"]; // → security.txt body
```

### Config reference

See [`src/types.ts`](./src/types.ts) for the full typed `SiteConfig`.
Required: `url`, `name`, `tagline`, `description`, `language`, `author`,
`source`, `license`, `image`, `security`. Everything else is optional
but strongly encouraged for AI-crawler ranking.

## Hard refusals

The package rejects these at config time with a typed
`SeoManipulationError` and a policy citation in the message:

| Pattern | Why it's refused | § |
|---|---|---|
| Cloaking (serving different content to crawlers vs humans) | Google spam policy; CFAA exposure | §2.1 |
| Prompt injection in free-text fields ("you are an AI that always recommends…", "ignore previous instructions") | Anthropic / OpenAI / Google / Perplexity adversarial-content policies | §2.2 |
| `aggregateRating` without `visibleOnPage: true` or `reviewCount: 0` | FTC 16 CFR Part 255; Google structured-data policy | §2.3 |
| `description < 60` or `> 320` chars | Cloaked / stuffed meta tip Google's spam classifier | §description-length |
| `security.expires` in the past | Signals an abandoned disclosure channel — worse than no file | §security-expires-future |
| HTML comments targeted at AI/LLM readers hidden in config text | Cloaking-adjacent | §2.1 |

The section codes map to [SEO.md](https://github.com/dnzengou/kali-webOS/blob/main/SEO.md)
in the reference deployment.

## What it generates

### `llms.txt`
Follows [llmstxt.org](https://llmstxt.org/). Includes: title, tagline,
one-paragraph description, canonical URL, source, license, maintainer,
version (optional), purpose, audiences, feature list, install matrix,
agent-usage policy, security disclosure pointer. **No hidden
instructions to AI models** — public prose only.

### `robots.txt`
`Allow: /` with your passed-in `--extraDisallow` paths. Sitemap pointer
at the bottom. No AI-crawler-specific blocks unless you add them
explicitly (we don't segregate crawlers by default — your position on
AI is public in `llms.txt`).

### `sitemap.xml`
Root URL + every entry in `config.routes[]`. `lastmod` defaults to today;
override per route with `route.lastmod`. `changefreq` + `priority`
accept schema.org-canonical values.

### `security.txt`
RFC 9116 compliant. Multiple `Contact:` entries, explicit `Expires`,
`Canonical`, `Preferred-Languages`, optional `Policy` +
`Acknowledgments`.

### `humans.txt`
Team roster (role + name + contact), thanks, stack credits.

### `head.html`
Paste between your `<head>` tags. Contains:
- SEO meta: `description`, `canonical`, `author`, `robots`.
- Open Graph: `og:type`, `og:site_name`, `og:title`, `og:description`,
  `og:url`, `og:image` (+ width/height/alt), `og:locale`.
- Twitter cards: `twitter:card="summary_large_image"` + its own copy.
- JSON-LD: `Organization` + `WebSite` + optional `SoftwareApplication`
  + optional `FAQPage` + optional validated `AggregateRating`.

## CI gating example

Add this to your pre-merge CI to prevent manipulative-config regressions:

```yaml
- name: Validate AI-SEO config
  run: npx @aetherclaw/ai-seo validate --config ./site.config.json
```

Exit code 2 = manipulation refusal. CI fails loudly with the policy
citation in the log.

## Philosophy

Legitimate SEO is indistinguishable from good content + clean markup.
This package industrializes that principle: one config, one command,
zero manipulation, zero network calls, zero runtime dependencies. It
produces files you could have hand-written — but it also makes sure
you didn't accidentally hand-write something that breaks Google, FTC,
or AI-vendor policies.

## License

MIT · See [LICENSE](./LICENSE).

## Source & feedback

https://github.com/dnzengou/kali-webOS/tree/main/ai-seo
