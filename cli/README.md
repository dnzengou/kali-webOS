# @aetherclaw/cli

Headless CoT multi-agent runner. Zero native deps. Pipes-friendly.

## Install

```bash
npm i -g @aetherclaw/cli
# or one-off:
npx @aetherclaw/cli security "recon kali-webos.io"
```

## Usage

```bash
aetherclaw security "scan kali-webos.io"
aetherclaw -a optimizer "audit ./src"
echo "deploy v2.0.0 to fly" | aetherclaw -a deployer
aetherclaw --json security "recon 10.0.0.1" | jq '.kind=="step"'
```

## Options

| Flag | Default | Meaning |
|---|---|---|
| `-a, --agent` | `security` | `builder · security · deployer · monitor · optimizer` |
| `-t, --timeout` | `45000` | Abort after N ms |
| `-m, --max-steps` | `8` | Cap CoT trace length |
| `-j, --json` | off | NDJSON (one step per line) on stdout |
| `-q, --quiet` | off | Suppress step trace; only print final answer |
| `-h, --help` | — | Usage |

Step trace goes to stderr (human mode) or stdout (`--json`). Final answer always
goes to stdout. Pipe-safe.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Invocation error (bad flag, missing prompt) |
| `2` | Run error (tool failed, internal) |
| `3` | Aborted (Ctrl-C / SIGTERM / timeout) |

## Build locally

```bash
cd cli
npm install
npm run build
node dist/cli.js --help
```
