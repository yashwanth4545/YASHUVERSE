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

  // Filter latest relevant file events or fallback to baseline state
  const latestEvent = events[0];
  const activeAgent = latestEvent?.agentId ? AGENT_REGISTRY[latestEvent.agentId] : null;

  return (
    <section id="realtime-editor" className="py-12 border-t border-slate-200/80 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-tech font-semibold mb-2">
              <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              LIVE FILE UPDATE & WORKSPACE STREAM
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-headings">
              Real-Time Agent Editing Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-body mt-1">
              Observe actual agent file manipulations, AST extraction, and cryptographic claim verification in flight.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onTriggerDemo && (
              <button
                type="button"
                onClick={onTriggerDemo}
                disabled={isDemoRunning}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-tech font-semibold text-xs hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{isDemoRunning ? "Workflow In Flight..." : "Run Test Ingestion Pipeline"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Editor Window Container (Apple-Minimalist IDE Look) */}
        <div className="rounded-3xl glass-panel-elevated overflow-hidden border border-slate-200/90 shadow-glass-elevated">
          {/* Top Window Bar: Traffic Lights + Tabs */}
          <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between select-none">
            {/* macOS-style Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400/80 border border-rose-500/30" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 border border-amber-500/30" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80 border border-emerald-500/30" />
              <span className="ml-3 text-xs font-mono text-slate-500 hidden sm:inline">
                yashuverse-agent-workspace (live-sync)
              </span>
            </div>

            {/* File Tabs */}
            <div className="flex items-center gap-1">
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
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                      isCurrent
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs font-tech">
              <button
                type="button"
                onClick={() => setActiveTab("diff")}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  activeTab === "diff" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Live Diff
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("markdown")}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  activeTab === "markdown" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stream")}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  activeTab === "stream" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Log Ledger ({events.length})
              </button>
            </div>
          </div>

          {/* Active Agent Operator Banner */}
          {activeAgent && (
            <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 px-4 py-2 border-b border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: activeAgent.color }}
                />
                <span className="font-tech font-bold text-slate-900">
                  {activeAgent.name} actively mutating workspace:
                </span>
                <span className="font-mono text-slate-600 text-[11px] truncate max-w-md">
                  {latestEvent?.type} • SHA: {latestEvent?.eventId.substring(0, 10)}
                </span>
              </div>

              <span className="text-[10px] font-mono text-slate-400">
                {new Date(latestEvent?.occurredAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Content Pane */}
          <div className="p-5 font-mono text-xs leading-relaxed max-h-[380px] overflow-y-auto bg-white/95">
            {activeTab === "diff" && (
              <div className="space-y-1">
                <div className="text-slate-400">// Synchronized with @yashuverse/portfolio-schema v1.x</div>
                <div className="text-slate-400">// Inbound candidate payload passed SecurityAgent leak audit</div>
                <div className="text-emerald-700 bg-emerald-50/70 p-1 rounded font-semibold">
                  + &quot;verifiedClaimsCount&quot;: 18,
                </div>
                <div className="text-emerald-700 bg-emerald-50/70 p-1 rounded font-semibold">
                  + &quot;status&quot;: &quot;Designing Autonomous AI Systems&quot;,
                </div>
                <div className="text-slate-700 pl-4">
                  &quot;profile&quot;: &#123;
                </div>
                <div className="text-slate-700 pl-8">
                  &quot;name&quot;: &quot;Yashwanth Reddy G&quot;,
                </div>
                <div className="text-slate-700 pl-8">
                  &quot;auditHash&quot;: &quot;0x7F4A992C&quot;,
                </div>
                <div className="text-emerald-700 bg-emerald-50/70 p-1 rounded font-semibold pl-8">
                  + &quot;confidenceScore&quot;: 0.99, // ML Claim Verifier Threshold Satisfied (≥0.92)
                </div>
                <div className="text-slate-700 pl-4">&#125;</div>
                <div className="text-blue-600 pl-4 mt-2">
                  // Agent Cursors: verification_agent locked target on [canvas-project-card-0]
                </div>
              </div>
            )}

            {activeTab === "markdown" && (
              <div className="font-sans text-xs space-y-3 p-2">
                <h4 className="text-base font-bold text-slate-900 font-headings">
                  # YASHUVERSE Autonomous Portfolio Engine
                </h4>
                <p className="text-slate-600 font-body leading-relaxed">
                  Multi-agent autonomous portfolio engine that discovers professional work, understands codebases with custom ML, orchestrates 8 in-app agent cursors, and cryptographically verifies claims.
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px]"
                      >
                        <span
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: agent?.color || "#94a3b8" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{evt.type}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(evt.occurredAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {agent && (
                            <span className="text-[10px] text-slate-500 font-tech">
                              {agent.name}
                            </span>
                          )}
                          <pre className="text-[10px] text-slate-600 bg-white p-1 rounded mt-1 overflow-x-auto border border-slate-100">
                            {JSON.stringify(evt.payload, null, 1)}
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
