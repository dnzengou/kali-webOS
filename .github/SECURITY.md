# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 2.0.x   | Yes       |
| < 2.0   | No        |

## Reporting a Vulnerability

Report vulnerabilities privately via GitHub Security Advisories:
**https://github.com/OWNER/kali-webos/security/advisories/new**

Or email **security@kali-webos.io** (PGP available on request).

Please include:
- Impact and reproduction steps
- Affected component (web, SDK, extension, TWA APK, Docker image)
- Affected version (git SHA or tag)

We aim to acknowledge reports within **72 hours** and ship a fix within
**14 days** for high/critical issues.

## Scope

In scope:
- Web app (`src/`, `api/`)
- `@aetherclaw/sdk` package
- Browser extension, VS Code extension, Obsidian plugin
- Docker image (`ghcr.io/<owner>/kali-webos`)
- Bubblewrap TWA APK (`dist-apk/`)

Out of scope:
- Simulated pentest tools in `src/apps/security/` (educational, no real network I/O)
- The `AutoClawDemo` app (pure client-side replay)
- Self-XSS via user input in local-only apps (StickyNotes, Notes, Terminal history)

## Hardening Reference

- AES-256-GCM password vault encryption (`api/lib/crypto.ts`, `VAULT_KEY` env)
- In-memory sliding-window rate limit on `/api/*` (120 req / 60 s / IP)
- Strict CSP on browser extension (`script-src 'self'`, no `unsafe-eval`)
- Distroless nonroot Docker image with dropped caps, read-only FS
- Weekly Dependabot + CodeQL + Trivy FS + container scans
