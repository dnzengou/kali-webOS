# AetherClaw — Obsidian Plugin

Run AetherClaw CoT agents on note selections inside Obsidian.

## Install (manual)

1. `npm run build && npm run zip` produces `obsidian-aetherclaw-2.0.0.zip`.
2. Unzip into `<your-vault>/.obsidian/plugins/aetherclaw/`.
3. In Obsidian: **Settings → Community plugins → AetherClaw → Enable**.

## Commands

- **Run on selection** — sends highlighted text to the configured agent.
- **Run on entire note** — sends the whole note.

## Settings

- **Default agent** — `security` · `builder` · `deployer` · `monitor` · `optimizer`
- **Timeout (ms)** — per-run abort
- **Append inline** — write result as a callout in the note, or copy to clipboard

Output format (when appended):

```
> [!info] AetherClaw (security)
> - **think** (12ms) — Analyzing request as security: "..."
> - **tool_call** (8ms) — Invoking scan_ports on example.com
> - **final** — Completed security run on example.com. Review tool outputs above.
> _total 84ms_
```

## Mobile

`isDesktopOnly: false` — works on iOS/Android Obsidian. SDK is pure-TS so no native bindings.
