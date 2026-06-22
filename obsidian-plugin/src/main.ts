import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { createAetherClaw, type AgentType, type CoTStep } from "@aetherclaw/sdk";

interface AetherClawSettings {
  defaultAgent: AgentType;
  timeoutMs: number;
  appendInline: boolean;
}

const DEFAULTS: AetherClawSettings = {
  defaultAgent: "security",
  timeoutMs: 45_000,
  appendInline: true,
};

const AGENTS: AgentType[] = ["builder", "security", "deployer", "monitor", "optimizer"];

export default class AetherClawPlugin extends Plugin {
  settings: AetherClawSettings = DEFAULTS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addRibbonIcon("zap", "AetherClaw: run on selection", () => this.runOnActiveSelection());

    this.addCommand({
      id: "run-on-selection",
      name: "Run on selection",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        void this.runOnEditor(editor, view);
      },
    });

    this.addCommand({
      id: "run-on-note",
      name: "Run on entire note",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        void this.runOnEditor(editor, view, true);
      },
    });

    this.addSettingTab(new AetherClawSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async runOnActiveSelection(): Promise<void> {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice("AetherClaw: open a Markdown note first.");
      return;
    }
    await this.runOnEditor(view.editor, view);
  }

  async runOnEditor(editor: Editor, view: MarkdownView, whole = false): Promise<void> {
    const prompt = whole ? editor.getValue() : editor.getSelection().trim() || editor.getValue();
    if (!prompt) {
      new Notice("AetherClaw: nothing to analyse.");
      return;
    }
    const claw = createAetherClaw({ timeout: this.settings.timeoutMs });
    const notice = new Notice(`AetherClaw ${this.settings.defaultAgent} running…`, 0);
    const lines: string[] = [`\n\n> [!info] AetherClaw (${this.settings.defaultAgent})`];
    try {
      const result = await claw.run({
        agentType: this.settings.defaultAgent,
        prompt: prompt.slice(0, 4000),
        onStep: (step: CoTStep) => {
          lines.push(`> - **${step.stepType}** (${step.latencyMs}ms) — ${step.content}`);
          notice.setMessage(`AetherClaw: ${step.stepType}`);
        },
      });
      lines.push(`> - **final** — ${result.finalAnswer}`);
      lines.push(`> _total ${result.totalLatencyMs}ms_`);
      if (this.settings.appendInline) {
        editor.replaceRange(lines.join("\n") + "\n", { line: editor.lastLine() + 1, ch: 0 });
      } else {
        navigator.clipboard?.writeText(lines.join("\n")).catch(() => {});
        new Notice("AetherClaw: result copied to clipboard.");
      }
    } catch (err) {
      new Notice(`AetherClaw failed: ${(err as Error).message}`);
    } finally {
      notice.hide();
    }
  }

  onunload(): void {}
}

class AetherClawSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: AetherClawPlugin) { super(app, plugin); }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "AetherClaw" });

    new Setting(containerEl)
      .setName("Default agent")
      .setDesc("Which CoT agent profile to invoke.")
      .addDropdown((dd) => {
        for (const a of AGENTS) dd.addOption(a, a);
        dd.setValue(this.plugin.settings.defaultAgent).onChange(async (v) => {
          this.plugin.settings.defaultAgent = v as AgentType;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Timeout (ms)")
      .setDesc("Per-run abort timeout.")
      .addText((t) => {
        t.setValue(String(this.plugin.settings.timeoutMs)).onChange(async (v) => {
          const n = parseInt(v, 10);
          if (Number.isFinite(n) && n > 0) {
            this.plugin.settings.timeoutMs = n;
            await this.plugin.saveSettings();
          }
        });
      });

    new Setting(containerEl)
      .setName("Append inline")
      .setDesc("If on, results are appended to the note as a callout. If off, copied to clipboard.")
      .addToggle((tg) => {
        tg.setValue(this.plugin.settings.appendInline).onChange(async (v) => {
          this.plugin.settings.appendInline = v;
          await this.plugin.saveSettings();
        });
      });
  }
}
