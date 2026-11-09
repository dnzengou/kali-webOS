# Security Policy — Kali WebOS

## Supported versions

The main branch (deployed at https://cccytvbv5uiq6.kimi.page/) is the
supported version. Tagged releases are supported until the next major
release ships.

| Version | Supported |
|---|---|
| 2.0.x   | ✅ |
| < 2.0.0 | ❌ |

## Reporting a vulnerability

**Prefer private disclosure.**

- **GitHub Security Advisory** (preferred):
  https://github.com/dnzengou/kali-webOS/security/advisories/new
- **Email:** desire.yavro@gmail.com

Please include:

- A clear description of the issue and impact.
- Steps to reproduce.
- Affected URL(s), commit SHA, or release tag.
- Whether you believe the issue is already public.

**We will acknowledge receipt within 72 hours** and aim to ship a fix or
mitigation within 30 days for critical issues, 90 days for high/moderate.

## Scope

In scope:

- The hosted PWA at https://cccytvbv5uiq6.kimi.page/
- The source code in this repository
- The Docker image at `ghcr.io/dnzengou/kali-webos`
- The npm package `@aetherclaw/sdk`
- The browser extension, VS Code extension, Obsidian plugin in this repo

Out of scope:

- Third-party services referenced by the project (Kimi OAuth, etc.)
- Volumetric denial-of-service against the hosted demo
- Social engineering

## Acknowledgments

We maintain a public list of researchers who've responsibly disclosed
issues. If you'd prefer not to be listed, say so in your report.

<!-- To be populated as disclosures land. -->

## What to expect

- We treat reports as data, not threats. Thank you for your time.
- We won't take legal action against good-faith research that stays
  within the scope above.
- If a fix ships, we'll note it in the release changelog and (unless you
  asked otherwise) credit you by handle or name here.

## Related

- [security.txt](https://cccytvbv5uiq6.kimi.page/.well-known/security.txt)
- [SEO.md](SEO.md) — our broader public-surface posture
