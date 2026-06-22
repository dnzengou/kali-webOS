# APK distribution — Bubblewrap (TWA)

Direct APK from the existing PWA. Lightest path: ~200 KB shell that points at the deployed PWA.

## One-time setup

```bash
npm install -g @bubblewrap/cli
bubblewrap doctor   # verifies JDK 17 + Android SDK
```

## Build APK (signed, release)

```bash
cd dist-apk
bubblewrap init --manifest=./twa-manifest.json
bubblewrap build
# → app-release-signed.apk + app-release-bundle.aab
```

## Publishing checklist

1. Generate keystore once: `keytool -genkey -v -keystore android.keystore -alias kaliwebos -keyalg RSA -keysize 2048 -validity 10000`
2. `keytool -list -v -keystore android.keystore -alias kaliwebos` → copy SHA-256 → paste into `assetlinks.json`
3. Host `assetlinks.json` at `https://kali-webos.io/.well-known/assetlinks.json`
4. Upload `app-release-bundle.aab` to Google Play Console.

## Why TWA instead of Tauri Android?

| | Bubblewrap (TWA) | Tauri Android |
|---|---|---|
| Size | 200 KB | 8–15 MB |
| Build deps | JDK + Android SDK | + Rust + NDK |
| Offline | PWA service worker | Embedded webview |
| Use case | Distribute existing PWA | Native APIs, offline-first |

We ship **both**. TWA for Play Store reach; Tauri APK (`npm run tauri android build`) for users who want native FS / shell access.
