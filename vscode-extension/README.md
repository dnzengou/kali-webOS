# AetherClaw — VS Code Extension

Run AetherClaw CoT multi-agent (Builder · Security · Deployer · Monitor · Optimizer) from the VS Code command palette.

## Commands

| Command | Action |
|---|---|
| `AetherClaw: Run agent` | Prompt for input, pick agent, run |
| `AetherClaw: Run on selection` | Use current editor selection as prompt |
| `AetherClaw: Open cockpit` | Open a webview cockpit (sidebar) |

## Config

| Setting | Default | Purpose |
|---|---|---|
| `aetherclaw.defaultAgent` | `security` | Initial agent in quick-pick |
| `aetherclaw.timeoutMs` | `45000` | Per-run abort timeout |

## Build & package

```bash
cd vscode-extension
npm install
npm run build       # bundles src → dist/extension.js
npm run package     # produces aetherclaw-vscode-2.0.0.vsix
```

## Install locally

```bash
code --install-extension aetherclaw-vscode-2.0.0.vsix
```

## Architecture

The extension hosts `@aetherclaw/sdk` in the Node.js extension host (zero browser shim).
Webview cockpit uses nonce'd CSP — no inline event handlers.
