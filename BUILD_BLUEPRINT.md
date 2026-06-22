# Kali WebOS - AetherClaw Edition
## Build Blueprint

**Version**: 2.0.0
**Date**: 2026-06-22
**Stack**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + tRPC + Drizzle ORM + Hono + MySQL
**Total Apps**: 59 across 9 categories
**Docs**: [README.md](README.md) · [HOWTO.md](HOWTO.md) · [DISTRIBUTION.md](DISTRIBUTION.md) · this blueprint

---

## 1. Architecture

### 1.1 Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 19 + TypeScript | UI rendering |
| Build | Vite v7.2.4 | Bundling, HMR |
| Styling | Tailwind CSS v3.4.19 | Utility-first CSS |
| Components | shadcn/ui (40+) | Base UI primitives |
| State | Zustand | Window manager, global state |
| HTTP | tRPC client | Type-safe API calls |
| Wallpaper | Zero-dep `<canvas>` matrix rain | Animated desktop background (replaced Three.js, 2026-06-13) |
| Routing | react-router v7 | Page routing |

### 1.2 Backend
| Layer | Technology | Purpose |
|---|---|---|
| Server | Hono | HTTP server |
| API | tRPC 11.x | Type-safe RPC |
| ORM | Drizzle ORM | Database queries |
| DB | MySQL | Persistent storage |
| Auth | OAuth 2.0 + JWT | User sessions |
| Transformer | superjson | Date serialization |

### 1.3 Full Directory Tree
```
/mnt/agents/output/app/
├── public/                          # Static assets
│   ├── manifest.json                # PWA manifest
│   ├── sw.js                        # Service worker
│   └── icon-{72,96,128,144,192,512}.png  # PWA icons
├── src/
│   ├── apps/                        # 59 application modules
│   │   ├── index.tsx                # Lazy-load router for all apps
│   │   ├── registry.ts              # App definitions (59 entries, 9 categories)
│   │   ├── Terminal.tsx             # CLI with simulated commands
│   │   ├── Files.tsx                # File manager with tree view
│   │   ├── Monitor.tsx              # CPU/RAM/process monitoring
│   │   ├── Settings.tsx             # System preferences
│   │   ├── Calculator.tsx           # Scientific calculator
│   │   ├── Calendar.tsx             # Calendar + events
│   │   ├── Editor.tsx               # Text editor
│   │   ├── StickyNotes.tsx          # Note widgets
│   │   ├── Todo.tsx                 # Task management
│   │   ├── Clock.tsx                # Clock + alarm + timer
│   │   ├── agent/                   # AetherClaw agent apps
│   │   │   ├── AgentChat.tsx        # CoT agent chat interface
│   │   │   ├── Pipeline.tsx         # CI/CD pipeline visualizer
│   │   │   ├── CoTTrace.tsx         # Chain-of-thought trace viewer
│   │   │   └── AgentMon.tsx         # Agent health dashboard
│   │   ├── security/                # 12 security tools
│   │   │   ├── Nmap.tsx             # Port scanner (simulated)
│   │   │   ├── PassGen.tsx          # Password generator
│   │   │   ├── HashGen.tsx          # MD5/SHA256 generator
│   │   │   ├── Base64.tsx           # Base64 encode/decode
│   │   │   ├── AttackMap.tsx        # Cyber attack world map
│   │   │   ├── SSLScan.tsx          # SSL/TLS scanner
│   │   │   ├── Whois.tsx            # WHOIS lookup
│   │   │   ├── DnsLookup.tsx        # DNS record lookup
│   │   │   ├── MacLookup.tsx        # MAC address lookup
│   │   │   ├── CveLookup.tsx        # CVE database search
│   │   │   ├── SubFinder.tsx        # Subdomain enumeration
│   │   │   └── XssScan.tsx          # XSS vulnerability scanner
│   │   ├── internet/                # 8 internet tools
│   │   │   ├── Browser.tsx          # Web browser (iframe)
│   │   │   ├── Email.tsx            # Email client UI
│   │   │   ├── Chat.tsx             # IRC chat client
│   │   │   ├── Ftp.tsx              # FTP client UI
│   │   │   ├── Rss.tsx              # RSS feed reader
│   │   │   ├── NetTools.tsx         # Ping, traceroute
│   │   │   ├── Vpn.tsx              # VPN connection UI
│   │   │   └── Torrent.tsx          # Torrent client UI
│   │   ├── productivity/            # 7 productivity apps
│   │   │   ├── Notes.tsx            # Rich text notes
│   │   │   ├── Spreadsheet.tsx      # Spreadsheet editor
│   │   │   ├── DocViewer.tsx        # PDF viewer
│   │   │   ├── PassManager.tsx      # Password vault
│   │   │   ├── Whiteboard.tsx       # Drawing canvas
│   │   │   ├── Contacts.tsx         # Contact manager
│   │   │   └── Bookmarks.tsx        # Bookmark manager
│   │   ├── media/                   # 8 media apps
│   │   │   ├── Music.tsx            # Music player
│   │   │   ├── Video.tsx            # Video player
│   │   │   ├── ImageViewer.tsx      # Image viewer
│   │   │   ├── PhotoEditor.tsx      # Photo editor
│   │   │   ├── Recorder.tsx         # Voice recorder
│   │   │   ├── ScreenRec.tsx        # Screen recorder
│   │   │   ├── Converter.tsx        # Media format converter
│   │   │   └── Camera.tsx           # Camera app
│   │   ├── dev/                     # 10 developer tools
│   │   │   ├── CodeEditor.tsx       # Code editor
│   │   │   ├── JsonFmt.tsx          # JSON formatter/validator
│   │   │   ├── Regex.tsx            # Regex tester
│   │   │   ├── Markdown.tsx         # Markdown preview
│   │   │   ├── Git.tsx              # Git interface
│   │   │   ├── ApiTest.tsx          # API testing tool
│   │   │   ├── ColorPick.tsx        # Color picker
│   │   │   ├── Ascii.tsx            # ASCII art generator
│   │   │   ├── QrCode.tsx           # QR code generator
│   │   │   └── Diff.tsx             # Text diff checker
│   │   └── games/                   # 8 games
│   │       ├── Snake.tsx            # Snake game
│   │       ├── Tetris.tsx           # Tetris
│   │       ├── G2048.tsx            # 2048 puzzle
│   │       ├── Mines.tsx            # Minesweeper
│   │       ├── TicTacToe.tsx        # Tic-Tac-Toe
│   │       ├── Chess.tsx            # Chess (simulated AI)
│   │       ├── Pong.tsx             # Pong classic
│   │       └── Sudoku.tsx           # Sudoku puzzle
│   ├── components/
│   │   ├── os/                      # OS chrome components
│   │   │   ├── Window.tsx           # Draggable window chrome
│   │   │   ├── TopBar.tsx           # Top bar with clock/menu
│   │   │   ├── Dock.tsx             # Bottom dock launcher
│   │   │   ├── AppLauncher.tsx      # Full app grid launcher
│   │   │   └── LoginScreen.tsx      # Auth/login screen
│   │   └── ui/                      # shadcn/ui components (40+)
│   ├── hooks/
│   │   └── useAuth.ts               # Authentication hook
│   ├── providers/
│   │   └── trpc.tsx                 # tRPC client provider
│   ├── store/
│   │   └── useOsStore.ts            # Zustand window manager store
│   ├── pages/
│   │   ├── Home.tsx                 # Desktop + canvas matrix-rain wallpaper
│   │   └── Login.tsx                # Login page
│   ├── App.tsx                      # Root component + routing
│   ├── main.tsx                     # Entry point (React 19 createRoot)
│   └── index.css                    # Global styles
├── api/
│   ├── router.ts                    # tRPC router registry (11 routers)
│   ├── middleware.ts                # tRPC procedures (public, authed)
│   ├── context.ts                   # Request context with user
│   ├── boot.ts                      # Hono server bootstrap
│   ├── lib/                         # Framework internals
│   ├── kimi/                        # Kimi OAuth SDK
│   └── routers/                     # tRPC router modules
│       ├── agent.ts                 # AetherClaw CoT agent router
│       ├── file.ts                  # File CRUD
│       ├── note.ts                  # Notes CRUD
│       ├── todo.ts                  # Todo CRUD
│       ├── event.ts                 # Events CRUD
│       ├── bookmark.ts             # Bookmarks CRUD
│       ├── contact.ts              # Contacts CRUD
│       ├── password.ts             # Password vault CRUD
│       └── score.ts                # Game scores CRUD
├── db/
│   ├── schema.ts                    # 12 Drizzle ORM table definitions
│   ├── relations.ts                 # Table relations
│   ├── seed.ts                      # Database seeding
│   └── migrations/                  # Generated migrations
├── contracts/                       # Shared frontend/backend types
├── index.html                       # Entry HTML (PWA tags)
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind theme
├── drizzle.config.ts                # Drizzle ORM config
└── .env                             # Environment variables
```

---

## 2. Database Schema

### 2.1 Tables (12 total)

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | OAuth users | id, unionId, name, email, avatar, role |
| `files` | File system | id, userId, name, path, content, type, parentId |
| `notes` | Sticky notes | id, userId, title, content, pinned |
| `todos` | Task items | id, userId, text, completed |
| `events` | Calendar events | id, userId, title, eventDate, eventTime |
| `bookmarks` | URL bookmarks | id, userId, title, url, folder |
| `contacts` | Address book | id, userId, name, email, phone, company |
| `passwords` | Password vault | id, userId, site, username, password, url |
| `scores` | Game high scores | id, userId, game, score, difficulty |
| `agent_sessions` | Agent runs | id, userId, name, agentType, status |
| `agent_runs` | CoT reasoning steps | id, sessionId, stepType, content, toolName, toolResult, stepOrder, latencyMs |
| `pipelines` | CI/CD pipelines | id, userId, name, stages, status, currentStage |

### 2.2 Agent CoT Step Types
- `think` - Reasoning step
- `tool_call` - Tool invocation (scan_ports, check_ssl, build_project, etc.)
- `spawn_agent` - Sub-agent delegation
- `final_answer` - Conclusion
- `error` - Failure step

### 2.3 Simulated Agent Tools (10 tools)
`scan_ports`, `check_ssl`, `whois_lookup`, `nmap_scan`, `dns_enum`, `hash_gen`, `build_project`, `run_tests`, `deploy`, `audit_code`

---

## 3. Backend Routers (11 tRPC routers)

| Router | Endpoints | Description |
|---|---|---|
| `ping` | query | Health check |
| `auth` | query + mutation | OAuth login/logout, session |
| `file` | CRUD | File manager backend |
| `note` | CRUD | Notes backend |
| `todo` | CRUD | Todo backend |
| `event` | CRUD | Calendar events backend |
| `bookmark` | CRUD | Bookmark backend |
| `contact` | CRUD | Contact manager backend |
| `password` | CRUD | Password vault backend |
| `score` | CRUD | Game scores backend |
| `agent` | 10 endpoints | AetherClaw agent orchestration |

### Agent Router Endpoints
- `listSessions` - Get user's agent sessions
- `createSession` - Create new agent session
- `updateSession` - Update session status
- `getRuns` - Get CoT steps for session
- `runAgent` - Execute agent with CoT reasoning
- `listPipelines` - Get CI/CD pipelines
- `createPipeline` - Create pipeline
- `runPipeline` - Execute pipeline (5 stages)
- `deletePipeline` - Remove pipeline

---

## 4. Window Manager

### State (Zustand store)
```typescript
interface WindowState {
  id: string; appId: string; title: string;
  x: number; y: number; width: number; height: number;
  zIndex: number; isMinimized: boolean; isMaximized: boolean;
}
```

### Actions
- `openWindow(appId)` - Spawn app window
- `closeWindow(id)` - Destroy window
- `focusWindow(id)` - Bring to front (z-index ++)
- `minimizeWindow(id)` - Collapse to dock
- `maximizeWindow(id)` - Full viewport
- `moveWindow(id, x, y)` - Drag reposition
- `resizeWindow(id, w, h)` - Resize

### Features
- Draggable title bar
- Focus-on-click z-index management
- Minimize/Maximize/Close buttons
- Restore to previous position after maximize

---

## 5. AetherClaw CoT Multi-Agent Integration

### 5.1 Architecture
Browser-based CoT engine. Server simulates reasoning chain with tool execution. No Rust runtime required - full TypeScript implementation.

### 5.2 Agent Types
| Agent | Tools | Use Case |
|---|---|---|
| Builder | build_project, run_tests | Compile, test, bundle |
| Security | scan_ports, check_ssl, audit_code | Vulnerability scanning |
| Deployer | build_project, deploy | CI/CD deployment |
| Monitor | nmap_scan, dns_enum | Health monitoring |
| Optimizer | build_project | Performance tuning |

### 5.3 CoT Execution Flow
1. User sends prompt
2. Session created in DB
3. `generateCoTSteps()` produces reasoning chain
4. Each step: insert to agent_runs, execute tool if needed
5. Final answer returned, session marked complete

### 5.4 Pipeline Stages
Build -> Test -> Security Scan -> Deploy -> Monitor

---

## 6. PWA / SDK / Distribution Matrix (v2.0.0 — Multi-target + Evolve)

**Ten** independent distribution channels share one source tree. All ship native ARM64 + x86_64 where applicable.

| Target | Tech | Output | Size | ARM64 | Source |
|---|---|---|---|---|---|
| PWA | Service worker + manifest | Installable web app | ~200 KB shell | ✅ | `public/manifest.json`, `public/sw.js` |
| Desktop (Win/Mac/Linux) | Tauri 2.0 + Rust | `.msi`, `.exe`, `.dmg`, `.app`, `.deb`, `.rpm`, `.AppImage` | 8–15 MB | ✅ native | `src-tauri/` |
| Android APK (full) | Tauri Mobile + Rust + NDK | `.apk`, `.aab` | 10–18 MB | ✅ native | `src-tauri/` |
| Android APK (lightweight) | Bubblewrap (TWA) | `.apk`, `.aab` | ~200 KB shell | ✅ | `dist-apk/twa-manifest.json` |
| iOS | Tauri Mobile + Swift | `.ipa` | 10–18 MB | ✅ native | `src-tauri/` |
| Container | Docker multi-arch | OCI image at `ghcr.io/<owner>/kali-webos` | ~80 MB compressed | ✅ buildx | `Dockerfile`, `docker-compose.yml` |
| NPM SDK | `tsup` ESM+CJS | `@aetherclaw/sdk` on npmjs.com | ~12 KB gzip | n/a | `sdk/` |
| **Browser extension** (MV3) | esbuild | `.zip` (Chrome/Edge/Firefox) | ~25 KB | n/a | `extension/` |
| **VS Code extension** | esbuild + vsce | `.vsix` | ~30 KB | n/a | `vscode-extension/` |
| **Obsidian plugin** | esbuild | `.zip` (desktop + mobile) | ~25 KB | ✅ | `obsidian-plugin/` |
| **CLI binary** | esbuild | `@aetherclaw/cli` on npmjs.com | ~15 KB gzip | n/a | `cli/` |

### 6.1 PWA
- Display: `standalone`, theme `#9b59b6`, icons 72–512
- Shortcuts: Terminal, Agent Chat
- SW: precache + stale-while-revalidate + offline SPA fallback + push-ready

### 6.2 Tauri Desktop & Mobile
- Config: `src-tauri/tauri.conf.json` — strict CSP, frozen prototypes, scoped FS protocol
- Capabilities: `src-tauri/capabilities/default.json` — minimum permission surface (no `shell:execute`, FS scoped to `$APPDATA`)
- Plugins: shell-open, dialog, fs, os, process, clipboard-manager
- Build:
  ```bash
  npm run tauri:build              # desktop binary for current host
  npm run tauri:android:build      # APK + AAB
  npm run tauri:ios:build          # IPA (requires macOS)
  ```

### 6.3 Bubblewrap TWA (lightest APK path)
- Wraps the deployed PWA in a 200 KB Trusted Web Activity shell
- Best for Play Store distribution; falls back to Custom Tabs on misconfigured devices
- Build: `npm run apk:twa`
- Asset links: `dist-apk/assetlinks.json` (publish at `/.well-known/assetlinks.json` on the PWA host)

### 6.4 Docker multi-arch
- Three-stage build: deps → build → distroless `gcr.io/distroless/nodejs22-debian12:nonroot`
- Runtime: nonroot user, read-only FS, all caps dropped, no-new-privileges
- Healthcheck: `GET /health` every 30 s
- Build: `npm run docker:build` (buildx, amd64 + arm64)
- Compose: `docker-compose.yml` with MySQL 8.4 service

### 6.5 NPM SDK — `@aetherclaw/sdk`
- Pure-TS CoT engine + 10 simulated tools + 5 agent profiles, zero native deps
- Targets: Node 18+, Bun, Deno, browsers, edge runtimes, Tauri webview
- Entry points: `.` (default), `./tools`, `./agents`
- Build: `npm run sdk:build` (tsup ESM+CJS+dts)
- Publish: tagged release → GitHub Actions → npm (`--provenance`)

### 6.6 Install methods
| User type | Path |
|---|---|
| Casual / browser | PWA → "Install app" |
| Power user / desktop | Tauri binary (signed installer) |
| Mobile / Play Store | Bubblewrap APK |
| Mobile / offline-first | Tauri APK |
| Self-host / homelab | `docker compose up` |
| Developer / agent integrator | `npm i @aetherclaw/sdk` |
| Web browsing power user | Browser extension (side panel cockpit) |
| IDE-driven developer | `code --install-extension aetherclaw-vscode.vsix` |
| Knowledge worker | Obsidian plugin (note → CoT callout) |
| CI / scripting | `npx @aetherclaw/cli` (NDJSON output) |

### 6.7 Evolve channels — architecture invariant

All four evolve channels (`extension`, `vscode-extension`, `obsidian-plugin`, `cli`) consume
the **same** `@aetherclaw/sdk` package as a file dependency. The CoT engine, agent profiles, and
tool definitions live in exactly **one** place — `sdk/src/`. Each channel is a thin shell:

```
extension/        ─┐
vscode-extension/ ─┼─▶ @aetherclaw/sdk ─▶ runCoT() + profiles + tools
obsidian-plugin/  ─┤
cli/              ─┘
```

Rule: **never duplicate CoT logic into a channel.** If an evolve channel needs new behavior, lift it into the SDK first.

---

## 7. Security & Auth

- OAuth 2.0 via Kimi
- JWT session tokens
- Role-based access (user/admin)
- All DB queries scoped to authenticated user
- Agent endpoints require auth

---

## 8. Deployment

### 8.1 Web (existing)
```bash
npm run build          # Production build to dist/
npm start              # Start production server
```
**Deployed at**: https://cccytvbv5uiq6.kimi.page

### 8.2 CI/CD (new — 2026-06-15)
GitHub Actions in `.github/workflows/`:

| Workflow | Trigger | Outputs |
|---|---|---|
| `ci.yml` | push / PR | Lint + typecheck + web build + SDK build + Docker smoke |
| `release.yml` | tag `v*.*.*` or manual | Tauri desktop ×6, Tauri APK+AAB, Bubblewrap APK, Docker amd64+arm64 → GHCR, SDK + CLI → npm, browser ext .zip, VS Code .vsix, Obsidian .zip, GitHub Release (14+ artifacts) |
| `security.yml` | push / PR / weekly cron | CodeQL JS/TS · npm audit · Trivy FS + container scan → SARIF |

### 8.3 Release flow
```bash
git tag v2.0.0
git push --tags          # triggers release.yml → 14+ artifacts in one run
```

---

## 9. Feature Matrix

| Feature | Status |
|---|---|
| 59 fully functional apps | ✅ |
| Window manager (drag, resize, minimize, maximize) | ✅ |
| Three.js animated wallpaper | ✅ |
| OAuth authentication | ✅ |
| 12 DB tables with full CRUD | ✅ |
| AetherClaw CoT Multi-Agent (5 agent types) | ✅ |
| Visual CI/CD pipeline | ✅ |
| CoT reasoning trace viewer | ✅ |
| Agent health monitor dashboard | ✅ |
| PWA installable | ✅ |
| Service worker + offline support | ✅ |
| Push notification ready | ✅ |
| Tauri 2 — desktop binaries (Win/Mac/Linux × x64/arm64) | ✅ scaffolded |
| Tauri 2 — Android APK / iOS IPA | ✅ scaffolded |
| Bubblewrap TWA — lightweight Play Store APK | ✅ scaffolded |
| Docker multi-arch (amd64 + arm64), distroless | ✅ |
| `@aetherclaw/sdk` — standalone CoT engine | ✅ |
| **Browser extension** (Chrome/Edge/Firefox MV3, side panel cockpit) | ✅ |
| **VS Code extension** (palette + webview cockpit, .vsix) | ✅ |
| **Obsidian plugin** (note → CoT callout, desktop + mobile) | ✅ |
| **`@aetherclaw/cli`** (headless NDJSON runner, pipe-safe) | ✅ |
| GitHub Actions — CI / release / security | ✅ |

---

## 10. Changelog

### v2.0.0 — 2026-06-22 · Evolve channels (extension / vscode / obsidian / cli)
- Added `extension/` — MV3 browser extension. Side-panel cockpit + service-worker SDK host. Strict CSP (`script-src 'self'; object-src 'self'; frame-ancestors 'none'`). Minimum permissions (`storage`, `sidePanel`, `activeTab`, `scripting`).
- Added `vscode-extension/` — Three commands (`Run agent`, `Run on selection`, `Open cockpit`) + nonce'd webview. Two settings (`defaultAgent`, `timeoutMs`). Cancellation via `vscode.CancellationToken`.
- Added `obsidian-plugin/` — Ribbon icon + two commands (selection / whole-note). Result rendered as callout block. `isDesktopOnly: false` (works on iOS/Android Obsidian).
- Added `cli/` — `@aetherclaw/cli` headless binary. Stdin / argv prompt. NDJSON or pretty mode. Distinct exit codes (0/1/2/3). SIGINT abort.
- All four channels consume `@aetherclaw/sdk` as a file dep — zero CoT code duplication.
- Extended `release.yml`: +4 jobs (extension zip, vscode vsix, obsidian zip, cli → npm). Total artifacts ≥ 14.
- Updated `package.json` scripts: `ext:*`, `vscode:*`, `obsidian:*`, `cli:*`, plus `evolve:build` and `evolve:dist` orchestrators.
- Extended `DISTRIBUTION.md` 6→10 channels, added section 6.7 (architecture invariant).

### v2.0.0 — 2026-06-17 · CI gate green + docs pass
- Fixed pre-existing TS errors so [`npm run check`](#testing--qa) (and `.github/workflows/ci.yml`) returns clean:
  - `JSX.Element` → `React.JSX.Element` in `src/apps/dev/JsonFmt.tsx` and `src/apps/dev/Regex.tsx` (React 19 namespace move).
  - Removed unused imports/vars: `Trash2` (`Calendar.tsx`), `useRef` (`Files.tsx`), `i` callback param (`games/Snake.tsx`), `brightness2` + `Icon` destructure (`Settings.tsx`), dead `key` var (`dev/JsonFmt.tsx`).
- Added `HOWTO.md` — task-oriented recipes covering dev, build, packaging, code-change patterns, ops, troubleshooting.
- Extended `README.md` — Developer Quickstart, Testing & QA, Where-to-Use matrix above the existing user-facing content.
- Synced this blueprint: corrected stale Three.js architecture claim (replaced 2026-06-13), refreshed footer date, added doc cross-links.

### v2.0.0 — 2026-06-15 · Multi-target distribution
- Added Tauri 2.0 scaffold (`src-tauri/`): desktop binaries for Windows/macOS/Linux × x64/arm64, Android APK/AAB, iOS IPA. Native ARM64 throughout. Strict CSP, scoped FS, minimum capability surface.
- Added Bubblewrap TWA config (`dist-apk/`): 200 KB Play Store APK pointing at PWA host.
- Added `@aetherclaw/sdk` (`sdk/`): pure-TS CoT engine + 10 tools + 5 agent profiles. Zero native deps, ESM + CJS + dts. Publish target: npm.
- Added multi-arch Dockerfile (distroless nonroot, healthcheck, dropped caps) + `docker-compose.yml` with MySQL 8.4.
- Added `.github/workflows/`: `ci.yml` (lint/typecheck/build/test), `release.yml` (matrix build of all 14+ artifacts on tag), `security.yml` (CodeQL + npm audit + Trivy FS + container).
- Updated `package.json` scripts: `tauri:*`, `apk:twa`, `docker:*`, `sdk:*`.

### v2.0.0 — 2026-06-13 · RRSS hardening + bundle cuts
- Removed dead deps `three`, `framer-motion`, `gsap`, `@aws-sdk/*` (~1.6 MB savings).
- Replaced Three.js wireframe wallpaper with zero-dep canvas matrix rain.
- Initial load: 690 KB minified / 198 KB gzip.
- Added in-memory rate limiter (120 req/60 s per IP) on `/api/*`.
- Added AES-256-GCM password vault encryption (`api/lib/crypto.ts`, `VAULT_KEY` env).
