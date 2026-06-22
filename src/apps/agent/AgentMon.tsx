import { trpc } from "@/providers/trpc";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Wrench,
  Shield,
  Rocket,
  Zap,
  BrainCircuit,
  Clock,
  TrendingUp,
  Server,
  Cpu,
} from "lucide-react";

const AGENT_META: Record<string, { icon: any; color: string; bg: string }> = {
  builder: { icon: Wrench, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-500/20" },
  security: { icon: Shield, color: "text-red-400", bg: "bg-red-400/10 border-red-500/20" },
  deployer: { icon: Rocket, color: "text-green-400", bg: "bg-green-400/10 border-green-500/20" },
  monitor: { icon: Activity, color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-500/20" },
  optimizer: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-500/20" },
};

export default function AgentMon() {
  const { data: sessions } = trpc.agent.listSessions.useQuery();
  const { data: pipelines } = trpc.agent.listPipelines.useQuery();

  const totalRuns = sessions?.length || 0;
  const completed = sessions?.filter((s) => s.status === "completed").length || 0;
  const failed = sessions?.filter((s) => s.status === "failed").length || 0;
  const running = sessions?.filter((s) => s.status === "running").length || 0;

  const agentCounts: Record<string, number> = {};
  sessions?.forEach((s) => {
    agentCounts[s.agentType] = (agentCounts[s.agentType] || 0) + 1;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a1a] text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-900/40">
        <Activity className="w-5 h-5 text-purple-400" />
        <span className="font-semibold text-sm">Agent Monitor</span>
        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
          Dashboard
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className="bg-[#12122a] border-purple-800/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span className="text-[10px]">Sessions</span>
              </div>
              <div className="text-2xl font-bold text-purple-300">{totalRuns}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#12122a] border-purple-800/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px]">Completed</span>
              </div>
              <div className="text-2xl font-bold text-green-300">{completed}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#12122a] border-purple-800/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[10px]">Running</span>
              </div>
              <div className="text-2xl font-bold text-yellow-300">{running}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#12122a] border-purple-800/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Server className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px]">Failed</span>
              </div>
              <div className="text-2xl font-bold text-red-300">{failed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Agent type breakdown */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Object.entries(AGENT_META).map(([type, meta]) => {
            const Icon = meta.icon;
            const count = agentCounts[type] || 0;
            return (
              <Card
                key={type}
                className={`border ${meta.bg}`}
              >
                <CardContent className="p-2.5 text-center">
                  <Icon className={`w-4 h-4 ${meta.color} mx-auto mb-1`} />
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-[9px] text-gray-400 uppercase">{type}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sessions table */}
        <Card className="bg-[#12122a] border-purple-800/30 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions?.length === 0 ? (
              <div className="text-gray-500 text-xs text-center py-4">
                No agent sessions recorded
              </div>
            ) : (
              <div className="space-y-1">
                {sessions?.slice(0, 20).map((s) => {
                  const meta = AGENT_META[s.agentType] || AGENT_META.builder;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#0a0a1a] text-xs"
                    >
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      <span className="flex-1 truncate">{s.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          s.status === "completed"
                            ? "border-green-500/30 text-green-300"
                            : s.status === "running"
                            ? "border-yellow-500/30 text-yellow-300"
                            : s.status === "failed"
                            ? "border-red-500/30 text-red-300"
                            : "border-gray-500/30 text-gray-300"
                        }`}
                      >
                        {s.status}
                      </Badge>
                      <span className="text-[9px] text-gray-500 w-16 text-right">
                        {new Date(s.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipelines */}
        <Card className="bg-[#12122a] border-purple-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Pipelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelines?.length === 0 ? (
              <div className="text-gray-500 text-xs text-center py-4">
                No pipelines
              </div>
            ) : (
              <div className="space-y-1">
                {pipelines?.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#0a0a1a] text-xs"
                  >
                    <Rocket className="w-3.5 h-3.5 text-purple-400" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${
                        p.status === "completed"
                          ? "border-green-500/30 text-green-300"
                          : p.status === "running"
                          ? "border-yellow-500/30 text-yellow-300"
                          : "border-purple-500/30 text-purple-300"
                      }`}
                    >
                      {p.status}
                    </Badge>
                    <span className="text-[9px] text-gray-500">
                      Stage {p.currentStage}/5
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
}
