import * as vscode from "vscode";
import { createAetherClaw, type AgentType, type CoTStep } from "@aetherclaw/sdk";

const AGENTS: AgentType[] = ["builder", "security", "deployer", "monitor", "optimizer"];

function getClaw(): ReturnType<typeof createAetherClaw> {
  const cfg = vscode.workspace.getConfiguration("aetherclaw");
  return createAetherClaw({ timeout: cfg.get<number>("timeoutMs") ?? 45_000 });
}

async function pickAgent(defaultAgent: AgentType): Promise<AgentType | undefined> {
  const picked = await vscode.window.showQuickPick(AGENTS, {
    placeHolder: `Agent (default: ${defaultAgent})`,
    title: "AetherClaw agent",
  });
  return (picked as AgentType | undefined) ?? defaultAgent;
}

async function runAgent(prompt: string): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("aetherclaw");
  const defaultAgent = (cfg.get<string>("defaultAgent") ?? "security") as AgentType;
  const agentType = (await pickAgent(defaultAgent)) ?? defaultAgent;

  const channel = vscode.window.createOutputChannel("AetherClaw");
  channel.show(true);
  channel.appendLine(`▶ ${agentType} :: ${prompt.slice(0, 200)}`);

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: `AetherClaw ${agentType}`, cancellable: true },
    async (progress, token) => {
      const controller = new AbortController();
      token.onCancellationRequested(() => controller.abort());
      const claw = getClaw();
      try {
        const result = await claw.run({
          agentType,
          prompt,
          abortSignal: controller.signal,
          onStep: (step: CoTStep) => {
            progress.report({ message: `${step.stepType} (${step.latencyMs}ms)` });
            channel.appendLine(`  [${step.stepType}] ${step.content}`);
            if (step.toolResult) channel.appendLine(`    → ${step.toolResult.slice(0, 200)}`);
          },
        });
        channel.appendLine(`✓ ${result.finalAnswer} (${result.totalLatencyMs}ms)`);
      } catch (err) {
        channel.appendLine(`✗ ${(err as Error).message}`);
        vscode.window.showErrorMessage(`AetherClaw failed: ${(err as Error).message}`);
      }
    },
  );
}

function openCockpit(context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel("aetherclawCockpit", "AetherClaw Cockpit", vscode.ViewColumn.Beside, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = cockpitHtml(panel.webview.cspSource);
  const claw = getClaw();
  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg.kind !== "run") return;
    try {
      const result = await claw.run({
        agentType: msg.agentType as AgentType,
        prompt: msg.prompt,
        onStep: (step) => panel.webview.postMessage({ kind: "step", step }),
      });
      panel.webview.postMessage({ kind: "done", result });
    } catch (err) {
      panel.webview.postMessage({ kind: "error", error: (err as Error).message });
    }
  }, undefined, context.subscriptions);
}

function cockpitHtml(cspSource: string): string {
  const nonce = Math.random().toString(36).slice(2);
  return `<!doctype html><html><head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); padding: 12px; }
  select, textarea, button { background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, transparent); padding: 6px; font: inherit; }
  textarea { width: 100%; resize: vertical; }
  button { cursor: pointer; padding: 6px 12px; }
  .step { border-left: 2px solid var(--vscode-focusBorder); padding: 6px 8px; margin: 6px 0; background: var(--vscode-editor-inactiveSelectionBackground); }
  .label { font-size: 11px; opacity: 0.7; margin-bottom: 4px; }
</style></head><body>
<h2>AetherClaw Cockpit</h2>
<div class="label">Agent</div>
<select id="agent">${AGENTS.map((a) => `<option value="${a}">${a}</option>`).join("")}</select>
<div class="label" style="margin-top:8px">Prompt</div>
<textarea id="prompt" rows="3" placeholder="e.g. recon kali-webos.io"></textarea>
<div style="margin-top:8px"><button id="run">Run</button></div>
<div id="steps"></div>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const stepsEl = document.getElementById("steps");
  const escape = (t) => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };
  document.getElementById("run").addEventListener("click", () => {
    stepsEl.innerHTML = "";
    vscode.postMessage({ kind: "run", agentType: document.getElementById("agent").value, prompt: document.getElementById("prompt").value });
  });
  window.addEventListener("message", (e) => {
    const m = e.data;
    const row = document.createElement("div");
    row.className = "step";
    if (m.kind === "step") row.innerHTML = "<b>" + escape(m.step.stepType) + "</b> " + escape(m.step.content);
    else if (m.kind === "done") row.innerHTML = "<b>✓</b> " + escape(m.result.finalAnswer);
    else if (m.kind === "error") row.innerHTML = "<b>✗</b> " + escape(m.error);
    stepsEl.appendChild(row);
  });
</script></body></html>`;
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("aetherclaw.run", async () => {
      const prompt = await vscode.window.showInputBox({ prompt: "AetherClaw prompt", placeHolder: "recon kali-webos.io" });
      if (prompt) await runAgent(prompt);
    }),
    vscode.commands.registerCommand("aetherclaw.runOnSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      const text = editor?.document.getText(editor.selection).trim();
      if (!text) {
        vscode.window.showWarningMessage("No selection.");
        return;
      }
      await runAgent(text);
    }),
    vscode.commands.registerCommand("aetherclaw.openCockpit", () => openCockpit(context)),
  );
}

export function deactivate(): void {}
