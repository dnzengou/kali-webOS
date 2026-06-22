# AetherClaw Browser Extension

MV3 extension for Chrome / Edge / Firefox. Opens a side-panel cockpit driving the
`@aetherclaw/sdk` CoT engine against the active tab.

## Build

```bash
cd extension
npm install
npm run build        # → dist/
npm run zip          # → aetherclaw-extension-2.0.0.zip
```

## Load (developer mode)

- **Chrome / Edge:** `chrome://extensions` → enable Developer mode → "Load unpacked" → select `dist/`
- **Firefox:** `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on" → pick `dist/manifest.json`

## Permissions rationale

| Permission | Why |
|---|---|
| `storage` | Persist last-used agent + prompt |
| `sidePanel` | Cockpit UI |
| `activeTab` | Read current tab URL as agent target |
| `scripting` | Reserved for future page-context tool calls |
| `host_permissions` | Tool calls reach external endpoints (DNS/whois mocks) |

## Architecture

```
panel.html → panel.ts ─┐
                       ├─ chrome.runtime messages ─▶ background.ts ─▶ @aetherclaw/sdk
content scripts ───────┘
```

Service worker hosts the SDK (zero-DOM, abort-aware). Panel only renders steps.
