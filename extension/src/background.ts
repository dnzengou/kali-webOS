import { createAetherClaw, type AgentType } from "@aetherclaw/sdk";

const claw = createAetherClaw({ timeout: 45_000 });

interface RunRequest {
  kind: "run";
  agentType: AgentType;
  prompt: string;
  runId: string;
}

interface AbortRequest {
  kind: "abort";
  runId: string;
}

type Request = RunRequest | AbortRequest;

const inFlight = new Map<string, AbortController>();

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {});
});

chrome.runtime.onMessage.addListener((msg: Request, _sender, sendResponse) => {
  if (msg.kind === "abort") {
    inFlight.get(msg.runId)?.abort();
    inFlight.delete(msg.runId);
    sendResponse({ ok: true });
    return false;
  }

  if (msg.kind === "run") {
    const controller = new AbortController();
    inFlight.set(msg.runId, controller);
    void claw
      .run({
        agentType: msg.agentType,
        prompt: msg.prompt,
        abortSignal: controller.signal,
        onStep: (step) => {
          chrome.runtime
            .sendMessage({ kind: "step", runId: msg.runId, step })
            .catch(() => {});
        },
      })
      .then((result) => {
        chrome.runtime
          .sendMessage({ kind: "done", runId: msg.runId, result })
          .catch(() => {});
      })
      .catch((err: Error) => {
        chrome.runtime
          .sendMessage({ kind: "error", runId: msg.runId, error: err.message })
          .catch(() => {});
      })
      .finally(() => {
        inFlight.delete(msg.runId);
      });
    sendResponse({ ok: true });
    return false;
  }

  return false;
});
