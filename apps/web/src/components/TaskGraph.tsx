import React from "react";
import { AGENT_REGISTRY, type AgentId, type AgentPresenceEvent } from "@yashuverse/contracts";
import { GitBranch, ArrowRight } from "lucide-react";

interface TaskGraphProps {
  presenceMap: Record<AgentId, AgentPresenceEvent>;
}

export const TaskGraph: React.FC<TaskGraphProps> = ({ presenceMap }) => {
  // Ordered pipeline of agents in execution DAG
  const pipeline: AgentId[] = [
    "orchestrator",
    "source_agent",
    "ml_intelligence",
    "project_agent",
    "verification_agent",
    "content_agent",
    "design_agent",
    "publishing_agent",
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-glass border border-slate-200/80 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-electric-600" />
          Autonomous Orchestration DAG (Dependency Flow)
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">Sequential & Parallel Branches</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {pipeline.map((agentId, index) => {
          const def = AGENT_REGISTRY[agentId];
          const presence = presenceMap[agentId];
          const isWorking = presence?.state === "working";
          const isCompleted = presence?.state === "completed";

          return (
            <React.Fragment key={agentId}>
              <div
                id={`task-node-${agentId}`}
                className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-300 ${
                  isWorking
                    ? "bg-white border-electric-600 shadow-glow-subtle ring-2 ring-electric-500/20"
                    : isCompleted
                    ? "bg-emerald-50/60 border-emerald-300 text-slate-800"
                    : "bg-white/60 border-slate-200 text-slate-600"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${isWorking ? "animate-ping" : ""}`}
                  style={{ backgroundColor: def.color }}
                />
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {def.name.replace(" Agent", "")}
                  </div>
                  <div className="text-[9px] font-mono capitalize text-slate-400">
                    {presence?.state || "idle"}
                  </div>
                </div>
              </div>

              {index < pipeline.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
