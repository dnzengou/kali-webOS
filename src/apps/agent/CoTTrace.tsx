import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  Lightbulb,
  Wrench,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
} from "lucide-react";

const STEP_ICONS: Record<string, any> = {
  think: Lightbulb,
  tool_call: Wrench,
  spawn_agent: Users,
  final_answer: CheckCircle2,
  error: AlertCircle,
};

const STEP_COLORS: Record<string, string> = {
  think: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  tool_call: "border-green-500/30 bg-green-500/10 text-green-300",
  spawn_agent: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  final_answer: "border-purple-500/30 bg-purple-500/10 text-purple-200",
  error: "border-red-500/30 bg-red-500/10 text-red-300",
};

const STEP_BG: Record<string, string> = {
  think: "bg-blue-400",
  tool_call: "bg-green-400",
  spawn_agent: "bg-purple-400",
  final_answer: "bg-purple-300",
  error: "bg-red-400",
};

export default function CoTTrace() {
  const { data: sessions } = trpc.agent.listSessions.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: runs } = trpc.agent.getRuns.useQuery(
    { sessionId: selectedId! },
    { enabled: !!selectedId }
  );

  const selectedSession = sessions?.find((s) => s.id === selectedId);

  return (
    <div className="flex flex-col h-full bg-[#0a0a1a] text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-900/40">
        <BrainCircuit className="w-5 h-5 text-purple-400" />
        <span className="font-semibold text-sm">CoT Trace</span>
        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
          Reasoning Chain
        </Badge>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Session list */}
        <div className="w-56 border-r border-purple-900/40 p-3 overflow-y-auto">
          <div className="text-[10px] uppercase text-gray-500 mb-2 font-medium">
            Sessions
          </div>
          {sessions?.length === 0 && (
            <div className="text-gray-500 text-[10px]">No sessions yet</div>
          )}
          <div className="space-y-1">
            {sessions?.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${
                  selectedId === s.id
                    ? "bg-purple-900/40 border border-purple-700/40"
                    : "hover:bg-[#12122a] border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{s.name}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      s.status === "completed"
                        ? "bg-green-400"
                        : s.status === "running"
                        ? "bg-yellow-400 animate-pulse"
                        : s.status === "failed"
                        ? "bg-red-400"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-gray-500">
                  <Activity className="w-2.5 h-2.5" />
                  <span className="text-[9px]">{s.agentType}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trace view */}
        <ScrollArea className="flex-1 p-4">
          {!selectedSession ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <BrainCircuit className="w-10 h-10 text-purple-500/20" />
              <p className="text-xs">Select a session to view CoT trace</p>
            </div>
          ) : (
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-medium">{selectedSession.name}</h3>
                <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
                  {selectedSession.agentType}
                </Badge>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {runs?.map((run, i) => {
                  const Icon = STEP_ICONS[run.stepType] || Activity;
                  const colorClass = STEP_COLORS[run.stepType] || STEP_COLORS.think;
                  const bgDot = STEP_BG[run.stepType] || "bg-gray-400";

                  return (
                    <div key={run.id} className="flex gap-3 relative">
                      {/* Connector line */}
                      {i < (runs.length || 0) - 1 && (
                        <div className="absolute left-[11px] top-6 w-px h-[calc(100%-12px)] bg-purple-800/30" />
                      )}

                      {/* Dot */}
                      <div
                        className={`w-[22px] h-[22px] rounded-full ${bgDot} flex items-center justify-center flex-shrink-0 mt-0.5 z-10`}
                      >
                        <Icon className="w-2.5 h-2.5 text-[#0a0a1a]" />
                      </div>

                      {/* Card */}
                      <Card className={`flex-1 mb-3 border ${colorClass}`}>
                        <CardContent className="p-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-semibold tracking-wide">
                              {run.stepType}
                            </span>
                            {run.latencyMs ? (
                              <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {run.latencyMs}ms
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs whitespace-pre-wrap">{run.content}</p>
                          {run.toolName && (
                            <div className="mt-1.5 px-2 py-1 rounded bg-black/20 text-[10px] font-mono">
                              <span className="text-gray-500">tool:</span>{" "}
                              {run.toolName}
                            </div>
                          )}
                          {run.toolResult && (
                            <div className="mt-1 px-2 py-1.5 rounded bg-black/20 text-[10px] font-mono whitespace-pre-wrap text-gray-300">
                              {run.toolResult}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {runs?.length === 0 && (
                <div className="text-gray-500 text-xs">
                  No reasoning steps recorded for this session.
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
