# Distribution Quickstart

Kali-webOS v2.0.0 ships in **eight independent formats** from one source tree. Pick the one that fits.

| Format | Best for | Build command | First build needs |
|---|---|---|---|
| PWA | Casual users, instant try | `npm run build` then host `dist/public/` | — |
| Desktop binary | Power users, offline work | `npm run tauri:build` | Rust 1.77+ |
| Bubblewrap APK | Mobile (Play Store) | `npm run apk:twa` | JDK 17 + Android SDK + keystore |
| Docker image | Self-hosters, homelab, ARM SBCs | `npm run docker:build` | Docker + buildx |
| NPM SDK + `aetherclaw` CLI | Integrators, shell scripts, CI | `npm run sdk:build` | Node 18 |
| **Browser extension** | Chrome / Edge / Firefox cockpit | `npm run ext:zip` | Node 18 |
| **VS Code extension** | Editor command palette | `npm run vscode:package` | Node 18 |
| **Obsidian plugin** | Note-driven AI assistant | `npm run obsidian:zip` | Node 18 |

> **Evolve channels (extension / vscode / obsidian)** all reuse the same
> `@aetherclaw/sdk` brain — zero code duplication, single source of truth for CoT.
> The `aetherclaw` CLI ships as the SDK's `bin` entry (`npx @aetherclaw/sdk`).

## Quick recipes

### 1. Desktop binary for current OS
```bash
npm i
npm run tauri:build
# → src-tauri/target/release/bundle/{msi,nsis,dmg,deb,rpm,appimage}/
```

### 2. Android APK (Bubblewrap TWA)
```bash
# one-time:
keytool -genkey -v -keystore dist-apk/android.keystore -alias kaliwebos -keyalg RSA -keysize 2048 -validity 10000
keytool -list -v -keystore dist-apk/android.keystore -alias kaliwebos  # copy SHA-256 → dist-apk/assetlinks.json
# build:
cd dist-apk && bubblewrap init --manifest=./twa-manifest.json && bubblewrap build
```

### 3. Docker (single arch, current host)
```bash
docker build -t kali-webos:2.0.0 .
docker run --rm -p 3000:3000 --env-file .env kali-webos:2.0.0
```

### 3b. Docker (both arches)
```bash
docker buildx create --use --name kali-builder
npm run docker:build
docker buildx imagetools inspect kali-webos:2.0.0  # confirm linux/amd64 + linux/arm64
```

### 4. Use the AetherClaw SDK in another project
```bash
npm i @aetherclaw/sdk zod
```
```ts
import { createAetherClaw } from "@aetherclaw/sdk";

const claw = createAetherClaw();
const result = await claw.run({
  agentType: "security",
  prompt: "Recon kali-webos.io",
  onStep: (s) => console.log(s.stepType, s.content),
});
```

### 5. CLI — same package, `bin` entry
```bash
npx @aetherclaw/sdk security "recon kali-webos.io"
echo "audit ./src" | npx @aetherclaw/sdk -a optimizer --json
# or after global install:
npm i -g @aetherclaw/sdk
aetherclaw -a deployer "deploy v2.0.0"
```

### 6. Browser extension (Chrome / Edge / Firefox)
```bash
npm run ext:zip
# → aetherclaw-extension-2.0.0.zip
# Load: chrome://extensions → Developer mode → Load unpacked → extension/dist/
```

### 7. VS Code extension
```bash
npm run vscode:build && npm run vscode:package
# → vscode-extension/aetherclaw-vscode-2.0.0.vsix
code --install-extension vscode-extension/aetherclaw-vscode-2.0.0.vsix
```

### 8. Obsidian plugin
```bash
npm run obsidian:zip
# → obsidian-aetherclaw-2.0.0.zip
# Unzip into <vault>/.obsidian/plugins/aetherclaw/ → enable in Settings → Community plugins
```

### 9. One-tag release (everything at once)
```bash
git tag v2.0.0 && git push --tags
# → GitHub Actions builds:
#   • 6 desktop bundles (Win/Mac/Linux × x64/arm64)
#   • Bubblewrap APK
#   • Docker amd64 + arm64 (GHCR)
#   • SDK (+ bundled CLI) to npm (with --provenance)
#   • Browser extension .zip
#   • VS Code .vsix
#   • Obsidian plugin .zip
#   → 11+ artifacts attached to a single GitHub Release
```

### Build all evolve channels locally
```bash
npm run evolve:build   # sdk → ext → vscode → obsidian
npm run evolve:dist    # ext.zip + vsix + obsidian.zip
```

## Toolchain reference

| Tool | Why | Install |
|---|---|---|
| Node 22 | Web + SDK + Bubblewrap | nvm / fnm |
| Rust 1.77+ | Tauri desktop | `rustup` |
| Android SDK | Bubblewrap TWA | Android Studio |
| JDK 17 | Android signing + Gradle | `temurin-17` |
| Docker + buildx | Multi-arch images | Docker Desktop / `colima` |
| `@bubblewrap/cli` | TWA APK | `npm i -g @bubblewrap/cli` |
| `@tauri-apps/cli` | Tauri orchestrator | already in devDeps |

## Why this matrix?

| User question | Answer |
|---|---|
| "I just want to try it" | PWA — open the URL, install in browser |
| "I want it installed like a real app" | Tauri desktop (8 MB) |
| "I want it on my phone" | Bubblewrap TWA (200 KB shell) |
| "I want to run it on my Raspberry Pi" | Docker ARM64 (`ghcr.io/.../kali-webos:latest`) |
| "I want to embed AetherClaw CoT in my own app" | `npm i @aetherclaw/sdk` |
| "I want to chain it in shell scripts" | `npx @aetherclaw/sdk` (JSON mode) |
| "I want a cockpit on every web page" | Browser extension (side panel) |
| "I want it in VS Code" | `code --install-extension aetherclaw-vscode.vsix` |
| "I want it inside my Obsidian vault" | Obsidian plugin |
| "I want to ship all of these on every release" | Tag `v*.*.*` — CI does the rest |

## What changed vs v2.0.0-06-22

- **CLI folded into SDK.** `@aetherclaw/cli` is gone; the same binary ships as
  the SDK's `bin` entry. `npx @aetherclaw/sdk` and `npm i -g @aetherclaw/sdk`
  give you the `aetherclaw` command.
- **Tauri Android dropped.** Bubblewrap TWA remains the single Android path —
  200 KB Play Store shell over the deployed PWA, no NDK toolchain needed.
- **npm workspaces.** SDK, extension, vscode-extension, and obsidian-plugin
  install as one hoisted tree at repo root. `npm run evolve:build` uses
  `npm run -w`; no more `cd` chains.
