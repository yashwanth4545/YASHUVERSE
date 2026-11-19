import React, { useState } from "react";
import {
  type AgentId,
  type AgentPresenceEvent,
  type WorkflowEvent,
  type HumanApprovalTicket,
  AGENT_REGISTRY,
} from "@yashuverse/contracts";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Layers,
  GitBranch,
  Database,
  Shield,
  KeyRound,
  RotateCcw,
  Unlock,
  Lock,
  Terminal,
} from "lucide-react";

interface AgentCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  presenceMap: Record<AgentId, AgentPresenceEvent>;
  events: WorkflowEvent[];
  pendingTickets: HumanApprovalTicket[];
  onDecision: (ticketId: string, decision: "approved" | "rejected", reviewerNotes: string) => void;
  onRollback: (version: number) => void;
  activeVersion: number;
}

export const AgentCommandCenter: React.FC<AgentCommandCenterProps> = ({
  isOpen,
  onClose,
  presenceMap,
  events,
  pendingTickets,
  onDecision,
  onRollback,
  activeVersion,
}) => {
  const { isOwner, unlockOwnerMode, lockOwnerMode } = useAuth();
  const [activeTab, setActiveTab] = useState<"fleet" | "dag" | "blackboard" | "audit" | "owner">("fleet");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [rollbackInput, setRollbackInput] = useState<number>(Math.max(1, activeVersion - 1));

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockOwnerMode(passcodeInput);
    if (!success) {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 3000);
    } else {
      setPasscodeInput("");
      setActiveTab("owner");
    }
  };

  const dagNodes: AgentId[] = [
    "source_agent",
    "ml_intelligence",
    "project_agent",
    "verification_agent",
    "content_agent",
    "security_agent",
    "quality_agent",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[820px] rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-headings">
                  AI Command Center & Governance
                </h3>
                {isOwner ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-400/50">
                    <Unlock className="w-2.5 h-2.5 text-emerald-400" /> OWNER MODE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-white/10">
                    <Lock className="w-2.5 h-2.5 text-cyan-400" /> VISITOR (READ-ONLY)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-tech">
                Telemetry, real-time DAG orchestration, blackboard state, and human approval queue
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto bg-slate-950/90">
          {[
            { id: "fleet", label: "Agent Fleet (7)", icon: Layers },
            { id: "dag", label: "Orchestration DAG", icon: GitBranch },
            { id: "blackboard", label: "Shared Blackboard", icon: Database },
            { id: "audit", label: "Audit Ledger", icon: Terminal },
            { id: "owner", label: "Owner Control Room", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-tech font-bold transition-colors whitespace-nowrap ${
                  isSelected
                    ? "border-cyan-400 text-cyan-300 bg-blue-600/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === "owner" && pendingTickets.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                    {pendingTickets.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/60">
          {/* TAB 1: FLEET TELEMETRY */}
          {activeTab === "fleet" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dagNodes.map((agentId) => {
                  const presence = presenceMap[agentId];
                  const def = AGENT_REGISTRY[agentId] || { name: agentId, color: "#0066ff" };
                  return (
                    <div
                      key={agentId}
                      className="p-4 rounded-3xl bg-slate-950/80 border border-white/10 shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                            style={{ backgroundColor: def.color }}
                          />
                          <div>
                            <div className="text-sm font-bold text-white font-headings">
                              {def.name}
                            </div>
                            <div className="text-[10px] font-mono text-cyan-400">@{agentId}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-white/10 capitalize">
                          {presence?.state || "idle"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-tech mb-3 bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                        {presence?.taskLabel || "Docked — waiting for workflow event"}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                        <span>Event: {presence?.eventId ? presence.eventId.substring(0, 14) : "idle"}</span>
                        <span>{presence?.occurredAt ? new Date(presence.occurredAt).toLocaleTimeString() : "Ready"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ORCHESTRATION DAG */}
          {activeTab === "dag" && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-white/10 shadow-sm">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4">
                  Autonomous Multi-Agent DAG Flow (Phase 4 Topology)
                </h4>

                <div className="space-y-3">
                  {dagNodes.map((agentId, index) => {
                    const presence = presenceMap[agentId];
                    const def = AGENT_REGISTRY[agentId];
                    const isWorking = presence?.state === "working";
                    const isCompleted = presence?.state === "completed";

                    return (
                      <div key={agentId} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500 w-6">0{index + 1}</span>
                        <div
                          className={`flex-1 p-3.5 rounded-2xl border flex items-center justify-between ${
                            isWorking
                              ? "bg-blue-950/80 border-cyan-400 shadow-liquid-glow"
                              : isCompleted
                              ? "bg-emerald-950/40 border-emerald-400/50"
                              : "bg-slate-900/60 border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${isWorking ? "animate-ping" : ""}`}
                              style={{ backgroundColor: def?.color || "#00F0FF" }}
                            />
                            <span className="text-xs font-bold text-white font-tech">
                              {def?.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono capitalize text-cyan-300">
                            {presence?.state || "idle"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHARED MEMORY BLACKBOARD */}
          {activeTab === "blackboard" && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-white/10 shadow-sm font-mono text-xs">
                <div className="text-cyan-400 mb-3">// SharedMemoryStore: Multi-Agent Blackboard Snapshot</div>
                <div className="space-y-2 bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto text-[11px] border border-white/10">
                  <div>&#123;</div>
                  <div className="pl-4 text-emerald-400">&quot;activeWorkflowId&quot;: &quot;wf-yashuverse-live&quot;,</div>
                  <div className="pl-4 text-cyan-300">&quot;memoryLeaseHolder&quot;: &quot;verification_agent&quot;,</div>
                  <div className="pl-4 text-amber-300">&quot;confidenceThreshold&quot;: 0.92,</div>
                  <div className="pl-4 text-slate-400">&quot;sharedPayloads&quot;: &#123;</div>
                  <div className="pl-8 text-cyan-300">&quot;sourceArtifact&quot;: &quot;github://yashwanth4545/YASHUVERSE&quot;,</div>
                  <div className="pl-8 text-cyan-300">&quot;verifiedEvidenceCount&quot;: 18,</div>
                  <div className="pl-8 text-cyan-300">&quot;duplicateMatch&quot;: false</div>
                  <div className="pl-4 text-slate-400">&#125;</div>
                  <div>&#125;</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LEDGER */}
          {activeTab === "audit" && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {events.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-slate-400">
                  Audit buffer synchronized. No active events.
                </div>
              ) : (
                events.map((evt, idx) => (
                  <div
                    key={evt.eventId || idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 shadow-sm text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 mb-1">
                      <span className="font-bold text-white">{evt.type}</span>
                      <span>{new Date(evt.occurredAt).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-[10px] text-slate-300 bg-slate-900 p-2.5 rounded-xl overflow-x-auto border border-white/5">
                      {JSON.stringify(evt.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: OWNER CONTROL ROOM */}
          {activeTab === "owner" && (
            <div className="space-y-6">
              {!isOwner ? (
                <div className="p-8 rounded-3xl bg-slate-950/80 border border-white/15 shadow-2xl text-center max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-cyan-400 mx-auto flex items-center justify-center mb-4 border border-cyan-400/30">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-white font-headings mb-2">
                    Owner Authentication
                  </h4>
                  <p className="text-xs text-slate-400 font-tech mb-6 leading-relaxed">
                    Visitor mode is read-only. Enter the owner passcode or use demo unlock to approve pending tickets, execute version rollbacks, or publish changes.
                  </p>

                  <form onSubmit={handleUnlock} className="space-y-3">
                    <input
                      type="password"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="Passcode (e.g. yashuverse-owner-2026)"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/20 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    {passcodeError && (
                      <div className="text-xs font-tech text-rose-400">
                        Invalid owner authorization passcode.
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-tech font-bold hover:from-blue-500 hover:to-cyan-400 transition-colors shadow-liquid-glow"
                    >
                      Unlock Owner Controls
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        unlockOwnerMode("yashuverse-owner-2026");
                        setActiveTab("owner");
                      }}
                      className="w-full py-2 text-xs font-mono text-cyan-400 hover:underline"
                    >
                      Quick Demo Unlock
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Owner Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-tech font-bold text-emerald-300">
                        Owner Session Active • Privileged Mutation Rights Granted
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={lockOwnerMode}
                      className="text-xs font-mono text-emerald-400 hover:underline"
                    >
                      Lock / Return to Visitor Mode
                    </button>
                  </div>

                  {/* Pending Approval Tickets Queue */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
                      Pending Human-in-the-Loop Tickets ({pendingTickets.length})
                    </h4>
                    {pendingTickets.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 text-center text-xs font-tech text-slate-400">
                        No pending approval tickets. System running in verified steady state.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingTickets.map((ticket) => (
                          <div
                            key={ticket.ticketId}
                            className="p-5 rounded-3xl bg-slate-950/80 border border-amber-400/40 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <div className="text-sm font-bold text-white font-tech">
                                  {ticket.proposedChangesSummary}
                                </div>
                                <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                                  Ticket: {ticket.ticketId} • Candidate v{ticket.candidateVersion} • Confidence: {ticket.confidenceScore}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-400/50 font-bold">
                                {ticket.reviewReason}
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => onDecision(ticket.ticketId, "rejected", "Rejected by owner.")}
                                className="px-4 py-2 rounded-xl border border-rose-400/40 text-rose-300 text-xs font-tech font-semibold hover:bg-rose-950/50 transition-colors"
                              >
                                Reject Candidate
                              </button>
                              <button
                                type="button"
                                onClick={() => onDecision(ticket.ticketId, "approved", "Approved by owner.")}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-tech font-bold hover:from-blue-500 hover:to-cyan-400 transition-colors shadow-liquid-glow"
                              >
                                Approve & Publish
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Version Rollback Control */}
                  <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 shadow-sm">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">
                      Atomic Version Rollback
                    </h4>
                    <p className="text-xs text-slate-400 font-tech mb-4">
                      Immediately switch active pointer back to an immutable prior snapshot.
                    </p>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-300">Rollback to version:</span>
                      <input
                        type="number"
                        min="1"
                        max={activeVersion}
                        value={rollbackInput}
                        onChange={(e) => setRollbackInput(parseInt(e.target.value, 10))}
                        className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-xs font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={() => onRollback(rollbackInput)}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-tech font-bold hover:bg-rose-500 transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Execute Rollback</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
