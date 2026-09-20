# Install — Standalone Use Cases

**End-user, use-case-first walkthroughs.** Pick the scenario that matches what
you're trying to do; each entry gives you the minimum install steps, a first-run
tour, and the gotchas that actually bite in practice.

For build/packaging commands see [DISTRIBUTION.md](DISTRIBUTION.md). For
task-oriented developer recipes see [HOWTO.md](HOWTO.md).

**Live PWA (nothing to install):** https://cccytvbv5uiq6.kimi.page

---

## Pick your path

| Use case | Install target | Section |
|---|---|---|
| Try it once, no install | Hosted PWA | [§1](#1-just-try-it-hosted-pwa) |
| Native-feeling desktop app | PWA install *or* Tauri binary | [§2](#2-desktop-app-pwa-or-tauri) |
| Phone / tablet with an app icon | PWA "Add to Home Screen" *or* Bubblewrap TWA APK | [§3](#3-phone--tablet-pwa-or-twa-apk) |
| Self-host for a team / homelab | Docker + docker-compose | [§4](#4-self-host-docker--compose) |
| Raspberry Pi / ARM SBC | Docker `linux/arm64` image | [§5](#5-raspberry-pi--arm-sbc) |
| Cockpit on every browser tab | Browser extension (MV3) | [§6](#6-browser-cockpit-extension) |
| Inside VS Code | `.vsix` extension | [§7](#7-vs-code-extension) |
| Inside an Obsidian vault | Community plugin | [§8](#8-obsidian-plugin) |
| Embed CoT in your own app | `@aetherclaw/sdk` npm package | [§9](#9-embed-the-sdk) |
| Script from shell / CI | `npx @aetherclaw/sdk` CLI | [§10](#10-cli-in-shell--ci) |
| Fully offline / air-gapped | PWA cache + self-hosted backend | [§11](#11-offline--air-gapped) |

---

## 1. Just try it (hosted PWA)

**When to pick this.** You want to poke the desktop, apps, and agents right
now. No account setup, no downloads.

**Steps.**
1. Open https://cccytvbv5uiq6.kimi.page in any modern browser.
2. Click **Login** (Kimi OAuth) or click around as guest — read-only apps work
   without auth; anything that persists data requires login.

**First run.** The animated wallpaper loads, the dock appears at the bottom,
and the App Launcher (rocket icon) opens the full 59-app catalog. Try
`Terminal → help` for the sim-shell command list.

**Gotchas.**
- Agent Chat and any DB-backed app (Files, Notes, Password Manager) require
  auth. Guest mode is intentionally partial.
- Some panels use `getUserMedia` / `getDisplayMedia`; browsers will prompt on
  first use (Camera, Screen Recorder, Voice Recorder).

---

## 2. Desktop app (PWA or Tauri)

Two install paths depending on how "native" you want it to feel.

### 2a. PWA install (zero download, ~30 s)

**When to pick.** You want an app-launcher icon and a chromeless window, but
you don't want to install anything from a package manager.

**Chrome / Edge / Brave (Win/macOS/Linux).**
1. Visit https://cccytvbv5uiq6.kimi.page.
2. Address bar → click the install glyph (monitor icon with a down arrow) →
   **Install**.
3. Kali WebOS opens as its own window with its own Alt-Tab entry.

**Safari 17+ (macOS Sonoma or newer).**
1. Visit the URL in Safari.
2. **File → Add to Dock…** → confirm.

**Firefox.** Firefox desktop does not implement PWA install; use one of the
Chromium browsers above, or the Tauri binary (§2b).

**Gotchas.**
- The PWA still needs network on first load; after the service worker caches
  the shell it is offline-capable (see §11).
- If a redeploy makes the app look stale: DevTools → Application → Service
  Workers → **Update** + hard-refresh.

### 2b. Tauri desktop binary (fully native, ~8 MB)

**When to pick.** You want an OS-native binary (start-menu entry, system tray,
signed install package) and you don't want a browser in the loop.

**Prebuilt.**
1. Head to the repo's [GitHub Releases](https://github.com/dnzengou/kali-webOS/releases/latest).
2. Download the artifact for your OS/arch:
   - Windows → `.msi` (x64) or `.exe` installer (arm64)
   - macOS → `.dmg` (universal — x64 + arm64)
   - Linux → `.AppImage`, `.deb`, or `.rpm`
3. Install as you would any native package.

**Build from source (if you'd rather).** `npm run tauri:build` — see
[DISTRIBUTION.md §1](DISTRIBUTION.md#1-desktop-binary-for-current-os). Requires
Rust 1.77+.

**First run.** The binary points at the hosted API by default. To point at a
self-hosted backend, set `KALI_API_URL` in the environment before launch (or
in the Settings app → Advanced).

**Gotchas.**
- macOS Gatekeeper: signed builds pass automatically; unsigned local builds
  need **System Settings → Privacy & Security → Open Anyway** on first launch.
- Windows SmartScreen may warn on first run of the `.msi` until it earns
  reputation — click **More info → Run anyway**.

---

## 3. Phone / tablet (PWA or TWA APK)

### 3a. PWA "Add to Home Screen"

**iOS Safari 16.4+.**
1. Open https://cccytvbv5uiq6.kimi.page in Safari.
2. Share button → **Add to Home Screen** → confirm.
3. Launch from the home screen for full-screen, no-Safari-chrome experience.

**Android Chrome.**
1. Open the URL in Chrome.
2. Menu (⋮) → **Add to Home Screen** → **Install**.
3. App icon appears in the drawer; runs standalone.

### 3b. Bubblewrap TWA APK (Android, Play Store shell)

**When to pick.** You want a Play-Store-installable app icon on Android, but
you don't want a full Tauri Android build.

**End-user (once distributed).**
1. Install from the Play Store listing (or sideload the release APK).
2. Launch — the TWA is a 200 KB shell around the deployed PWA; assetlinks
   removes browser chrome and gives you a true full-screen app.

**Build/publish (maintainer).** See
[DISTRIBUTION.md §2](DISTRIBUTION.md#2-android-apk-bubblewrap-twa).

**Gotchas.**
- The TWA still requires network to reach the PWA — for offline use install
  the PWA proper and rely on the service worker cache.
- Assetlinks must be published at `https://<pwa-host>/.well-known/assetlinks.json`
  or Chrome will show browser chrome inside the TWA.

---

## 4. Self-host (Docker + Compose)

**When to pick.** You want to run Kali WebOS for a team, on your own domain,
with your own MySQL, behind your own auth/TLS.

**Steps.**
```bash
# 1. clone (or grab docker-compose.yml + .env.example only)
git clone https://github.com/dnzengou/kali-webOS.git
cd kali-webOS

# 2. fill in env
cp .env.example .env
# required: DATABASE_URL, JWT_SECRET, VAULT_KEY (32-byte hex), KIMI_OAUTH_*
# generate VAULT_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. bring it up
docker compose up -d
docker compose logs -f web

# 4. smoke
curl http://localhost:3000/health   # → {"status":"ok"}
```

**Pre-built image (skip the git clone).**
```bash
docker run --rm -p 3000:3000 --env-file .env \
  ghcr.io/dnzengou/kali-webos:latest
```

**Reverse-proxy sketch (Caddy).**
```
kali.example.com {
  reverse_proxy localhost:3000
}
```

**Gotchas.**
- The compose file expects a fresh MySQL 8 volume — pointing at an existing
  MySQL needs `DATABASE_URL` to match and `npm run db:push` (or the migration
  job) to run once.
- Set `TRUST_PROXY=1` when running behind a reverse proxy so rate-limiting
  keys on the real client IP, not the loopback address of your proxy.
- Rotate `VAULT_KEY` per
  [HOWTO §Rotate the password-vault key](HOWTO.md#rotate-the-password-vault-key-vault_key)
  if you ever suspect compromise — old-key data can no longer decrypt.

---

## 5. Raspberry Pi / ARM SBC

**When to pick.** Homelab on a Pi 4/5, Orange Pi, Rock 5, or any `linux/arm64`
board.

**Steps.**
```bash
docker pull ghcr.io/dnzengou/kali-webos:latest   # multi-arch: pulls arm64 automatically
docker run --rm -p 3000:3000 --env-file .env \
  ghcr.io/dnzengou/kali-webos:latest
```

**Verify you got the ARM manifest.**
```bash
docker buildx imagetools inspect ghcr.io/dnzengou/kali-webos:latest \
  | grep -E "Platform|Digest"
```

**Gotchas.**
- 32-bit Raspberry Pi OS is not supported — the image is `linux/arm64` only.
  Reinstall Raspberry Pi OS 64-bit or use Ubuntu Server 22.04+.
- MySQL 8 on 1 GB RAM Pis is tight — either run MySQL on a separate host or
  swap in MariaDB 10.11 (same Drizzle mysql2 driver, tested-compatible).

---

## 6. Browser cockpit (extension)

**When to pick.** You want AetherClaw in a side panel on every tab — surface
DNS / WHOIS / SSL / port info for the current URL, or drive a Security/Builder
agent against the site you're looking at.

**Chrome / Edge / Brave.**
1. Download `aetherclaw-extension-2.0.0.zip` from
   [Releases](https://github.com/dnzengou/kali-webOS/releases/latest) and unzip.
2. `chrome://extensions` → toggle **Developer mode** → **Load unpacked** → pick
   the unzipped folder.
3. Pin the extension → click the icon → the side panel opens on the current
   tab.

**Firefox.**
1. `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → pick
   `manifest.json` inside the unzipped folder.
2. Toolbar → click the icon → side panel opens.

**First run.** The panel reads the active tab's URL as the default agent
target. Pick an agent (Security is the default), type a prompt, hit Run —
CoT steps stream live.

**Gotchas.**
- MV3 side-panel API is Chromium-only; on Firefox the same UI opens as a
  popup window until Firefox ships sidePanel.
- The extension reuses `@aetherclaw/sdk` and calls the tool mocks in-panel; no
  data leaves the browser except for tool calls that hit external endpoints.

---

## 7. VS Code extension

**When to pick.** You edit code all day and want to run a CoT agent against
the current selection, file, or repo without switching windows.

**Install.**
```bash
# from Releases:
code --install-extension aetherclaw-vscode-2.0.0.vsix
```
Or **Extensions view** → **… menu** → **Install from VSIX…** → pick the file.

**First run.**
1. Command palette (`Ctrl/Cmd+Shift+P`) → `AetherClaw: Run agent`.
2. Pick an agent (Builder / Security / Deployer / Monitor / Optimizer).
3. Type a prompt, or run **AetherClaw: Run on selection** to use whatever you
   have highlighted.
4. **AetherClaw: Open cockpit** opens a webview in the sidebar with the same
   panel UI as the browser extension.

**Config (`settings.json`).**
```jsonc
{
  "aetherclaw.defaultAgent": "security",  // or builder/deployer/monitor/optimizer
  "aetherclaw.timeoutMs": 45000
}
```

**Gotchas.**
- The extension currently uses the SDK's simulated tools — real network calls
  are out of scope; treat it as an interactive spec / prompt sandbox.
- If the cockpit webview shows a blank panel after upgrade, run
  **Developer: Reload Webviews** from the palette.

---

## 8. Obsidian plugin

**When to pick.** Your notes are your primary interface and you want to run
agents on selected passages, appending the result inline as a callout.

**Install (manual until listed in Community Plugins).**
1. Download `obsidian-aetherclaw-2.0.0.zip` from Releases.
2. Unzip into `<your-vault>/.obsidian/plugins/aetherclaw/`.
3. Obsidian → **Settings → Community plugins → AetherClaw → Enable**.

**First run.**
1. Highlight text in any note.
2. Command palette → **AetherClaw: Run on selection**.
3. Result is appended below the selection as a callout:
   ```
   > [!info] AetherClaw (security)
   > - think (12ms) — …
   > - tool_call (8ms) — …
   > - final — …
   ```

**Settings.** Default agent, timeout, and *Append inline* (callout) vs
*Copy to clipboard* output mode.

**Gotchas.**
- "Restricted mode" must be off (Settings → Community plugins) — plugins are
  disabled otherwise.
- The plugin is a local module; there is no network telemetry, but the SDK's
  tool mocks will still make outbound calls if you invoke tools that reach
  external endpoints.

---

## 9. Embed the SDK

**When to pick.** You want the CoT engine + agent profiles + 10 sim-tools
inside your own app (server, worker, Electron/Tauri shell, edge function).

**Install.**
```bash
npm i @aetherclaw/sdk zod
```

**Minimum viable use.**
```ts
import { createAetherClaw } from "@aetherclaw/sdk";

const claw = createAetherClaw({ timeout: 15_000 });

const result = await claw.run({
  agentType: "security",
  prompt: "Recon example.com — surface anything notable",
  onStep: (s) => console.log(`[${s.stepType}]`, s.content),
});

console.log(result.finalAnswer);
```

**Runtime support.** Node 18+, Bun, Deno, browsers, Cloudflare Workers,
Vercel Edge, Tauri, Electron — no native deps.

**Gotchas.**
- `zod` is a peer dep (kept out of the SDK bundle so consumers upgrade on
  their own cadence) — install it explicitly.
- The tools ship as *simulated* implementations; wire your own via
  `claw.registerTool(...)` to hit real APIs.

---

## 10. CLI (in shell / CI)

**When to pick.** You want to script agents from bash, GitHub Actions, cron,
or pipe JSON into other tools. The CLI is the SDK's `bin` entry — one
package, two front-doors.

**One-shot (no install).**
```bash
npx @aetherclaw/sdk security "recon kali-webos.io"
```

**Global install.**
```bash
npm i -g @aetherclaw/sdk
aetherclaw -a security "recon kali-webos.io"
```

**JSON mode + pipes.**
```bash
echo "audit ./src" | aetherclaw -a optimizer --json | jq '.steps[] | .stepType'
```

**GitHub Actions.**
```yaml
- run: npx -y @aetherclaw/sdk security "audit $GITHUB_REPOSITORY" --json > audit.json
- uses: actions/upload-artifact@v4
  with: { name: audit, path: audit.json }
```

**Gotchas.**
- Set a real `--timeout <ms>` in CI — the default 45 s is friendly for
  interactive use but too short for long chains.
- `--json` emits one JSON object with `steps` + `finalAnswer` on stdout;
  human-readable logs go to stderr, so `--json > file.json 2>logs.txt` gives
  you both.

---

## 11. Offline / air-gapped

**When to pick.** Restricted network, plane, on-call bag, or a lab that has
no outbound internet.

**Recipe.**
1. On a connected machine: `docker pull ghcr.io/dnzengou/kali-webos:latest`
   then `docker save -o kali-webos.tar ghcr.io/dnzengou/kali-webos:latest`.
2. Transfer `kali-webos.tar` + your `.env` to the offline host.
3. `docker load -i kali-webos.tar` + `docker compose up -d`.
4. On each client, visit the LAN URL once with the browser online (Chrome
   allows this over `http://<ip>:3000` for PWA install if you enable
   *Insecure origins treated as secure* in `chrome://flags`, or terminate TLS
   at your reverse proxy).
5. Install the PWA (§2a). After first successful load the service worker
   caches the shell — subsequent launches work without any network at all
   except for backend API calls to your self-hosted instance.

**What still needs the network.**
- OAuth login (Kimi): if you need offline auth, swap the auth layer for local
  users (`api/routers/auth.ts`) — the schema already has `users` with a
  password-hash column.
- Agent tools that reach external endpoints (DNS, WHOIS, HTTP probes): those
  fail closed by design; swap in local mocks or point them at internal
  services.

**Gotchas.**
- The service worker refuses to cache non-`same-origin` requests — self-host
  media/wallpapers alongside the app, don't link to CDNs.
- `VAULT_KEY` must be the *same* on every replica or the encrypted vault
  round-trips break.

---

## Cross-references

- Build/packaging commands per format → [DISTRIBUTION.md](DISTRIBUTION.md)
- Developer recipes (dev server, migrations, releases, CI) → [HOWTO.md](HOWTO.md)
- Full architecture, schema, roadmap → [BUILD_BLUEPRINT.md](BUILD_BLUEPRINT.md)
- App catalog, use-cases in-desktop, keyboard shortcuts → [README.md](README.md)
