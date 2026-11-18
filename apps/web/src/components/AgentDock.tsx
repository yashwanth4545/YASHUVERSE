import React from "react";
import { AGENT_REGISTRY, type AgentId, type AgentPresenceEvent } from "@yashuverse/contracts";
import { AGENT_COLOR_MAP } from "@yashuverse/ui";
import { CheckCircle2, Clock, AlertTriangle, Play, CircleDot } from "lucide-react";

interface AgentDockProps {
  presenceMap: Record<AgentId, AgentPresenceEvent>;
  onSelectAgent?: (agentId: AgentId) => void;
  activeAgentId?: AgentId | null;
}

export const AgentDock: React.FC<AgentDockProps> = ({
  presenceMap,
  onSelectAgent,
  activeAgentId,
}) => {
  const agentKeys = Object.keys(AGENT_REGISTRY) as AgentId[];

  const getStatusIcon = (state: AgentPresenceEvent["state"] | undefined) => {
    switch (state) {
      case "working":
        return <Play className="w-3 h-3 text-electric-600 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case "queued":
        return <Clock className="w-3 h-3 text-amber-500 animate-pulse" />;
      case "failed":
      case "blocked":
        return <AlertTriangle className="w-3 h-3 text-rose-500" />;
      case "idle":
      default:
        return <CircleDot className="w-3 h-3 text-slate-300" />;
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 shadow-glass border border-slate-200/80">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-electric-600 animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Agent Operational Dock (8 Autonomous Units)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          State sync: SSE stream connected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {agentKeys.map((agentId) => {
          const def = AGENT_REGISTRY[agentId];
          const presence = presenceMap[agentId];
          const state = presence?.state || "idle";
          const colorMeta = AGENT_COLOR_MAP[agentId] || {
            bg: "rgba(0,102,255,0.1)",
            text: "#0066ff",
            border: "#0066ff",
            glow: "rgba(0,102,255,0.2)",
          };
          const isSelected = activeAgentId === agentId;
          const isWorking = state === "working";

          return (
            <button
              key={agentId}
              type="button"
              onClick={() => onSelectAgent?.(agentId)}
              className={`flex flex-col items-start p-2.5 rounded-xl border transition-all duration-200 text-left relative overflow-hidden ${
                isSelected
                  ? "bg-white border-electric-600 shadow-md ring-2 ring-electric-500/20"
                  : isWorking
                  ? "bg-white/95 border-slate-300 shadow-sm"
                  : "bg-white/60 border-slate-200/70 hover:bg-white hover:border-slate-300"
              }`}
            >
              {/* Top Accent Stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: def.color }}
              />

              <div className="flex items-center justify-between w-full mt-1 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: def.color }}
                />
                <span className="flex items-center gap-1 text-[10px] capitalize font-medium text-slate-500">
                  {getStatusIcon(state)}
                  {state}
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-900 truncate w-full">
                {def.name.replace(" Agent", "")}
              </div>
              <div className="text-[10px] text-slate-500 truncate w-full mb-1">
                {def.shortRole}
              </div>

              {/* Task Snippet */}
              <div
                className="text-[9px] font-mono leading-tight px-1.5 py-0.5 rounded w-full truncate mt-auto"
                style={{ backgroundColor: colorMeta.bg, color: colorMeta.text }}
                title={presence?.taskLabel || "Idle"}
              >
                {presence?.taskLabel ? presence.taskLabel : "Docked"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
