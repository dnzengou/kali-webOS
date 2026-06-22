# Kali WebOS - AetherClaw Edition

A production-ready web-based Linux desktop environment running entirely in your browser. Features 59 fully functional applications, a Chain-of-Thought multi-agent AI system, draggable window manager, and installs as a PWA for offline use.

**Live**: https://cccytvbv5uiq6.kimi.page
**Stack**: React 19 · TypeScript · Vite 7 · Tailwind 3 · tRPC 11 · Drizzle ORM · Hono · MySQL 8 · PWA
**Distribution**: PWA · Desktop (Tauri) · Android (Tauri + Bubblewrap) · iOS (Tauri) · Docker · NPM SDK

> **New here?** Three docs to know:
> - **README.md** (this file) — what it is, how to use it, how to develop it
> - **[HOWTO.md](HOWTO.md)** — task-oriented recipes ("how do I …?")
> - **[DISTRIBUTION.md](DISTRIBUTION.md)** — packaging matrix for the six release channels
> - **[BUILD_BLUEPRINT.md](BUILD_BLUEPRINT.md)** — full architecture, schema, roadmap, changelog

---

## Developer Quickstart

Local development for the web build:

```bash
# 1. clone
git clone <your-fork-url> kali-webos
cd kali-webos

# 2. install
npm install

# 3. copy env template and fill in
cp .env.example .env
# required: DATABASE_URL, JWT_SECRET, VAULT_KEY (32-byte hex), KIMI_OAUTH_*
# generate VAULT_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. database
npm run db:push           # apply schema to MySQL

# 5. dev server (HMR on http://localhost:5173)
npm run dev
```

**Required toolchain**: Node 22 · npm 10 · MySQL 8 (or Docker)
**Optional**: Rust 1.77+ (Tauri) · JDK 17 + Android SDK (mobile) · Docker buildx (containers)

### Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR + API proxy |
| `npm run build` | Production build → `dist/public/` + `dist/boot.js` |
| `npm start` | Run production build (Node 22) |
| `npm run check` | TypeScript build check (`tsc -b`) — **run before every commit** |
| `npm run lint` | ESLint pass over the source tree |
| `npm run format` | Prettier write |
| `npm run test` | Vitest run (unit + component tests) |
| `npm run db:generate` | Generate Drizzle migrations from schema diff |
| `npm run db:push` | Apply schema directly (dev only) |
| `npm run db:migrate` | Apply generated migrations (prod path) |
| `npm run tauri:dev` | Tauri desktop dev (hot reload native shell) |
| `npm run tauri:build` | Build desktop binary for current OS |
| `npm run docker:build` | Multi-arch Docker image (amd64 + arm64) |
| `npm run sdk:build` | Build the standalone `@aetherclaw/sdk` |

See [DISTRIBUTION.md](DISTRIBUTION.md) for the full packaging matrix.

---

## Testing & QA

The CI workflow at [.github/workflows/ci.yml](.github/workflows/ci.yml) runs the same gates locally:

```bash
npm run check        # 1. TypeScript — must be zero errors
npm run lint         # 2. ESLint
npm run test         # 3. Vitest
npm run build        # 4. Production build smoke
```

**What gets tested:**
- **Type safety** — `tsc -b` across `tsconfig.{app,node,server}.json`
- **Linting** — `eslint.config.js` + `eslint-plugin-react-hooks` + `react-refresh`
- **Unit tests** — Vitest with React Testing Library (`vitest.config.ts`)
- **Build smoke** — Vite production build + esbuild API bundle

**Manual UI verification** (no e2e harness yet — verify in browser):
1. `npm run dev` → http://localhost:5173
2. Open Files, Notes, Todo → create/edit/delete → confirm persistence after refresh
3. Open Agent Chat → run a Builder/Security task → confirm CoT steps stream
4. Open Password Manager → store an entry → verify it round-trips (encrypted at rest)
5. DevTools → Application → Service Workers → confirm SW registered for PWA

**Before opening a PR:**
- `npm run check` returns clean
- `npm run lint` returns clean
- Manual smoke of any app you touched
- Update [BUILD_BLUEPRINT.md](BUILD_BLUEPRINT.md) if you changed architecture/schema

---

## Where to Use & Test

| Scenario | Target | How |
|---|---|---|
| **Try without installing** | Hosted PWA | https://cccytvbv5uiq6.kimi.page |
| **Local dev / contribute code** | `npm run dev` | http://localhost:5173 |
| **CI / pre-merge gate** | GitHub Actions | `.github/workflows/ci.yml` runs `npm run check` + lint + test + build |
| **Production self-host** | Docker | `docker compose up` (see [DISTRIBUTION.md](DISTRIBUTION.md) §4) |
| **Desktop install** | Tauri binary | `npm run tauri:build` (see [DISTRIBUTION.md](DISTRIBUTION.md) §1) |
| **Mobile install** | Tauri APK / TWA | `npm run tauri:android:build` or `npm run apk:twa` |
| **Embed CoT in another app** | `@aetherclaw/sdk` | `npm i @aetherclaw/sdk` (see [DISTRIBUTION.md](DISTRIBUTION.md) §5) |

---

## Quick Start

### Open in Browser (No Install)
1. Open https://cccytvbv5uiq6.kimi.page in any modern browser
2. Click **Login** (OAuth via Kimi) or explore as guest
3. Desktop loads with animated 3D wallpaper
4. Click any app icon on dock or open the app launcher

### Install as Desktop App (PWA)

**Chrome / Edge Desktop:**
1. Visit the live URL
2. Click the **install icon** in the address bar (looks like a monitor with a down arrow)
3. KaliOS opens in its own window, no browser chrome

**Chrome Android:**
1. Visit the live URL
2. Tap menu (3 dots) -> **Add to Home Screen**
3. KaliOS launches like a native app

**iOS Safari:**
1. Visit the live URL
2. Tap **Share** button -> **Add to Home Screen**
3. Full-screen app experience

### Install as macOS App
1. Open Chrome, visit the live URL
2. Menu bar -> **File -> Install KaliOS...**
3. App appears in Applications folder with native icon

---

## First Launch Guide

### The Desktop
After login you see:
- **Top bar** - System menu, clock, notifications, user avatar
- **Dock** (bottom) - Quick-launch icons for favorite apps
- **Desktop icons** - App shortcuts on the wallpaper
- **Animated wallpaper** - Three.js wireframe terrain (purple/dark theme)

### Opening Apps
- **Click dock icon** to launch
- **App Launcher** (rocket icon on dock) - Browse all 59 apps by category
- **Right-click desktop** for context menu (future)
- **Keyboard**: Apps can be launched via URL params `?app=terminal`

### Window Controls
Every app window has:
- **Title bar** - Drag to move, double-click to maximize
- **Minimize** button - Collapses to dock
- **Maximize** button - Full screen
- **Close** button (X) - Closes app
- **Auto-focus** - Clicking a window brings it to front

### Managing Windows
- Open multiple instances of same app
- Resize by dragging window edges
- Minimize to dock, click dock icon to restore
- Z-index managed automatically (focused window on top)

---

## Application Guide

### System Apps (10 apps)
| App | What It Does | Pro Tip |
|---|---|---|
| **Terminal** | Simulated Linux shell with 25+ commands | Type `help` for command list. Try `nmap`, `whoami`, `top` |
| **Files** | File manager with tree navigation | Create folders, drag files, full CRUD backed by DB |
| **System Monitor** | Real-time CPU, memory, process viewer | Watch your actual browser resource usage |
| **Settings** | Theme, display, sound, network settings | Toggle dark/light mode |
| **Calculator** | Scientific calculator | Full expression support |
| **Calendar** | Monthly calendar with events | Click dates to add events, stored in DB |
| **Text Editor** | Plain text editing | Auto-saves to DB |
| **Sticky Notes** | Quick note widgets | Create multiple colored notes |
| **To-Do List** | Task management with checkboxes | Tasks persist across sessions |
| **Clock** | Clock, alarm, timer, stopwatch | All 4 modes in one app |

### Security Apps (12 apps)
| App | What It Does | Use Case |
|---|---|---|
| **Nmap Scanner** | Port scanning simulation | Check which ports are open on a target |
| **Password Gen** | Generate strong passwords | Configure length, symbols, numbers |
| **Hash Generator** | MD5/SHA256 hashing | Verify file integrity |
| **Base64 Tool** | Encode/decode Base64 | Debug API payloads |
| **Attack Map** | Visual cyber attack world map | Security awareness display |
| **SSL Scanner** | SSL/TLS configuration check | Verify HTTPS setup |
| **WHOIS Lookup** | Domain registration info | Research domain ownership |
| **DNS Lookup** | DNS record enumeration | Debug DNS issues |
| **MAC Lookup** | MAC address vendor lookup | Identify network device manufacturers |
| **CVE Lookup** | Search vulnerability database | Check if software has known exploits |
| **Subdomain Finder** | Subdomain enumeration | Reconnaissance |
| **XSS Scanner** | XSS vulnerability detection | Web app security testing |

**Security Workflow Example:**
```
1. Open WHOIS Lookup -> Enter "example.com" -> Get registration data
2. Open DNS Lookup -> Enter same domain -> Get A/MX/TXT records
3. Open Nmap Scanner -> Enter domain -> Scan common ports
4. Open SSL Scanner -> Verify TLS configuration
5. Open CVE Lookup -> Search for known vulnerabilities
6. Save findings in Sticky Notes or Text Editor
```

### Agent Apps (4 apps) - AetherClaw CoT Multi-Agent

These are the flagship AI-powered tools. They use Chain-of-Thought reasoning where the agent thinks step-by-step, calls tools, and produces a traceable result.

#### Agent Chat
Your AI assistant with 5 specialized personalities:

| Agent Type | Best For | Example Prompt |
|---|---|---|
| **Builder** | Compile, test, bundle code | "Build my React project" |
| **Security** | Security audits, scanning | "Scan example.com for vulnerabilities" |
| **Deployer** | Deploy to production | "Deploy my app to production" |
| **Monitor** | Health checks, uptime | "Monitor mywebsite.com health" |
| **Optimizer** | Performance tuning | "Optimize bundle size" |

**How to use Agent Chat:**
1. Open **Agent Chat** app
2. Select agent type from dropdown (top right)
3. Type your task in the input box
4. Press Enter or click Send
5. Watch the agent think, call tools, and produce results
6. The CoT trace shows every reasoning step with timing

**Example session - Security Audit:**
```
User: "Scan my website security"
Agent: [THINK] Security audit target: my website. Multi-vector scan.
Agent: [TOOL_CALL] Port scanning... -> Found: 22, 80, 443 open
Agent: [TOOL_CALL] Checking SSL/TLS... -> TLS 1.3 enabled, cert valid
Agent: [TOOL_CALL] Auditing source code... -> Score: 94/100
Agent: [FINAL_ANSWER] Security report: TLS 1.3 active, ports scanned,
        code score 94/100. No critical issues.
```

#### Pipeline
Visual CI/CD pipeline with 5 stages:

**Pipeline stages:** Build -> Test -> Security -> Deploy -> Monitor

**How to use Pipeline:**
1. Open **Pipeline** app
2. Enter pipeline name (e.g., "MyApp Production")
3. Click **+** to create
4. Click **Play** button to run
5. Watch progress bars animate through each stage
6. Each stage takes ~1.2 seconds with simulated output

**Use case - Release new feature:**
```
1. Code feature in Code Editor
2. Save to Files
3. Open Pipeline -> "Feature Release"
4. Click Play -> Watch: Build -> Test -> Security -> Deploy -> Monitor
5. All green? Feature is live.
```

#### CoT Trace
View the reasoning chain of any agent session. Shows:
- Step-by-step thought process
- Tool calls with arguments and results
- Timing (latency per step in ms)
- Visual timeline with color-coded step types

**How to use:**
1. Open **CoT Trace** app
2. Left panel lists all agent sessions
3. Click any session to view its reasoning chain
4. Expand steps to see tool output

#### Agent Monitor
Dashboard showing:
- Total sessions, completed, running, failed counts
- Agent type breakdown (5 colored cards)
- Recent sessions table with status
- Pipeline status table

### DevTools (10 apps)
| App | What It Does | Power User Tip |
|---|---|---|
| **Code Editor** | Syntax-highlighted code editor | Write and save code snippets |
| **JSON Formatter** | Format/validate/minify JSON | Paste messy API responses |
| **Regex Tester** | Test regular expressions with matches | Real-time match highlighting |
| **Markdown** | Live markdown preview | Write docs with instant preview |
| **Git Client** | Git log visualization | View simulated commit history |
| **API Tester** | HTTP request builder (simulated) | Test REST endpoints |
| **Color Picker** | HEX/RGB/HSL converter with palette | Copy values for CSS |
| **ASCII Art** | Text-to-ASCII converter | Generate terminal art |
| **QR Code** | Generate QR codes from text | Share URLs as scannable codes |
| **Diff Checker** | Compare two text blocks | Review code changes |

### Productivity (7 apps)
| App | What It Does |
|---|---|
| **Notes** | Rich text note-taking with folders |
| **Spreadsheet** | Grid-based data editor |
| **Document Viewer** | PDF document viewer |
| **Password Manager** | Encrypted password vault (DB-backed) |
| **Whiteboard** | Freehand drawing canvas |
| **Contacts** | Address book with groups |
| **Bookmarks** | URL bookmark manager with folders |

### Internet (8 apps)
| App | What It Does |
|---|---|
| **Web Browser** | iframe-based web browsing |
| **Email Client** | Email inbox UI (simulated) |
| **IRC Chat** | Chat room interface |
| **FTP Client** | File transfer UI |
| **RSS Reader** | Feed reader with subscriptions |
| **Network Tools** | Ping, traceroute simulation |
| **VPN Client** | VPN connection UI |
| **Torrent Client** | BitTorrent UI simulation |

### Media (8 apps)
| App | What It Does |
|---|---|
| **Music Player** | Audio player with playlist |
| **Video Player** | HTML5 video player |
| **Image Viewer** | Image viewer with zoom |
| **Photo Editor** | Basic photo editing filters |
| **Voice Recorder** | Audio recording via Web Audio API |
| **Screen Recorder** | Screen capture via getDisplayMedia |
| **Media Converter** | Format conversion UI |
| **Camera** | Webcam viewer via getUserMedia |

### Games (8 apps)
All games save high scores to the database:
- **Snake** - Classic snake game
- **Tetris** - Block stacking puzzle
- **2048** - Number merge puzzle
- **Minesweeper** - Mine avoidance
- **Tic-Tac-Toe** - vs AI opponent
- **Chess** - vs simulated AI
- **Pong** - Classic paddle game
- **Sudoku** - Number puzzle generator

---

## Creative Use Cases

### 1. Personal Security Operations Center (SOC)
Set up a full security monitoring dashboard:
```
1. Open Attack Map -> Full-screen for visual impact
2. Open Agent Chat -> Select "Monitor" agent
   -> "Monitor my infrastructure every 5 minutes"
3. Open CoT Trace -> Review all monitoring sessions
4. Open System Monitor -> Watch resource usage
5. Arrange windows: Attack Map (large), Agent Chat (side), CoT Trace (bottom)
```

### 2. Development Workspace
Complete dev environment in browser:
```
1. Open Code Editor -> Write your feature
2. Open Terminal -> Run simulated git commands
3. Open Agent Chat -> Select "Builder"
   -> "Build my project and run tests"
4. Open Pipeline -> Create "Release Pipeline"
   -> Click Play, watch all 5 stages
5. Open Browser -> Test the deployed app
```

### 3. Penetration Testing Lab
Simulated pentest workflow:
```
1. WHOIS Lookup -> Target reconnaissance
2. DNS Lookup -> Enumerate records
3. Subdomain Finder -> Find subdomains
4. Nmap Scanner -> Port enumeration
5. SSL Scanner -> TLS analysis
6. XSS Scanner -> Web vulnerability check
7. Agent Chat -> Select "Security"
   -> "Perform full security audit on target.com"
8. CoT Trace -> Document all findings
9. Sticky Notes -> Summarize critical findings
```

### 4. Content Creation Studio
```
1. Whiteboard -> Sketch ideas
2. Photo Editor -> Edit images
3. Music Player -> Background music while working
4. Markdown -> Write blog posts
5. QR Code -> Generate shareable links
6. ASCII Art -> Create terminal art for README
```

### 5. System Administration Dashboard
```
1. System Monitor -> CPU/RAM/processes (real browser data)
2. Files -> Manage configuration files
3. Terminal -> Execute commands
4. Agent Chat -> Select "Monitor"
   -> "Check system health and alert on anomalies"
5. Calendar -> Schedule maintenance windows
6. To-Do List -> Track sysadmin tasks
```

### 6. Learning Environment
```
1. Terminal -> Practice Linux commands (help shows all)
2. Regex Tester -> Learn regular expressions
3. JSON Formatter -> Understand API structures
4. Chess / Sudoku -> Keep brain sharp between learning
5. Agent Chat -> Ask "Explain how port scanning works"
   -> Watch the agent reason through the explanation
```

### 7. Incident Response Playbook
```
1. Agent Chat -> Select "Security"
   -> "Respond to port scan detected on server"
2. Watch agent reason through response steps
3. CoT Trace -> Export the response chain
4. Terminal -> Run diagnostic commands
5. Calendar -> Log incident with timestamp
6. Notes -> Write incident report
```

---

## Data Persistence

All data is saved to MySQL database:
- **Files, Notes, Todos, Events** - Full CRUD persistence
- **Bookmarks, Contacts, Passwords** - Personal data vault
- **Game Scores** - High score leaderboard
- **Agent Sessions** - Complete CoT reasoning history
- **Pipelines** - CI/CD pipeline definitions and runs

**Note**: Data is per-user and requires login.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` (in Agent Chat) | Send message |
| `Escape` | Close active window |
| Drag title bar | Move window |
| Double-click title bar | Maximize/restore |
| Click dock icon | Launch app / restore minimized |

---

## Tips & Tricks

1. **Multi-monitor feel**: Open multiple windows, arrange them like a real desktop
2. **Agent chaining**: Run Builder -> then Security -> then Deployer in sequence
3. **Pipeline templates**: Create standard pipelines ("Nightly Build", "Hotfix", "Release")
4. **CoT as documentation**: CoT traces serve as automatic audit logs
5. **Full-screen apps**: Maximize Attack Map or Browser for immersive experience
6. **Guest mode**: Many apps work without login. Agent features require auth.
7. **Mobile**: Works on tablets. PWA install recommended for mobile.

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, Three.js
- **Backend**: Hono, tRPC, Drizzle ORM, MySQL, OAuth 2.0
- **Agent Engine**: Chain-of-Thought reasoning with simulated tool execution
- **Distribution**: PWA with service worker, offline support

---

## Support

- **URL**: https://cccytvbv5uiq6.kimi.page
- **Login**: OAuth via Kimi account
- **Browser**: Chrome, Firefox, Safari, Edge (latest)
- **Offline**: Yes (after PWA install and first load)
