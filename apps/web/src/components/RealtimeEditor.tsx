import React, { useState } from "react";
import { type WorkflowEvent, AGENT_REGISTRY } from "@yashuverse/contracts";
import {
  FileCode,
  FileText,
  Activity,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface RealtimeEditorProps {
  events: WorkflowEvent[];
  onTriggerDemo?: () => void;
  isDemoRunning?: boolean;
}

export const RealtimeEditor: React.FC<RealtimeEditorProps> = ({
  events,
  onTriggerDemo,
  isDemoRunning = false,
}) => {
  const [activeTab, setActiveTab] = useState<"diff" | "markdown" | "stream">("diff");
  const [activeFile, setActiveFile] = useState<string>("portfolio.json");

  const latestEvent = events[0];
  const activeAgent = latestEvent?.agentId ? AGENT_REGISTRY[latestEvent.agentId] : null;

  return (
    <section id="realtime-editor" className="py-12 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-tech font-bold mb-2 shadow-liquid-card">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              LIVE FILE UPDATE & WORKSPACE STREAM
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-headings">
              Real-Time Agent Editing Stream
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-body mt-1">
              Observe actual agent file manipulations, AST extraction, and cryptographic claim verification in flight.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onTriggerDemo && (
              <button
                type="button"
                onClick={onTriggerDemo}
                disabled={isDemoRunning}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-tech font-bold text-xs hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 transition-all shadow-liquid-glow"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isDemoRunning ? "Assembling Workflow..." : "Trigger Live Ingestion Pipeline"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Editor Window Container (Liquid Dark IDE) */}
        <div className="rounded-3xl glass-panel-elevated overflow-hidden border border-white/15 shadow-2xl">
          {/* Top Window Bar: Traffic Lights + Tabs */}
          <div className="bg-slate-950/90 border-b border-white/10 px-4 py-3 flex items-center justify-between select-none">
            {/* macOS-style Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/40 shadow-[0_0_8px_#f43f5e]" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40 shadow-[0_0_8px_#f59e0b]" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/40 shadow-[0_0_8px_#10b981]" />
              <span className="ml-3 text-xs font-mono text-cyan-400/90 font-bold hidden sm:inline">
                yashuverse-agent-workspace (live-sync)
              </span>
            </div>

            {/* File Tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { name: "portfolio.json", icon: FileCode },
                { name: "README.md", icon: FileText },
                { name: "skills.ts", icon: FileCode },
              ].map((file) => {
                const Icon = file.icon;
                const isCurrent = activeFile === file.name;
                return (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => setActiveFile(file.name)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                      isCurrent
                        ? "bg-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-liquid-glow"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl text-xs font-tech border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("diff")}
                className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                  activeTab === "diff" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Live Diff
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("markdown")}
                className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                  activeTab === "markdown" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stream")}
                className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                  activeTab === "stream" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Logs ({events.length})
              </button>
            </div>
          </div>

          {/* Active Agent Operator Banner */}
          {activeAgent && (
            <div className="bg-slate-900/95 px-5 py-2.5 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: activeAgent.color }}
                />
                <span className="font-tech font-bold text-white">
                  {activeAgent.name} actively mutating workspace:
                </span>
                <span className="font-mono text-cyan-300 text-[11px] truncate max-w-md">
                  {latestEvent?.type} • SHA: {latestEvent?.eventId.substring(0, 10)}
                </span>
              </div>

              <span className="text-[10px] font-mono text-slate-400">
                {new Date(latestEvent?.occurredAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Content Pane */}
          <div className="p-6 font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto bg-slate-950/95 text-slate-200">
            {activeTab === "diff" && (
              <div className="space-y-1">
                <div className="text-slate-500">// Synchronized with @yashuverse/portfolio-schema v1.x</div>
                <div className="text-slate-500">// Inbound candidate payload passed SecurityAgent leak audit</div>
                <div className="text-emerald-400 bg-emerald-950/40 p-1.5 rounded font-semibold border-l-2 border-emerald-400">
                  + &quot;verifiedClaimsCount&quot;: 18,
                </div>
                <div className="text-emerald-400 bg-emerald-950/40 p-1.5 rounded font-semibold border-l-2 border-emerald-400">
                  + &quot;status&quot;: &quot;Designing Autonomous AI Systems&quot;,
                </div>
                <div className="text-slate-300 pl-4">
                  &quot;profile&quot;: &#123;
                </div>
                <div className="text-slate-300 pl-8">
                  &quot;name&quot;: &quot;Yashwanth Reddy G&quot;,
                </div>
                <div className="text-slate-300 pl-8">
                  &quot;auditHash&quot;: &quot;0x7F4A992C&quot;,
                </div>
                <div className="text-cyan-300 bg-blue-950/50 p-1.5 rounded font-semibold pl-8 border-l-2 border-cyan-400">
                  + &quot;confidenceScore&quot;: 0.99, // ML Claim Verifier Threshold Satisfied (≥0.92)
                </div>
                <div className="text-slate-300 pl-4">&#125;</div>
                <div className="text-cyan-400 pl-4 mt-2">
                  // Agent Cursors: verification_agent locked target on [canvas-project-card-0]
                </div>
              </div>
            )}

            {activeTab === "markdown" && (
              <div className="font-sans text-xs space-y-4 p-2 text-slate-200">
                <h4 className="text-xl font-bold text-white font-headings text-liquid-gradient">
                  # YASHUVERSE Autonomous Portfolio Engine
                </h4>
                <p className="text-slate-300 font-body leading-relaxed text-sm">
                  Multi-agent autonomous portfolio engine that discovers professional work, understands codebases with custom ML, orchestrates 8 in-app agent cursors, and cryptographically verifies claims.
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>QualityAgent: Schema validation pass. Evidence count = 2. Zero orphan references.</span>
                </div>
              </div>
            )}

            {activeTab === "stream" && (
              <div className="space-y-2">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-mono">
                    No active events in buffer. Standing by for webhook or test trigger.
                  </div>
                ) : (
                  events.slice(0, 15).map((evt, idx) => {
                    const agent = evt.agentId ? AGENT_REGISTRY[evt.agentId] : null;
                    return (
                      <div
                        key={evt.eventId || idx}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-[11px]"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_currentColor]"
                          style={{ backgroundColor: agent?.color || "#00F0FF" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white font-tech">{evt.type}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(evt.occurredAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {agent && (
                            <span className="text-[10px] text-cyan-300 font-mono">
                              Agent: {agent.name}
                            </span>
                          )}
                          <pre className="text-[10px] text-slate-300 bg-slate-950 p-2.5 rounded-xl mt-1.5 overflow-x-auto border border-white/10">
                            {JSON.stringify(evt.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
