# HowTo — Kali WebOS

Task-oriented recipes. Each entry is **goal → exact commands → expected outcome**.

For the full architecture and roadmap, see [BUILD_BLUEPRINT.md](BUILD_BLUEPRINT.md).
For packaging into desktop/mobile/Docker/SDK, see [DISTRIBUTION.md](DISTRIBUTION.md).
For high-level usage and the app catalog, see [README.md](README.md).

---

## Table of Contents

- [Development](#development)
  - [Run the web app locally](#run-the-web-app-locally)
  - [Run with a fresh MySQL via Docker](#run-with-a-fresh-mysql-via-docker)
  - [Type-check, lint, format](#type-check-lint-format)
  - [Run the test suite](#run-the-test-suite)
  - [Generate and apply a database migration](#generate-and-apply-a-database-migration)
  - [Rotate the password-vault key (`VAULT_KEY`)](#rotate-the-password-vault-key-vault_key)
- [Building & Packaging](#building--packaging)
  - [Production web build](#production-web-build)
  - [Desktop binary (Tauri)](#desktop-binary-tauri)
  - [Android APK (Tauri, full-native)](#android-apk-tauri-full-native)
  - [Android APK (Bubblewrap TWA, lightweight)](#android-apk-bubblewrap-twa-lightweight)
  - [Multi-arch Docker image](#multi-arch-docker-image)
  - [Standalone SDK package](#standalone-sdk-package)
- [Code Changes](#code-changes)
  - [Add a new app to the desktop](#add-a-new-app-to-the-desktop)
  - [Add a new tRPC router](#add-a-new-trpc-router)
  - [Add a CoT tool to the agent](#add-a-cot-tool-to-the-agent)
- [Operations](#operations)
  - [Deploy to production](#deploy-to-production)
  - [Cut a tagged release (all 14+ artifacts)](#cut-a-tagged-release-all-14-artifacts)
  - [Debug a failing CI run](#debug-a-failing-ci-run)
  - [Inspect the Docker image security posture](#inspect-the-docker-image-security-posture)
- [Troubleshooting](#troubleshooting)
  - [`npm run check` fails with TS2503 (JSX namespace)](#npm-run-check-fails-with-ts2503-jsx-namespace)
  - [`npm run check` fails with TS6133 (unused symbol)](#npm-run-check-fails-with-ts6133-unused-symbol)
  - [Service worker shows stale content](#service-worker-shows-stale-content)
  - [App crashes inside its window](#app-crashes-inside-its-window)
  - [Rate-limit hit during local development](#rate-limit-hit-during-local-development)

---

## Development

### Run the web app locally

```bash
git clone <your-fork-url> kali-webos
cd kali-webos
npm install
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, VAULT_KEY, KIMI_OAUTH_*
npm run db:push
npm run dev
```

Expected: Vite dev server at `http://localhost:5173`, API routed via `@hono/vite-dev-server`.

### Run with a fresh MySQL via Docker

If you don't want to install MySQL locally:

```bash
docker run --name kali-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=kali_webos \
  -p 3306:3306 -d mysql:8.4

# in .env:
DATABASE_URL=mysql://root:root@localhost:3306/kali_webos

npm run db:push
npm run dev
```

### Type-check, lint, format

```bash
npm run check    # tsc -b — must pass before commit (CI gate)
npm run lint     # eslint .
npm run format   # prettier --write .
```

### Run the test suite

```bash
npm run test                          # all
npx vitest run src/apps/Settings      # one file pattern
npx vitest --watch                    # watch mode for TDD
```

### Generate and apply a database migration

```bash
# 1. edit db/schema.ts
# 2. generate SQL diff
npm run db:generate
# 3. review db/migrations/<timestamp>_*.sql
# 4. apply
npm run db:migrate
```

For **dev** you can skip migrations and use `npm run db:push` to sync schema directly.

### Rotate the password-vault key (`VAULT_KEY`)

The vault uses AES-256-GCM (`api/lib/crypto.ts`). To rotate:

```bash
# 1. generate new key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. write a one-shot rotation script that:
#    - decrypts every row in `passwords` with OLD VAULT_KEY
#    - re-encrypts with NEW VAULT_KEY
#    - updates rows transactionally

# 3. swap VAULT_KEY in env, redeploy
```

Never delete the old key until you've verified every row decrypts on the new key.

---

## Building & Packaging

### Production web build

```bash
npm run build
# → dist/public/  (static assets)
# → dist/boot.js  (esbuild-bundled Node server entry)

npm start   # NODE_ENV=production node dist/boot.js
```

### Desktop binary (Tauri)

```bash
# one-time: install Rust 1.77+
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

npm run tauri:build
# → src-tauri/target/release/bundle/{msi,nsis,dmg,deb,rpm,appimage}/
```

### Android APK (Tauri, full-native)

```bash
# one-time setup
npm run tauri:android:init   # configures src-tauri/gen/android/

npm run tauri:android:build
# → src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk
# → also produces AAB for Play Store
```

Needs: Rust + JDK 17 + Android SDK + NDK r26.

### Android APK (Bubblewrap TWA, lightweight)

```bash
# one-time: generate a signing keystore
keytool -genkey -v \
  -keystore dist-apk/android.keystore \
  -alias kaliwebos -keyalg RSA -keysize 2048 -validity 10000

# copy SHA-256 fingerprint into dist-apk/assetlinks.json
keytool -list -v -keystore dist-apk/android.keystore -alias kaliwebos

# publish assetlinks at https://<your-pwa-host>/.well-known/assetlinks.json

# build
cd dist-apk
bubblewrap init --manifest=./twa-manifest.json
bubblewrap build
```

### Multi-arch Docker image

```bash
# one-time: enable buildx
docker buildx create --use --name kali-builder

# build amd64 + arm64
npm run docker:build
# → kali-webos:2.0.0 (both architectures)

# inspect
docker buildx imagetools inspect kali-webos:2.0.0

# run
npm run docker:run     # exposes :3000, reads .env
```

### Standalone SDK package

```bash
npm run sdk:build
# → sdk/dist/ (ESM + CJS + dts)

# local test consumer
cd sdk && npm pack
# install the .tgz in your downstream project

# publish (CI does this on tag push)
npm run sdk:publish
```

Use from any TypeScript project:

```ts
import { createAetherClaw } from "@aetherclaw/sdk";

const claw = createAetherClaw();
const result = await claw.run({
  agentType: "security",
  prompt: "Recon example.com",
  onStep: (s) => console.log(s.stepType, s.content),
});
```

---

## Code Changes

### Add a new app to the desktop

1. Create `src/apps/<category>/MyApp.tsx` exporting a default React component.
2. Register in `src/apps/registry.ts`:
   ```ts
   { id: "myapp", label: "My App", icon: SomeLucideIcon, category: "productivity" }
   ```
3. Register the lazy loader in `src/apps/index.tsx`:
   ```ts
   myapp: lazy(() => import("./productivity/MyApp")),
   ```
4. Add the Rollup chunk hint in `vite.config.ts` if the app pulls in heavy deps.
5. `npm run check` — must pass.
6. `npm run dev` → open via App Launcher → verify.

### Add a new tRPC router

1. Create `api/routers/myfeature.ts` exporting a `router({...})`.
2. Mount in `api/router.ts`:
   ```ts
   myfeature: myfeatureRouter,
   ```
3. Use from the client:
   ```ts
   const data = trpc.myfeature.list.useQuery();
   ```
4. If it stores data: add a Drizzle table in `db/schema.ts`, then `npm run db:generate`.
5. If it touches user data: use `authedProcedure` (defined in `api/middleware.ts`) so queries scope to `ctx.user.id`.

### Add a CoT tool to the agent

1. Define the tool in `sdk/src/tools.ts`:
   ```ts
   export const myTool = {
     name: "my_tool",
     description: "What it does",
     execute: async (args) => { /* … */ },
   };
   ```
2. Attach to an agent profile in `sdk/src/agents.ts`.
3. Mirror in `api/routers/agent.ts` if the server should run it (some tools are SDK-only).
4. Add a step type entry if it produces a new CoT step type.
5. `npm run sdk:build && npm run check`.

---

## Operations

### Deploy to production

The hosted target deploys from `main`:

```bash
npm run check && npm run lint && npm run test && npm run build
git push origin main
# Kimi platform picks up dist/ and serves it
```

For self-host:

```bash
docker compose up -d         # web + MySQL
docker compose logs -f web   # tail
curl http://localhost:3000/health   # → {"status":"ok"}
```

### Cut a tagged release (all 14+ artifacts)

```bash
# bump versions in package.json + BUILD_BLUEPRINT.md + sdk/package.json
git commit -am "release: v2.1.0"
git tag v2.1.0
git push origin main --tags
```

GitHub Actions `release.yml` produces in one run:
- 6 Tauri desktop bundles (Win/Mac/Linux × x64/arm64)
- Tauri Android APK + AAB
- Bubblewrap APK
- Docker `ghcr.io/<owner>/kali-webos:2.1.0` (amd64 + arm64)
- `@aetherclaw/sdk@2.1.0` on npm (with `--provenance`)
- GitHub Release with all artifacts attached

### Debug a failing CI run

```bash
gh run list --limit 5                 # find the run id
gh run view <run-id> --log-failed     # only failed step output
gh run rerun <run-id> --failed        # retry just failed jobs after a fix
```

If `npm run check` fails in CI but passes locally:
- Check Node version match (`.nvmrc` / Actions matrix vs. local)
- Delete `node_modules/.cache` and re-run locally
- Inspect generated `dist/` for stale artifacts

### Inspect the Docker image security posture

```bash
# vuln scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image kali-webos:2.0.0

# confirm nonroot + dropped caps
docker inspect kali-webos:2.0.0 | jq '.[0].Config.User, .[0].HostConfig.CapDrop'

# confirm readonly + no-new-privileges (compose path)
docker compose config | grep -E "(read_only|no-new-privileges)"
```

---

## Troubleshooting

### `npm run check` fails with TS2503 (JSX namespace)

```
error TS2503: Cannot find namespace 'JSX'.
```

React 19 + `@types/react` 19 moved `JSX` under the React namespace. Switch:

```ts
// before
const tokens: JSX.Element[] = [];

// after
import React from "react";
const tokens: React.JSX.Element[] = [];
```

Or use `React.ReactNode` when assignment compatibility is enough.

### `npm run check` fails with TS6133 (unused symbol)

```
error TS6133: 'Foo' is declared but its value is never read.
```

Remove the import/variable entirely. Don't prefix with `_` — the project convention is to delete dead code.

### Service worker shows stale content

After a deploy, force-update:

1. Chrome DevTools → Application → Service Workers
2. Click **Update**, tick **Update on reload**
3. Hard-refresh (Ctrl+Shift+R / Cmd+Shift+R)

To bypass entirely during dev:

```js
// in DevTools console
const regs = await navigator.serviceWorker.getRegistrations();
for (const r of regs) await r.unregister();
location.reload();
```

### App crashes inside its window

Every app is wrapped in `AppErrorBoundary` (`src/apps/index.tsx`). The window will show a red fallback panel with the error. To debug:

1. Open DevTools → Console — full stack trace is logged
2. Check if the app makes a tRPC call that failed (Network tab → `/trpc/*`)
3. If it's a render error, isolate by opening the app in dev with React StrictMode and reading the double-render warning

### Rate-limit hit during local development

`api/boot.ts` enforces 120 req/60 s per IP. If you're hammering the API in tests:

- Increase the window in `api/boot.ts` (dev only)
- Or skip the limiter behind `if (process.env.NODE_ENV === "development") return next();`

Never disable in production.
