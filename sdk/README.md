# @aetherclaw/sdk

Chain-of-thought multi-agent SDK extracted from **Kali-webOS AetherClaw Edition**.

Drop-in CoT engine + 10 simulated security/build/deploy tools. Works in Node 18+, Bun, Deno, browsers, edge runtimes, Tauri, and Electron — zero native dependencies.

## Install

```bash
npm i @aetherclaw/sdk zod
```

## Use

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

## Agents

| Type        | Tools                                                                       | Use case                       |
| ----------- | --------------------------------------------------------------------------- | ------------------------------ |
| `builder`   | build_project, run_tests                                                    | Compile, test, bundle          |
| `security`  | scan_ports, check_ssl, whois_lookup, nmap_scan, dns_enum, hash_gen, audit_code | Recon, audit                   |
| `deployer`  | build_project, deploy                                                       | CI/CD ship                     |
| `monitor`   | nmap_scan, dns_enum, check_ssl                                              | Health watch                   |
| `optimizer` | build_project, audit_code                                                   | Perf / quality                 |

## Direct tool use

```ts
import { runTool } from "@aetherclaw/sdk/tools";

const out = await runTool("scan_ports", "10.0.0.5");
```

## Why simulated?

The SDK ships **deterministic, network-free** tool stubs so you can integrate, test, and demo CoT flows without exposing real recon traffic. Swap in your own implementations:

```ts
import { SIMULATED_TOOLS } from "@aetherclaw/sdk/tools";

SIMULATED_TOOLS.scan_ports = async (host) => myRealNmapWrapper(host);
```

## License

MIT
