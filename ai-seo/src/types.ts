/**
 * SiteConfig is the one input object every generator reads. Keep it
 * literal — no computed fields. A manipulative config fails at
 * validate() time, before any generator runs.
 */

export interface SiteConfig {
  /** Fully-qualified canonical URL with trailing slash (e.g. "https://example.com/"). */
  url: string;

  /** Product / site name. 2-60 chars. */
  name: string;

  /** Short product tagline. Shown in <title> + OG + Twitter. 20-120 chars. */
  tagline: string;

  /**
   * One-paragraph description. Used in <meta name="description">, og:description,
   * twitter:description, llms.txt header, schema.org `description`. 60-320 chars.
   * Must match what a human reader sees on the landing page.
   */
  description: string;

  /** ISO language code, e.g. "en", "fr-FR". */
  language: string;

  /** Primary human-readable author name. */
  author: string;

  /** Repo / canonical source URL. If the project is private, use the product URL. */
  source: string;

  /** License identifier (SPDX, e.g. "MIT") OR a URL to the license. */
  license: string;

  /** Version string if the product is versioned, e.g. "2.0.2". Optional. */
  version?: string;

  /** Social / verified-same-as URLs. GitHub, Twitter, LinkedIn, Mastodon, etc. */
  sameAs?: string[];

  /**
   * Preview image for OG + Twitter cards. If a PWA, point at the 512 icon;
   * for production, use a 1200x630 generated preview.
   */
  image: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };

  /**
   * schema.org SoftwareApplication category and OS targets. Omit for non-software sites
   * (a `WebSite` + `Organization` pair is still generated).
   */
  software?: {
    /** e.g. "DeveloperApplication", "ProductivityApplication", "DesignApplication". */
    applicationCategory: string;
    applicationSubCategory?: string;
    /** Comma-separated OS targets, e.g. "Web, iOS, Android". */
    operatingSystem: string;
    /** Honest bullet list of features. Max 10 entries, each ≤ 200 chars. */
    featureList: string[];
    /** Price. "0" for free. */
    price: string;
    /** Currency code, e.g. "USD". Required if price is non-zero or if listed as InStock. */
    priceCurrency?: string;
  };

  /**
   * Audience framing. Who is this for? Used in llms.txt body + optional
   * schema.org Audience nodes. 1-5 audiences, each 20-160 chars.
   */
  audiences?: string[];

  /** llms.txt-specific purpose paragraph. If omitted, falls back to `description`. */
  purpose?: string;

  /** Install matrix rows for llms.txt. */
  installPaths?: Array<{
    label: string;
    forWho: string;
    how: string;
  }>;

  /** Public routes to include in sitemap.xml. Relative paths starting with "/". */
  routes?: Array<{
    path: string;
    changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
    lastmod?: string;
  }>;

  /** Security disclosure channels. */
  security: {
    /** Contacts, in order of preference. HTTPS URLs or mailto: links. */
    contact: string[];
    /** Expiry of this security.txt record. ISO 8601 date-time. */
    expires: string;
    /** Canonical URL for security.txt itself. */
    canonical: string;
    /** Policy URL (SECURITY.md). Optional. */
    policy?: string;
    /** Preferred language(s) for reports, e.g. "en, fr". */
    preferredLanguages?: string;
  };

  /**
   * schema.org Reviews / Ratings — BLOCK OBJECT. The generator refuses these
   * unless paired with verifiable reviews. See validate.ts for rules.
   */
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    /** Must be true. Set only if the reviews are actually visible on-page. */
    visibleOnPage: true;
  };

  /**
   * Optional FAQ for FAQPage JSON-LD. Only populate if the Q/A pairs are the
   * real content on the landing page — not hidden schema-only content.
   */
  faq?: Array<{
    q: string;
    a: string;
  }>;

  /**
   * humans.txt data.
   */
  humans?: {
    team: Array<{ role: string; name: string; contact?: string }>;
    thanks?: string[];
    stack?: string[];
  };
}

/** Output of a full generate run. All strings, no I/O. */
export interface GenerateResult {
  "llms.txt": string;
  "robots.txt": string;
  "sitemap.xml": string;
  "humans.txt": string;
  ".well-known/security.txt": string;
  /** Head block to paste between `<head>` tags. Includes meta + JSON-LD. */
  "head.html": string;
}
