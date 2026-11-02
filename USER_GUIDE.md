# User Guide — Kali WebOS

> **End-user guide.** How the software is experienced, not how it is built.
> For install methods, see [INSTALL.md](INSTALL.md). For architecture, see
> [BUILD_BLUEPRINT.md](BUILD_BLUEPRINT.md). For developer recipes, see
> [HOWTO.md](HOWTO.md).

Kali WebOS is a browser-based Linux-themed desktop with 59 apps and an
AetherClaw multi-agent AI system. It's one page in your browser — but it
behaves like a windowed OS, installs as a PWA, and can be put on your
phone, desktop, or self-hosted on your own box.

- **Live:** https://cccytvbv5uiq6.kimi.page
- **Default password at the lock screen:** `kali` (or just press **Unlock**
  with the field empty)

---

## Table of Contents

- [1. First launch — 60 seconds](#1-first-launch--60-seconds)
- [2. The desktop, piece by piece](#2-the-desktop-piece-by-piece)
- [3. Opening and arranging apps](#3-opening-and-arranging-apps)
- [4. Keyboard shortcuts](#4-keyboard-shortcuts)
- [5. The AetherClaw agents](#5-the-aetherclaw-agents)
- [6. The 59 apps, grouped by what you want to do](#6-the-59-apps-grouped-by-what-you-want-to-do)
- [7. Guest mode vs signed-in — what's gated](#7-guest-mode-vs-signed-in--whats-gated)
- [8. Making it feel like yours](#8-making-it-feel-like-yours)
- [9. On your phone / tablet](#9-on-your-phone--tablet)
- [10. Working offline](#10-working-offline)
- [11. Troubleshooting](#11-troubleshooting)
- [12. Privacy & data](#12-privacy--data)
- [13. What this is NOT (expectations)](#13-what-this-is-not-expectations)
- [14. Accessibility](#14-accessibility)

---

## 1. First launch — 60 seconds

1. Open https://cccytvbv5uiq6.kimi.page in Chrome / Edge / Safari / Firefox.
2. You'll see a **boot sequence** (Matrix-green log lines for ~1 second),
   then a lock screen.
3. On the lock screen: type `kali` as the password and press **Unlock** — or
   just click **Unlock** with the field empty, or click **Continue as
   Guest →** to skip auth entirely.
   > *Guest mode gets you the full desktop with every app installed. Apps
   > that read or write your personal data (Files, Notes, Password
   > Manager, Agent Chat) will show their UI but their save/load/run
   > actions fail silently or with a short error. See [§7](#7-guest-mode-vs-signed-in--whats-gated).*
4. The desktop loads: a dark wallpaper with a Matrix-rain effect, a top
   bar, a bottom dock, and three desktop icons on the left (**Home**,
   **Terminal**, **System Monitor**).
5. **Double-click any desktop icon** to open it, **single-click any dock
   icon** to open or focus, or press **Cmd/Ctrl + K** to open the App
   Launcher and type the name of what you want.

That's it. You're on a usable system.

---

## 2. The desktop, piece by piece

```
┌───────────────────────────────────────────────────────────────────┐
│  ⚡ Activities        Thu, Oct 31  ·  2:14 PM        [⬆ Install]  …│  ← Top Bar (36px)
├───────────────────────────────────────────────────────────────────┤
│ ▣ Home                                                            │
│                                                                   │
│ ▣ Terminal        ┌──────────────────────┐                        │
│                   │ ●●●  Agent Chat      │                        │
│ ▣ Monitor         │                      │  ← Draggable, resizable│
│                   │  Hi, how can I...    │     windows             │
│                   └──────────────────────┘                        │
│                                                                   │
│                                                                   │
│                                                                   │
│                  ┌────────────────────────────────────────────┐   │
│                  │  🗂  >_  📝  🌐  📊  ⚙  🔢  ✨  🎵     │   │  ← Dock
│                  └────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

**Top bar (top of screen, 36px high)**
- **⚡ Activities** (left) — opens the App Launcher. Same as pressing
  Cmd/Ctrl+K or Meta/F2.
- **Clock** (center) — the time ticks every second. **Click it to open
  Calendar.**
- **System tray** (right) — in order:
  - **Install App** (purple pill) — appears on Chromium browsers that
    support PWA install. Click to install as a desktop app.
  - **Battery meter** — appears on laptops / phones (uses the browser's
    `getBattery` API). Red ≤20%, amber ≤40%, green otherwise.
  - **Wi-Fi · Volume · Brightness** combo button — click to open the
    **Quick Settings panel** with toggles, sliders, and **Lock /
    Restart / Shutdown** buttons.

**Desktop icons (left edge)**
- Three pinned shortcuts: **Home** (Files), **Terminal**, **System
  Monitor**. Double-click to open. A small purple dot under an icon means
  the app is running.
- **Right-click anywhere on the wallpaper** for a context menu: Open
  Terminal, Open Files, **Change Wallpaper** (cycles 3 color schemes),
  Refresh, About.

**Dock (bottom center)**
- 9 pinned apps always visible: **Files, Terminal, Text Editor, Browser,
  System Monitor, Settings, Calculator, Agent Chat, Music**.
- Hover near the dock to see icons **magnify macOS-style** — proximity
  scales nearest icons up to 1.55× size.
- **Tooltip** appears above the icon on hover.
- Running indicators (just below each icon):
  - **White dots** = that many windows open and visible
  - **Yellow glow ring** = at least one window is minimized to the dock
  - **Purple icon tint** = that app's window is the currently active one
- Any app you open that isn't pinned shows up in the dock after a thin
  divider; the dock grows as you add apps.

---

## 3. Opening and arranging apps

**Open an app** — four ways:
1. Click its icon in the dock.
2. Double-click its icon on the desktop (only for the three pinned
   desktop shortcuts).
3. Open the **App Launcher** (Cmd/Ctrl + K, or Meta key, or F2, or
   click ⚡ Activities): type to search by name or description, or filter
   by category pill (All, System, Security, Internet, Productivity,
   Media, DevTools, Games, Agent). Navigate with ↑↓←→, press Enter to
   open, Esc to cancel.
4. Click a shortcut inside Agent Chat suggestions, right-click desktop
   menu, etc.

**Window controls (titlebar, left side)** — macOS-style traffic lights:
- **🔴 Red** — close window
- **🟡 Yellow** — minimize to dock (click the dock icon to restore)
- **🟢 Green** — maximize / restore. **Double-click the title bar** does
  the same.

**Drag & resize**:
- Drag the title bar to move. Dragging to within 10 px of a screen edge
  snaps the window flush to that edge.
- Grab any edge or corner to resize (8 directions). Minimum window size
  is 320 × 220 px.
- Windows can't be dragged above the top bar — the title bar bounces
  back.

**Window focus**:
- Clicking anywhere on a window brings it to the top (increases z-index).
- The active window has a brighter chrome and a thin purple glow around
  the border; inactive windows look dimmer.
- Opening the **same app twice** focuses the existing window instead of
  spawning a duplicate.

**Reload note (important):** Windows and their positions are **not
persisted** across page reloads today. If you refresh the tab, you start
with a clean desktop. (The database-backed app contents — your notes,
files, saved passwords — do persist.)

---

## 4. Keyboard shortcuts

| Shortcut | What it does |
|---|---|
| `Cmd+K` / `Ctrl+K` | Open App Launcher |
| `Meta` key alone | Open App Launcher |
| `F2` | Open App Launcher |
| `Esc` | Close App Launcher (or context menu) |
| `↑ ↓ ← →` *(in launcher)* | Move cursor in the 6-col grid |
| `Enter` *(in launcher)* | Launch the highlighted app |
| `Enter` *(in Agent Chat textarea)* | Send prompt |
| `Shift+Enter` *(in Agent Chat textarea)* | Insert a newline |
| Double-click title bar | Maximize / restore window |
| Right-click desktop | Open the desktop context menu |

> **No Alt+Tab yet** — switching between windows is dock-click only.

---

## 5. The AetherClaw agents

The **Agent** category contains Kali WebOS's flagship feature. Open
**Agent Chat** (dock → sparkles icon, or App Launcher → "agent").

### What it does

A chain-of-thought (CoT) multi-agent runner. You describe a task in plain
English; the system picks the right specialist, streams back its
reasoning steps as they happen, and shows you the tool calls it makes
along the way.

### Five agent personalities

| Agent | Color | What it does | Example prompts |
|---|---|---|---|
| **Builder** | 🔵 | Compile / test / bundle code | "Build my React project", "Run the test suite" |
| **Security** | 🔴 | Scan / audit / pentest | "Scan ports on example.com", "Audit for XSS", "Check SSL cert" |
| **Deployer** | 🟢 | Deploy / release / CI/CD | "Deploy to production", "Cut a release" |
| **Monitor** | 🔵 (cyan) | Health / uptime / alerts | "Monitor service health", "Ping every 5 min" |
| **Optimizer** | 🟡 | Perf / bundle / memory | "Optimize bundle size", "Profile cold-start" |

### How to run one

1. Open **Agent Chat**.
2. (Optional) pick an agent type from the dropdown in the top-right —
   OR just type what you want in the box. The right agent is **inferred
   from your prompt's keywords** automatically on first send:
   - words like *scan, nmap, ssl, port, vuln, audit, cve, hash* →
     Security
   - *deploy, release, publish, ship* → Deployer
   - *monitor, uptime, health, ping, latency* → Monitor
   - *optim, bundle, perf, memory, lighthouse* → Optimizer
   - everything else → Builder
3. Press **Enter** (Shift+Enter for a newline). The send button spins.
4. Watch the message stream. You'll see:
   - A pulsing "Running CoT reasoning…" status while the agent thinks.
   - When done, the final answer appears **plus** a timeline of each
     reasoning step below it:
     - 🔵 `THINK` — the agent working through the problem
     - 🟢 `TOOL_CALL` — the agent calling a tool (shows the tool name
       and its result; the ms latency on the right)
     - 🟣 `FINAL_ANSWER` — the summary / conclusion
5. The next prompt continues the same session. Click the trash can icon
   next to the agent dropdown to start a fresh session.

### If you see "Agent execution failed. Check authentication."

Agent runs need a signed-in session. Lock, sign in with password `kali`,
and try again. Guest mode cannot run agents.

### Related agent apps

- **Pipeline** — a visual CI/CD orchestrator. Build → Test → Security
  → Deploy → Monitor. Click **▶ Play** to animate through stages.
- **CoT Trace** — reasoning timeline across every session you've ever
  run. Left panel = session list, right panel = step-by-step trace.
- **Agent Monitor** — dashboard of session counts, agent-type breakdown,
  and pipeline statuses.
- **AutoClaw Demo** — one-click showcase that works WITHOUT login
  (uses local simulation) — the best way to try the CoT UX if you don't
  want to sign in yet.

---

## 6. The 59 apps, grouped by what you want to do

Rather than list by category, here they are by what you'd actually come
to do:

### "I'm doing a security assessment"
Nmap Scanner · WHOIS Lookup · DNS Lookup · Subdomain Finder · SSL
Scanner · CVE Lookup · XSS Scanner · MAC Lookup · Hash Generator ·
Password Gen · Base64 Tool · Attack Map (ambient visualisation) · Agent
Chat → Security

### "I'm writing / editing documents or notes"
Text Editor · Notes · Sticky Notes · Markdown · Document Viewer ·
Spreadsheet · Whiteboard · To-Do List

### "I'm coding"
Code Editor · Terminal · JSON Formatter · Regex Tester · Diff Checker ·
API Tester · Git Client · Markdown · ASCII Art · QR Code · Color Picker
· Agent Chat → Builder / Optimizer

### "I'm networking / communicating"
Web Browser · Email Client · IRC Chat · FTP Client · RSS Reader ·
Network Tools (ping / traceroute) · VPN Client · Torrent Client ·
Contacts · Bookmarks

### "I'm playing music / watching video / making media"
Music Player · Video Player · Image Viewer · Photo Editor · Voice
Recorder · Screen Recorder · Camera · Media Converter

### "I'm managing the system"
Files · System Monitor · Settings · Terminal · Calendar · Clock ·
Calculator · Password Manager

### "I'm taking a break"
Snake · Tetris · 2048 · Minesweeper · Tic-Tac-Toe · Chess · Pong ·
Sudoku

### "I want AI to do it"
Agent Chat · Pipeline · CoT Trace · Agent Monitor · AutoClaw Demo

> Need a full A-to-Z inventory? Open the App Launcher and type a letter —
> search filters by name AND description.

---

## 7. Guest mode vs signed-in — what's gated

**Guest mode** gets you the full desktop and every app. What you lose:

| Guest can… | Guest can't… |
|---|---|
| Open any app window | Save any file / note / todo (the server rejects the write) |
| Use all local-only apps (calc, calendar UI, sticky notes session) | Persist anything across refresh |
| Try AutoClaw Demo | Run Agent Chat / Pipeline / CoT Trace (needs auth) |
| Browse the hosted PWA | Use Password Manager vault (encrypted-at-rest DB) |
| Install the PWA | Have personal data follow across devices |

Signed-in mode (`password: kali` or Kimi OAuth where configured) unlocks
all of the above. There is currently no visible "guest" badge on the
desktop — if you're not sure, open Agent Chat and try to send; if it
fails with "Check authentication", you're a guest.

---

## 8. Making it feel like yours

- **Wallpaper**: Right-click desktop → **Change Wallpaper**. Cycles three
  color schemes (purple, teal, orange). The animated Matrix rain picks up
  the color.
- **Volume / brightness**: Top bar → right side → open Quick Settings
  panel → sliders. Brightness is a CSS filter, not a real backlight.
- **Theme**: dark theme throughout; no light-mode toggle today.
- **Pinning**: the dock's pinned apps are hard-coded in this release.
  Favoriting / re-ordering is on the roadmap.
- **Install as desktop app** (Chromium browsers): top bar → purple
  **Install App** pill → confirm. Launches thereafter with no browser
  chrome. See [INSTALL.md](INSTALL.md) for the full install matrix.

---

## 9. On your phone / tablet

Kali WebOS runs on mobile browsers and installs via "Add to Home
Screen". Realities to know:

| Works well | Rough edges |
|---|---|
| App Launcher + category pills | Dock magnification needs mousemove — no touch equivalent, dock icons stay at base size |
| Simple apps (Calculator, Clock, Notes, Password Gen) | Dragging / resizing windows uses mouse events; touch does NOT fully drive window manipulation yet |
| Agent Chat | 6-column launcher grid can feel cramped on narrow phones (< 400px) |
| Install as PWA (iOS Safari share → Add to Home Screen; Chrome Android menu → Install) | Expect to live mostly in maximized windows |

**Pragmatic mobile workflow**: open an app → use the maximize button →
work full-screen → close when done. Treat Kali WebOS on mobile like a
one-app-at-a-time launcher, not a multi-window desktop.

See [INSTALL.md §3](INSTALL.md#3-phone--tablet-pwa-or-twa-apk) for mobile
install walkthroughs.

---

## 10. Working offline

- **First load always needs network** (to fetch the shell + register the
  service worker).
- After the first load, the shell is cached. **Launching the PWA offline
  still shows the desktop and lets you open local-only apps** (Calculator,
  Calendar UI, Sticky Notes session, offline games).
- Apps that require a server round-trip (Files, Notes, Password Manager,
  Agent Chat, anything DB-backed) will show "network unavailable" or hang
  until online.
- For a fully offline / air-gapped deployment, self-host the full stack —
  see [INSTALL.md §11](INSTALL.md#11-offline--air-gapped).

---

## 11. Troubleshooting

### The lock screen won't accept my password
The default password is `kali`. An empty password also works. If you want
to skip entirely, click **Continue as Guest →**. Three wrong attempts
just shakes the field — no lockout.

### After a deploy, my apps still show the old UI
Service worker is serving stale cache. Fix:
1. Open DevTools (`F12` or `Cmd+Opt+I` / `Ctrl+Shift+I`)
2. Application tab → Service Workers → **Update** → tick **Update on
   reload**
3. Hard-refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`.

### An app shows "<AppName> crashed" in a red box
That app threw a runtime error. Click **Reload app** inside the panel —
the rest of the desktop keeps running (crashes are per-app, not global).
If it keeps crashing, close the window and try opening it again from the
launcher.

### Agent Chat says "Check authentication"
You're in guest mode or your session expired. Open Settings → sign in,
or lock the desktop (top-bar Quick Settings → Lock) and re-enter the
password.

### My windows disappeared after refresh
Window state does not persist today — this is intentional in this
release. The content inside DB-backed apps (your notes, saved files,
passwords) is still there; reopen the apps to see it.

### The Install App button doesn't appear
The `beforeinstallprompt` event only fires on Chromium browsers that
decide the site is PWA-eligible. On iOS Safari, install manually: Share →
Add to Home Screen. On Firefox desktop, PWA install is unsupported —
use the Tauri desktop binary from Releases instead.

### My camera / mic / screen recording isn't working
Those apps use `getUserMedia` / `getDisplayMedia` — your browser will
prompt for permission on first use. If you denied it, re-enable in the
site's permissions (padlock icon in the address bar → Site settings).

### Something is hanging on first load
First load fetches ~1-2 MB and registers the service worker. On a slow
connection, give it 20–30 seconds. If nothing appears after that, open
DevTools → Console and look for the real error.

### The "Shutdown" button restarted the page
Yes — "Shutdown" in Quick Settings fades out and reloads. There is no
real shutdown (this is a web app). To "shut down": close the tab.

---

## 12. Privacy & data

- **Your personal data** (Files, Notes, Todos, Events, Contacts, Saved
  Passwords, Agent Sessions) lives in the server's MySQL database, scoped
  to your authenticated user id.
- **Passwords** stored in the Password Manager are encrypted at rest with
  AES-256-GCM using a server-side `VAULT_KEY`. The vault key never leaves
  the server; the client only sees plaintext when you have a valid
  session and ask for it.
- **No analytics / telemetry** are built into the client UI — the
  shell doesn't phone home to third parties.
- **Agent sessions** store your prompts + reasoning steps in the DB.
  If you don't want them kept, start sessions and don't press "retain"
  (future surface) — for now, delete them from CoT Trace's session list.
- **Guest sessions** are entirely transient; nothing is saved server-side
  when you're not signed in.
- **For a self-hosted deployment**, everything above is in YOUR database.
  You control retention, backup, deletion.

---

## 13. What this is NOT (expectations)

Kali WebOS is a **browser-based themed desktop** with simulated tools and
a real agent chain. Some sharp edges to set expectations on:

- **The "Linux" is a theme.** The Terminal is a sim-shell with scripted
  responses — no actual bash, no real file system, no PID namespace.
  System Monitor shows browser-reported figures (JS heap, device memory),
  not host-level metrics.
- **The security apps are UIs on top of mock responses.** Nmap Scanner,
  DNS Lookup, SSL Scanner, WHOIS, Subdomain Finder, CVE Lookup, XSS
  Scanner — they LOOK like they're hitting the network, but they emit
  canned / mock responses in this build. Use them to learn the UX of a
  pentest workflow, not for real reconnaissance.
- **Agent tool calls are simulated too.** The CoT engine is real (the
  reasoning chain is produced by an LLM); the tools the agent "calls"
  are stubs. Register your own real tools via the `@aetherclaw/sdk`
  if you want them to touch real infrastructure.
- **"Shutdown" is a page reload.** Lock + close tab = no running state.
- **Windows don't survive refresh.** Backend data does; window layout
  doesn't.

If you need a real Linux desktop in your browser, this isn't it — try
Firecracker, kasm, or an in-browser VM. Kali WebOS is a themed,
multi-app demonstration + a real agent sandbox.

---

## 14. Accessibility

**Honestly today:** accessibility is partial.

- Keyboard navigation works for the App Launcher (full) and dock (click
  only).
- Lots of icon-only buttons use `title=` tooltips, which screen readers
  read but screen magnifiers may miss.
- Color-contrast on inactive window chrome and dock text is lower than
  WCAG AA at some zoom levels; use the dark/light theme toggle (planned)
  or increase browser zoom.
- There is no explicit high-contrast mode or font-size override today.

If you rely on assistive tech, open an issue describing your setup and
the biggest blocker — the team actively wants to improve this.

---

## See also

- [README.md](README.md) — top-level overview
- [INSTALL.md](INSTALL.md) — install walkthroughs (desktop, mobile, Docker, SDK, extensions, CLI, offline)
- [HOWTO.md](HOWTO.md) — developer recipes (`npm run …`)
- [DISTRIBUTION.md](DISTRIBUTION.md) — packaging matrix for release channels
- [BUILD_BLUEPRINT.md](BUILD_BLUEPRINT.md) — full architecture + roadmap
