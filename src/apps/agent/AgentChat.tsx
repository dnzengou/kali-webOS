import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench, Shield, Rocket, Activity, Zap,
  Send, User, Loader2, Sparkles, BrainCircuit, Trash2,
} from "lucide-react";

const AGENT_TYPES = [
  { id: "builder",   name: "Builder",   icon: Wrench,   color: "text-blue-400",   desc: "Build, compile, bundle" },
  { id: "security",  name: "Security",  icon: Shield,   color: "text-red-400",    desc: "Scan, audit, pentest" },
  { id: "deployer",  name: "Deployer",  icon: Rocket,   color: "text-green-400",  desc: "Deploy, release, CI/CD" },
  { id: "monitor",   name: "Monitor",   icon: Activity, color: "text-cyan-400",   desc: "Health, uptime, alerts" },
  { id: "optimizer", name: "Optimizer", icon: Zap,      color: "text-yellow-400", desc: "Performance, bundle, memory" },
] as const;

const SUGGESTIONS = [
  { label: "Build my project",          agent: "builder" },
  { label: "Scan ports on example.com", agent: "security" },
  { label: "Deploy to production",      agent: "deployer" },
  { label: "Optimize bundle size",      agent: "optimizer" },
  { label: "Audit code for XSS",        agent: "security" },
  { label: "Check SSL certificate",     agent: "security" },
  { label: "Monitor service health",    agent: "monitor" },
  { label: "Run test suite",            agent: "builder" },
];

// Infer best agent type from natural-language prompt
function inferAgent(text: string): string {
  const t = text.toLowerCase();
  if (/scan|nmap|ssl|port|vuln|pentest|xss|audit|cve|hash/.test(t)) return "security";
  if (/deploy|release|publish|ship|ci\/cd|rollout/.test(t))           return "deployer";
  if (/monitor|uptime|health|alert|ping|latency/.test(t))             return "monitor";
  if (/optim|bundle|perf|speed|memory|lighthouse|minif/.test(t))      return "optimizer";
  return "builder";
}

interface Message {
  id: number;
  role: "user" | "agent";
  content: string;
  steps?: Array<{
    stepType: string;
    content: string;
    toolName?: string | null;
    toolResult?: string | null;
    latencyMs?: number | null;
  }>;
}

export default function AgentChat() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [agentType, setAgentType] = useState<string>("builder");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const createSession = trpc.agent.createSession.useMutation();
  const runAgent = trpc.agent.runAgent.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!prompt.trim() || isRunning) return;

    const currentPrompt = prompt.trim();
    const inferredType = inferAgent(currentPrompt);
    if (!sessionId) setAgentType(inferredType);

    const userMsg: Message = { id: Date.now(), role: "user", content: currentPrompt };
    const agentMsg: Message = { id: Date.now() + 1, role: "agent", content: "Processing...", steps: [] };
    setMessages((prev) => [...prev, userMsg, agentMsg]);
    setIsRunning(true);
    setPrompt("");

    try {
      let sid = sessionId;
      if (!sid) {
        const s = await createSession.mutateAsync({
          name: `Session ${new Date().toLocaleTimeString()}`,
          agentType: inferredType as any,
        });
        sid = s.id;
        setSessionId(sid);
      }

      const result = await runAgent.mutateAsync({ sessionId: sid, prompt: currentPrompt });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentMsg.id
            ? {
                ...m,
                content: result.steps.find((s) => s.stepType === "final_answer")?.content || "Task complete.",
                steps: result.steps,
              }
            : m,
        ),
      );
      utils.agent.listSessions.invalidate();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentMsg.id ? { ...m, content: "Agent execution failed. Check authentication." } : m,
        ),
      );
    } finally {
      setIsRunning(false);
    }
  }

  const agentInfo = AGENT_TYPES.find((a) => a.id === agentType);

  return (
    <div className="flex flex-col h-full bg-[#0a0a1a] text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-900/40 shrink-0">
        <BrainCircuit className="w-5 h-5 text-purple-400" />
        <span className="font-semibold text-sm">AetherClaw Agent</span>
        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
          CoT Engine
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Select value={agentType} onValueChange={setAgentType} disabled={isRunning}>
            <SelectTrigger className="w-44 h-8 text-xs bg-[#12122a] border-purple-800/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#12122a] border-purple-800/40">
              {AGENT_TYPES.map((a) => (
                <SelectItem key={a.id} value={a.id} className="text-xs">
                  <span className="flex items-center gap-2">
                    <a.icon className={`w-3.5 h-3.5 ${a.color}`} />
                    {a.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sessionId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="New session"
              onClick={() => { setSessionId(null); setMessages([]); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 py-8">
            <Sparkles className="w-12 h-12 text-purple-500/30" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">AetherClaw Multi-Agent System</p>
              <p className="text-xs mt-1 max-w-sm text-gray-600">
                Describe any task in plain language — agent type is auto-selected.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  className="text-[11px] px-3 py-2 rounded border border-purple-800/30 hover:border-purple-500/50 hover:bg-purple-900/20 transition-colors text-left text-gray-400 hover:text-gray-200"
                  onClick={() => { setPrompt(s.label); setAgentType(s.agent); }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "agent" && (
                  <div className="w-7 h-7 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                    {agentInfo && <agentInfo.icon className={`w-3.5 h-3.5 ${agentInfo.color}`} />}
                  </div>
                )}
                <Card
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-purple-700/40 border-purple-600/30"
                      : "bg-[#12122a] border-purple-800/30"
                  }`}
                >
                  <CardContent className="p-2.5 text-xs leading-relaxed">
                    {msg.role === "agent" && isRunning && !msg.steps?.length ? (
                      <div className="flex items-center gap-2 text-purple-300">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Running CoT reasoning…
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}

                    {msg.steps && msg.steps.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-purple-800/20 space-y-1">
                        {msg.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-[10px] text-gray-400">
                            <span
                              className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${
                                step.stepType === "think"        ? "bg-blue-400"   :
                                step.stepType === "tool_call"    ? "bg-green-400"  :
                                step.stepType === "final_answer" ? "bg-purple-400" : "bg-gray-400"
                              }`}
                            />
                            <span className="uppercase text-[9px] text-gray-500 w-16 flex-shrink-0">
                              {step.stepType}
                            </span>
                            <span className="truncate">{step.content}</span>
                            {step.latencyMs ? (
                              <span className="text-gray-600 ml-auto flex-shrink-0">{step.latencyMs}ms</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-purple-600/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-purple-900/40 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Describe a task for ${agentInfo?.name || "Agent"} — agent auto-selected from keywords…`}
            rows={2}
            className="flex-1 bg-[#12122a] border border-purple-800/40 text-xs px-3 py-2 rounded-lg resize-none outline-none focus:border-purple-500/60 placeholder-gray-600 text-gray-200 transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            disabled={isRunning}
          />
          <Button
            onClick={handleSend}
            disabled={!prompt.trim() || isRunning}
            className="bg-purple-600 hover:bg-purple-500 h-[52px] px-4 shrink-0"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1">Enter to send · Shift+Enter for newline · agent auto-detected from prompt</p>
      </div>
    </div>
  );
}
