import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Workflow,
  Wrench,
  Shield,
  Rocket,
  Activity,
  Zap,
  Plus,
  Play,
  Trash2,
  Loader2,
  GitBranch,
} from "lucide-react";

const STAGE_DEFS = [
  { name: "Build", icon: Wrench, color: "text-blue-400", bg: "bg-blue-400" },
  { name: "Test", icon: Shield, color: "text-green-400", bg: "bg-green-400" },
  { name: "Security", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400" },
  { name: "Deploy", icon: Rocket, color: "text-purple-400", bg: "bg-purple-400" },
  { name: "Monitor", icon: Activity, color: "text-cyan-400", bg: "bg-cyan-400" },
];

export default function Pipeline() {
  const [name, setName] = useState("");
  const { data: pipelines, refetch } = trpc.agent.listPipelines.useQuery();
  const createPipeline = trpc.agent.createPipeline.useMutation({
    onSuccess: () => refetch(),
  });
  const runPipeline = trpc.agent.runPipeline.useMutation({
    onSuccess: () => {
      setTimeout(() => refetch(), 1500);
    },
  });
  const deletePipeline = trpc.agent.deletePipeline.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createPipeline.mutateAsync({
      name,
      stages: JSON.stringify(STAGE_DEFS.map((s) => s.name)),
    });
    setName("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a1a] text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-900/40">
        <Workflow className="w-5 h-5 text-purple-400" />
        <span className="font-semibold text-sm">Agent Pipeline</span>
        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
          CI/CD
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        {/* Create */}
        <Card className="bg-[#12122a] border-purple-800/30 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              New Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pipeline name..."
                className="bg-[#0a0a1a] border-purple-800/40 text-xs h-8"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                onClick={handleCreate}
                disabled={createPipeline.isPending || !name.trim()}
                className="bg-purple-600 hover:bg-purple-500 h-8 px-3"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Stage preview */}
            <div className="flex items-center gap-1 mt-3">
              {STAGE_DEFS.map((stage, i) => (
                <div key={stage.name} className="flex items-center gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#0a0a1a] border border-purple-800/20">
                    <stage.icon className={`w-3 h-3 ${stage.color}`} />
                    <span className="text-[10px]">{stage.name}</span>
                  </div>
                  {i < STAGE_DEFS.length - 1 && (
                    <div className="w-3 h-px bg-purple-700/40" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline list */}
        <div className="space-y-3">
          {pipelines?.length === 0 && (
            <div className="text-center text-gray-500 text-xs py-8">
              No pipelines. Create one above.
            </div>
          )}
          {pipelines?.map((p) => (
            <Card key={p.id} className="bg-[#12122a] border-purple-800/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        p.status === "running"
                          ? "border-yellow-500/30 text-yellow-300"
                          : p.status === "completed"
                          ? "border-green-500/30 text-green-300"
                          : "border-purple-500/30 text-purple-300"
                      }`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.status !== "running" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => runPipeline.mutate({ id: p.id })}
                        disabled={runPipeline.isPending}
                      >
                        {runPipeline.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-green-400" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deletePipeline.mutate({ id: p.id })}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-0.5">
                  {STAGE_DEFS.map((stage, i) => {
                    const isActive =
                      p.status === "running" && i === (p.currentStage || 0) - 1;
                    const isDone =
                      p.status === "completed" ||
                      (p.currentStage || 0) > i + 1;
                    return (
                      <div key={stage.name} className="flex-1 flex items-center gap-0.5">
                        <div
                          className={`flex-1 h-1.5 rounded-full ${
                            isDone
                              ? `${stage.bg}`
                              : isActive
                              ? "bg-yellow-500 animate-pulse"
                              : "bg-[#1e1e3a]"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {STAGE_DEFS.map((stage) => (
                    <span key={stage.name} className={`text-[9px] ${stage.color}`}>
                      {stage.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
