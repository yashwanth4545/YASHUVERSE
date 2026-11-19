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
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-950/80 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Working
          </span>
        );
      case "queued":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-400/50">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            Queued
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Completed
          </span>
        );
      case "failed":
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-400/50">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Blocked / Failed
          </span>
        );
      case "idle":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-900/80 text-slate-400 border border-white/10">
            <CircleDot className="w-2.5 h-2.5 text-slate-500" />
            Idle
          </span>
        );
    }
  };

  return (
    <section id="workspace" className="py-16 md:py-24 border-t border-white/10 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-tech font-bold mb-3 shadow-liquid-card">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              LIVE MULTI-AGENT RUNTIME
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-headings">
              Live AI Agent Fleet
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-body mt-2 max-w-2xl leading-relaxed">
              Inspect the 7 specialized autonomous units in real time. States, tasks, and telemetry are tied strictly to confirmed backend execution events — zero simulated progress.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCommandCenter}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-tech font-bold hover:from-blue-500 hover:to-cyan-400 transition-all shadow-liquid-glow self-start md:self-auto"
          >
            <span>Open Command Center</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Agent Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {PHASE_4_AGENTS.map((agent) => {
            const presence = presenceMap[agent.id];
            const state = presence?.state || "idle";
            const isSelected = activeAgentId === agent.id;
            const def = AGENT_REGISTRY[agent.id] || { color: "#0066ff" };
            const colorMeta = AGENT_COLOR_MAP[agent.id] || {
              bg: "rgba(0,102,255,0.2)",
              text: "#00F0FF",
              border: "#0066FF",
              glow: "rgba(0,102,255,0.4)",
            };
            const Icon = agent.icon;
            const isWorking = state === "working";

            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent?.(agent.id)}
                className={`glass-panel rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "bg-slate-900 ring-2 ring-cyan-400/60 border-cyan-400 shadow-liquid-glow"
                    : "glass-panel-hover"
                }`}
              >
                {/* Agent Top Accent Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
                  style={{
                    backgroundColor: def.color,
                    opacity: isWorking || isSelected ? 1 : 0.6,
                    boxShadow: isWorking ? `0 0 12px ${def.color}` : "none",
                  }}
                />

                <div>
                  {/* Card Header: Icon, Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-2xl border shrink-0 transition-transform group-hover:scale-105 shadow-inner"
                        style={{
                          backgroundColor: colorMeta.bg,
                          borderColor: colorMeta.border,
                          color: colorMeta.text,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-headings group-hover:text-cyan-300 transition-colors">
                          {agent.name}
                        </h3>
                        <span className="text-[10px] font-mono text-cyan-400/80 block">
                          @{agent.id}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(state)}
                  </div>

                  {/* Role Description */}
                  <p className="text-xs text-slate-300 font-body mb-4 leading-relaxed">
                    {agent.role}
                  </p>

                  {/* Current Active Task Box */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 mb-4 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>CURRENT TASK</span>
                      {presence?.progress !== undefined && (
                        <span className="text-cyan-400 font-bold">{presence.progress}%</span>
                      )}
                    </div>
                    <div
                      className="text-xs font-tech font-medium text-slate-200 line-clamp-2"
                      title={presence?.taskLabel || "Idle"}
                    >
                      {presence?.taskLabel || "Docked — standing by for trigger"}
                    </div>

                    {/* Progress Bar (if available) */}
                    {presence?.progress !== undefined && (
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, presence.progress))}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Timestamp & Inspection CTA */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate max-w-[140px]">
                    {presence?.occurredAt
                      ? new Date(presence.occurredAt).toLocaleTimeString()
                      : "Standing by"}
                  </span>

                  <span className="text-cyan-400 font-tech font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
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
