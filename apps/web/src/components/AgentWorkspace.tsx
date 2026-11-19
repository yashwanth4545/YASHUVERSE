import React from "react";
import {
  AGENT_REGISTRY,
  type AgentId,
  type AgentPresenceEvent,
} from "@yashuverse/contracts";
import { AGENT_COLOR_MAP } from "@yashuverse/ui";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDot,
  Shield,
  Sparkles,
  FileText,
  Search,
  Code2,
  ChevronRight,
} from "lucide-react";

interface AgentWorkspaceProps {
  presenceMap: Record<AgentId, AgentPresenceEvent>;
  activeAgentId?: AgentId | null;
  onSelectAgent?: (agentId: AgentId) => void;
  onOpenCommandCenter?: () => void;
}

const PHASE_4_AGENTS: Array<{
  id: AgentId;
  name: string;
  role: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: "source_agent",
    name: "Research Agent",
    role: "GitHub discovery, commit/release ingestion & idempotency",
    icon: Search,
  },
  {
    id: "project_agent",
    name: "Developer Agent",
    role: "Codebase analysis, AST parsing & project modeling",
    icon: Code2,
  },
  {
    id: "ml_intelligence",
    name: "ML Agent",
    role: "pgvector embeddings, entity matching & calibrated classifier",
    icon: Sparkles,
  },
  {
    id: "verification_agent",
    name: "Verification Agent",
    role: "Evidence provenance audit & policy gating (≥0.92)",
    icon: Shield,
  },
  {
    id: "content_agent",
    name: "Portfolio Agent",
    role: "Evidence-bounded factual synthesis & SEO metadata",
    icon: FileText,
  },
  {
    id: "security_agent",
    name: "Security Agent",
    role: "Secret leak scrubbing, prompt-injection defense & SecOps",
    icon: AlertTriangle,
  },
  {
    id: "quality_agent",
    name: "Quality Agent",
    role: "Zod schema compliance, link health & fact consistency",
    icon: CheckCircle2,
  },
];

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  presenceMap,
  activeAgentId,
  onSelectAgent,
  onOpenCommandCenter,
}) => {
  const getStatusBadge = (state: AgentPresenceEvent["state"] | undefined) => {
    switch (state) {
      case "working":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            Working
          </span>
        );
      case "queued":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            Queued
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case "failed":
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Blocked / Failed
          </span>
        );
      case "idle":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <CircleDot className="w-2.5 h-2.5 text-slate-400" />
            Idle
          </span>
        );
    }
  };

  return (
    <section id="workspace" className="py-16 md:py-24 border-t border-slate-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-tech font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              LIVE MULTI-AGENT RUNTIME
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-headings">
              Live AI Agent Workspace
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-body mt-1 max-w-2xl">
              Inspect the 7 specialized autonomous units in real time. States, tasks, and telemetry are tied strictly to confirmed backend execution events — zero simulated progress.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCommandCenter}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-tech font-semibold hover:bg-slate-800 transition-colors shadow-sm self-start md:self-auto"
          >
            <span>Open Command Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7-Agent Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {PHASE_4_AGENTS.map((agent) => {
            const presence = presenceMap[agent.id];
            const state = presence?.state || "idle";
            const isSelected = activeAgentId === agent.id;
            const def = AGENT_REGISTRY[agent.id] || {
              color: "#0066ff",
            };
            const colorMeta = AGENT_COLOR_MAP[agent.id] || {
              bg: "rgba(0,102,255,0.1)",
              text: "#0066ff",
              border: "#0066ff",
              glow: "rgba(0,102,255,0.2)",
            };
            const Icon = agent.icon;
            const isWorking = state === "working";

            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent?.(agent.id)}
                className={`glass-panel rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "bg-white ring-2 ring-blue-500/30 border-blue-500 shadow-glass-hover"
                    : "glass-panel-hover"
                }`}
              >
                {/* Agent Top Accent Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: def.color, opacity: isWorking || isSelected ? 1 : 0.6 }}
                />

                <div>
                  {/* Card Header: Icon, Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: colorMeta.bg,
                          borderColor: colorMeta.border,
                          color: colorMeta.text,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-headings group-hover:text-blue-600 transition-colors">
                          {agent.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          @{agent.id}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(state)}
                  </div>

                  {/* Role Description */}
                  <p className="text-xs text-slate-500 font-body mb-4 leading-relaxed">
                    {agent.role}
                  </p>

                  {/* Current Active Task Box */}
                  <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 mb-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>CURRENT TASK</span>
                      {presence?.progress !== undefined && (
                        <span className="text-blue-600 font-semibold">{presence.progress}%</span>
                      )}
                    </div>
                    <div
                      className="text-xs font-tech font-medium text-slate-800 line-clamp-2"
                      title={presence?.taskLabel || "Idle"}
                    >
                      {presence?.taskLabel || "Docked — waiting for workflow event"}
                    </div>

                    {/* Progress Bar (if available) */}
                    {presence?.progress !== undefined && (
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, presence.progress))}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Timestamp & Inspection CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate max-w-[140px]">
                    {presence?.occurredAt
                      ? new Date(presence.occurredAt).toLocaleTimeString()
                      : "Standing by"}
                  </span>

                  <span className="text-blue-600 font-tech font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
