import type { AgentType, CoTStep, CoTResult } from "@aetherclaw/sdk";

const AGENTS: AgentType[] = ["builder", "security", "deployer", "monitor", "optimizer"];

const promptEl = document.getElementById("prompt") as HTMLTextAreaElement;
const agentEl = document.getElementById("agent") as HTMLSelectElement;
const runBtn = document.getElementById("run") as HTMLButtonElement;
const abortBtn = document.getElementById("abort") as HTMLButtonElement;
const stepsEl = document.getElementById("steps") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

for (const a of AGENTS) {
  const opt = document.createElement("option");
  opt.value = a;
  opt.textContent = a;
  agentEl.appendChild(opt);
}
agentEl.value = "security";

let currentRunId: string | null = null;

function escape(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderStep(step: CoTStep): void {
  const row = document.createElement("div");
  row.className = `step step-${step.stepType}`;
  const head = document.createElement("div");
  head.className = "step-head";
  head.innerHTML = `<span class="step-type">${escape(step.stepType)}</span><span class="step-lat">${step.latencyMs}ms</span>`;
  const body = document.createElement("div");
  body.className = "step-body";
  body.textContent = step.content;
  row.appendChild(head);
  row.appendChild(body);
  if (step.toolResult) {
    const pre = document.createElement("pre");
    pre.className = "tool-result";
    pre.textContent = step.toolResult;
    row.appendChild(pre);
  }
  stepsEl.appendChild(row);
  stepsEl.scrollTop = stepsEl.scrollHeight;
}

function setRunning(running: boolean): void {
  runBtn.disabled = running;
  abortBtn.disabled = !running;
  statusEl.textContent = running ? "running" : "idle";
}

async function getActiveTabUrl(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? "";
}

runBtn.addEventListener("click", async () => {
  const tabUrl = await getActiveTabUrl();
  const userPrompt = promptEl.value.trim();
  const prompt = userPrompt || `Inspect ${tabUrl || "the current page"}`;
  const runId = crypto.randomUUID();
  currentRunId = runId;
  stepsEl.innerHTML = "";
  setRunning(true);
  await chrome.runtime.sendMessage({
    kind: "run",
    agentType: agentEl.value as AgentType,
    prompt,
    runId,
  });
});

abortBtn.addEventListener("click", async () => {
  if (!currentRunId) return;
  await chrome.runtime.sendMessage({ kind: "abort", runId: currentRunId });
  setRunning(false);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (!currentRunId || msg.runId !== currentRunId) return;
  if (msg.kind === "step") renderStep(msg.step as CoTStep);
  else if (msg.kind === "done") {
    const final = (msg.result as CoTResult).finalAnswer;
    const row = document.createElement("div");
    row.className = "step step-final";
    row.textContent = final;
    stepsEl.appendChild(row);
    setRunning(false);
    currentRunId = null;
  } else if (msg.kind === "error") {
    const row = document.createElement("div");
    row.className = "step step-error";
    row.textContent = `Error: ${msg.error}`;
    stepsEl.appendChild(row);
    setRunning(false);
    currentRunId = null;
  }
});

setRunning(false);
