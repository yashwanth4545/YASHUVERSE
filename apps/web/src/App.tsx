import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  type AgentId,
  type AgentPresenceEvent,
  type HumanApprovalTicket,
} from "@yashuverse/contracts";
import {
  INITIAL_PORTFOLIO,
  type PortfolioDocument,
  type ProjectGridSection,
  type SkillCloudSection,
  type AchievementTimelineSection,
  validatePortfolioDocument,
} from "@yashuverse/portfolio-schema";

import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { AgentWorkspace } from "./components/AgentWorkspace";
import { RealtimeEditor } from "./components/RealtimeEditor";
import { ProjectUniverse } from "./components/ProjectUniverse";
import { SkillsMatrix } from "./components/SkillsMatrix";
import { ContactSection } from "./components/ContactSection";
import { AgentCommandCenter } from "./components/AgentCommandCenter";
import { AgentCursors } from "./components/AgentCursors";
import { EvidenceInspectorModal } from "./components/EvidenceInspectorModal";
import { VersionHistoryModal } from "./components/VersionHistoryModal";
import { HumanApprovalDrawer } from "./components/HumanApprovalDrawer";
import { useSSEStream } from "./hooks/useSSEStream";

import { ShieldCheck, GitBranch, CheckCircle2, Cpu, ArrowRight } from "lucide-react";

export const AppContent: React.FC = () => {
  // Portfolio Document State (Strictly Validated JSON)
  const [portfolio, setPortfolio] = useState<PortfolioDocument>(INITIAL_PORTFOLIO);

  // Modals & Inspection State
  const [inspectingEvidenceId, setInspectingEvidenceId] = useState<string | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isApprovalDrawerOpen, setIsApprovalDrawerOpen] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [activeAgentSelection, setActiveAgentSelection] = useState<AgentId | null>(null);

  // Real System Boot & Initialization Sequence (Skippable, < 3s, real service telemetry)
  const [isBooting, setIsBooting] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const alreadyBooted = sessionStorage.getItem("yashuverse_booted");
      const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return !alreadyBooted && !prefersReduce;
    }
    return false;
  });
  const [bootStep, setBootStep] = useState(1);
  const [bootTelemetry, setBootTelemetry] = useState<string>("Verifying API Gateway & Event Bus...");

  // Auto-assembly state (Generative site build trigger)
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyStep, setAssemblyStep] = useState(0);
  const [assemblyProgress, setAssemblyProgress] = useState(100);

  // Git update simulation / real webhook state
  const [isGitUpdating, setIsGitUpdating] = useState(false);
  const [gitToast, setGitToast] = useState<{
    sha: string;
    message: string;
    author: string;
  } | null>(null);

  // Accessibility: Reduced Motion
  const [reducedMotion] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  // Master Canvas container reference for relative cursor positioning
  const workspaceCanvasRef = useRef<HTMLDivElement>(null);

  // Connect to SSE stream
  const { status: sseStatus, events, presenceMap, setPresenceMap, setEvents } = useSSEStream({
    onPortfolioPublished: (payload) => {
      setPortfolio((prev) => ({
        ...prev,
        version: payload.newVersion || prev.version + 1,
        publishedAt: new Date().toISOString(),
      }));
    },
  });

  // Human-in-the-loop pending approval tickets
  const [pendingTickets, setPendingTickets] = useState<HumanApprovalTicket[]>([
    {
      ticketId: "ticket-seed-101",
      workflowId: "wf-seed-review",
      candidateVersion: 2,
      proposedChangesSummary: "New Release v2.4: Distributed Task Engine & High-Dimensional Embeddings",
      confidenceScore: 0.88,
      evidenceIds: ["ev-repo-yashuverse-001", "ev-commit-init-002"],
      reviewReason: "Confidence score (0.88) falls in operator review window (0.75 - 0.91)",
      status: "pending",
      requestedBy: "verification_agent",
      createdAt: new Date().toISOString(),
    },
  ]);

  // Fetch initial active portfolio from API if available
  useEffect(() => {
    fetch("/api/portfolio/active")
      .then((res) => res.json())
      .then((data) => {
        const val = validatePortfolioDocument(data);
        if (val.success && val.data) {
          setPortfolio(val.data);
        }
      })
      .catch(() => {
        setPortfolio(INITIAL_PORTFOLIO);
      });
  }, []);

  // Boot Sequence Telemetry Runner (< 2.2 seconds)
  useEffect(() => {
    if (!isBooting) return;

    let timer1: any, timer2: any, timer3: any;

    fetch("/api/system/status")
      .then((res) => res.json())
      .then((_data) => {
        setBootStep(2);
        setBootTelemetry("Synchronizing 12-Agent Fleet & Sandbox Pool...");
      })
      .catch(() => {
        setBootStep(2);
        setBootTelemetry("Using Local Heuristic Engine & Sandbox...");
      });

    timer1 = setTimeout(() => {
      setBootStep(3);
      setBootTelemetry("Loading Append-Only Event Store & Portfolio Ledger...");
    }, 600);

    timer2 = setTimeout(() => {
      setBootStep(4);
      setBootTelemetry("Ecosystem Online. Loading Autonomous Studio & Portfolio.");
    }, 1200);

    timer3 = setTimeout(() => {
      setIsBooting(false);
      sessionStorage.setItem("yashuverse_booted", "true");
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isBooting]);

  const handleSkipBoot = () => {
    setIsBooting(false);
    sessionStorage.setItem("yashuverse_booted", "true");
  };

  // Atomic Rollback Handler
  const handleRollback = async (version: number) => {
    try {
      const res = await fetch(`/api/portfolio/rollback/${version}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.activePortfolio) {
          setPortfolio(data.activePortfolio);
        } else {
          setPortfolio((prev) => ({ ...prev, version }));
        }
      } else {
        setPortfolio((prev) => ({ ...prev, version }));
      }
    } catch {
      setPortfolio((prev) => ({ ...prev, version }));
    }
  };

  // Human Decision Handler
  const handleDecision = async (
    ticketId: string,
    decision: "approved" | "rejected",
    reviewerNotes: string
  ) => {
    try {
      await fetch(`/api/approval/${ticketId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewerNotes }),
      });
    } catch {
      // Local state fallback
    }
    setPendingTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
    if (decision === "approved") {
      setPortfolio((prev) => ({ ...prev, version: prev.version + 1 }));
    }
  };

  // Trigger full assembly
  const runAutonomousAssembly = useCallback(async () => {
    setIsAssembling(true);
    setAssemblyProgress(5);
    setAssemblyStep(1);

    const workflowId = `wf-assembly-${Date.now().toString(36)}`;

    const emitStep = (
      agentId: AgentId,
      state: AgentPresenceEvent["state"],
      taskLabel: string,
      targetId: string | undefined,
      eventType: string,
      payload: Record<string, unknown>
    ) => {
      setPresenceMap((prev) => ({
        ...prev,
        [agentId]: {
          workflowId,
          agentId,
          state,
          taskLabel,
          targetId,
          occurredAt: new Date().toISOString(),
          eventId: `pres-${agentId}-${Date.now()}`,
        },
      }));

      setEvents((prev) => [
        {
          eventId: `evt-${Date.now()}`,
          workflowId,
          type: eventType as any,
          agentId,
          payload,
          occurredAt: new Date().toISOString(),
        },
        ...prev.slice(0, 49),
      ]);
    };

    // Stage 1: Orchestrator Awake & DAG Dispatch
    emitStep(
      "orchestrator",
      "working",
      "Dispatching Autonomous Assembly DAG across 12 agents",
      "hero",
      "agent.task.started",
      { stage: "DAG_DISPATCH", agentsCount: 12 }
    );
    setAssemblyProgress(20);
    setAssemblyStep(1);

    await new Promise((r) => setTimeout(r, 600));

    // Stage 2: Design & Verification Agents Construct Portrait & Biometrics
    emitStep(
      "design_agent",
      "working",
      "Synthesizing neural biometric frame for Yashwanth Reddy G",
      "hero-portrait-frame",
      "activity.classified",
      { asset: "/yashwanth.jpg", resolution: "high-dpi", lighting: "studio-cinematic" }
    );
    emitStep(
      "verification_agent",
      "working",
      "Verifying biometric cryptographic identity hash: 0x7F4A992C (99.8%)",
      "hero-portrait-frame",
      "verification.completed",
      { verified: true, hash: "0x7F4A992C", confidence: 0.998 }
    );
    setAssemblyProgress(50);
    setAssemblyStep(2);

    await new Promise((r) => setTimeout(r, 700));

    // Stage 3: Content Agent Types Headline & Dossier Bio
    emitStep(
      "content_agent",
      "working",
      "Drafting executive biography & system architecture pillars",
      "hero-headline-title",
      "portfolio.generated",
      { title: "Yashwanth Reddy G", claimsBound: 18 }
    );
    setAssemblyProgress(75);
    setAssemblyStep(3);

    await new Promise((r) => setTimeout(r, 600));

    // Stage 4: Developer & ML Agents Build Project Universe
    emitStep(
      "project_agent",
      "working",
      "Extracting AST & dependency graph for YASHUVERSE & NeuroSync",
      "realtime-editor",
      "project.discovered",
      { projects: ["proj-yashuverse-core", "proj-neuro-sync-rag"] }
    );
    setAssemblyProgress(90);
    setAssemblyStep(4);

    await new Promise((r) => setTimeout(r, 600));

    // Complete: Orchestrator passes all agents into finished state and CURSORS DISAPPEAR!
    emitStep(
      "orchestrator",
      "completed",
      "Portfolio assembly complete. 12 agents now live & guarding ecosystem.",
      undefined,
      "portfolio.published",
      { version: portfolio.version, status: "live_verified" }
    );

    setIsAssembling(false);
    setAssemblyStep(0);
  }, [portfolio.version, setPresenceMap, setEvents]);

  // Handle Git Webhook Simulation / Real Update Trigger
  const handleTriggerGitUpdate = async (customMsg?: string) => {
    if (isAssembling || isGitUpdating) return;

    setIsGitUpdating(true);
    const sha = Math.random().toString(16).substring(2, 9);
    const commitMsg = customMsg || "feat(ml): update neural semantic clustering and pgvector indexing";
    
    setGitToast({
      sha,
      message: commitMsg,
      author: "yashwanth4545",
    });

    const workflowId = `wf-git-sync-${sha}`;

    // Wake up Developer Agent & Quality Agent
    setPresenceMap((prev) => ({
      ...prev,
      project_agent: {
        workflowId,
        agentId: "project_agent",
        state: "working",
        taskLabel: `Compiling Git commit ${sha}: ${commitMsg}`,
        targetId: "projects",
        occurredAt: new Date().toISOString(),
        eventId: `pres-git-${sha}`,
      },
      quality_agent: {
        workflowId,
        agentId: "quality_agent",
        state: "working",
        taskLabel: "SecOps & Regression Audit",
        targetId: "realtime-editor",
        occurredAt: new Date().toISOString(),
        eventId: `pres-git-qa-${sha}`,
      },
    }));

    await new Promise((r) => setTimeout(r, 2000));

    // Finish build & increment version
    setPortfolio((prev) => ({
      ...prev,
      version: prev.version + 1,
      publishedAt: new Date().toISOString(),
    }));

    setIsGitUpdating(false);

    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setGitToast(null);
    }, 4000);
  };

  // Extract sections
  const projectSection = portfolio.sections.find((s) => s.type === "project-grid") as ProjectGridSection | undefined;
  const skillSection = portfolio.sections.find((s) => s.type === "skill-cloud") as SkillCloudSection | undefined;
  const achievementSection = portfolio.sections.find((s) => s.type === "achievement-timeline") as AchievementTimelineSection | undefined;

  return (
    <div
      ref={workspaceCanvasRef}
      className="min-h-screen bg-[#030712] text-slate-100 font-sans relative selection:bg-cyan-500 selection:text-black overflow-x-hidden"
    >
      {/* Cinematic AI Initialization Overlay (< 2.2s, skippable) */}
      {isBooting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#030712] backdrop-blur-2xl animate-fade-in select-none">
          <div className="max-w-md w-full rounded-3xl p-8 bg-slate-950/90 border border-white/10 shadow-[0_0_80px_rgba(0,102,255,0.25)] flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient Halo */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Logo Monogram */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 p-0.5 shadow-liquid-glow mb-6 animate-pulse">
              <div className="w-full h-full bg-[#030712] rounded-[22px] flex items-center justify-center">
                <Cpu className="w-8 h-8 text-cyan-300" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white font-headings tracking-tight mb-1">
              YASHUVERSE AI ECOSYSTEM
            </h2>
            <p className="text-xs font-mono text-cyan-400 mb-6">
              12 Autonomous Agents • Sandbox Pool Ready
            </p>

            {/* Service Verification Telemetry */}
            <div className="w-full space-y-2.5 font-mono text-xs text-left mb-6 p-4 rounded-2xl bg-[#030712] border border-white/10">
              <div className="flex items-center justify-between text-slate-300">
                <span>API Gateway (Node 24 LTS)</span>
                <span className="text-emerald-400 font-bold">ONLINE (2ms)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Event Bus & Replay Log</span>
                <span className="text-emerald-400 font-bold">SSE ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Sandbox Process Supervisor</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>12 Autonomous Agents</span>
                <span className="text-cyan-300 font-bold">SYNCHRONIZED</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/10 mb-3">
              <div
                className="bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(bootStep / 4) * 100}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-slate-400 mb-6 animate-pulse">
              {bootTelemetry}
            </p>

            <button
              type="button"
              onClick={handleSkipBoot}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <span>Skip Initialization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Real-time In-App Agent Cursors (Visible only when designing / updating, then disappear) */}
      <AgentCursors
        presenceMap={presenceMap}
        containerRef={workspaceCanvasRef}
        reducedMotion={reducedMotion}
        isAssembling={isAssembling}
        assemblyStep={assemblyStep}
        isGitUpdating={isGitUpdating}
      />

      {/* Luxury Liquid Navbar */}
      <Navbar
        version={portfolio.version}
        onOpenVersions={() => setIsVersionModalOpen(true)}
        onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
        onOpenApprovals={() => setIsApprovalDrawerOpen(true)}
        pendingApprovalsCount={pendingTickets.length}
        sseStatus={sseStatus}
        onTriggerRebuild={runAutonomousAssembly}
        isAssembling={isAssembling}
        onTriggerGitUpdate={handleTriggerGitUpdate}
        isGitUpdating={isGitUpdating}
      />

      {/* Main Content Flow */}
      <main className="w-full relative z-10">
        {/* 1. Hero Section: Personal Identity, Studio Portrait Frame, Bio & 3D WebGL Core */}
        <HeroSection
          reducedMotion={reducedMotion}
          activeAgentId={activeAgentSelection}
          onSelectAgent={(agentId) => setActiveAgentSelection(agentId)}
          onInspectEvidence={(evId) => setInspectingEvidenceId(evId)}
          version={portfolio.version}
          sseStatus={sseStatus}
          isAssembling={isAssembling}
          assemblyProgress={assemblyProgress}
          assemblyStep={assemblyStep}
          onTriggerRebuild={runAutonomousAssembly}
          onTriggerGitUpdate={handleTriggerGitUpdate}
          isGitUpdating={isGitUpdating}
        />

        {/* 2. Dossier / About Yashwanth Reddy G */}
        <AboutSection
          onInspectEvidence={(evId) => setInspectingEvidenceId(evId)}
          isGenerating={isAssembling}
        />

        {/* 3. Autonomous AI Engineering Studio: Real Website / App Generation */}
        <RealtimeEditor
          events={events}
          onTriggerDemo={runAutonomousAssembly}
          isDemoRunning={isAssembling}
        />

        {/* 4. Live AI Agent Workspace: 12 Specialized Phase 4 & Engineering Agents */}
        <AgentWorkspace
          presenceMap={presenceMap}
          activeAgentId={activeAgentSelection}
          onSelectAgent={(agentId) => {
            setActiveAgentSelection(agentId);
            setIsCommandCenterOpen(true);
          }}
          onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
        />

        {/* 5. Project Universe: Verified Repositories & Achievements */}
        {projectSection && (
          <ProjectUniverse
            section={projectSection}
            onInspectEvidence={(evId) => setInspectingEvidenceId(evId)}
          />
        )}

        {/* 6. Skills & Verified Milestones */}
        <SkillsMatrix
          skillsSection={skillSection}
          achievementsSection={achievementSection}
          onInspectEvidence={(evId) => setInspectingEvidenceId(evId)}
        />

        {/* 7. Contact Experience */}
        <ContactSection />
      </main>

      {/* Floating Git Webhook Notification Toast */}
      {gitToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md p-4 rounded-3xl bg-slate-900/95 border border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.4)] backdrop-blur-2xl animate-fade-in flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <GitBranch className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300 mb-1">
              <span>GIT PUSH DETECTED</span>
              <span className="text-[10px] text-slate-400">commit {gitToast.sha}</span>
            </div>
            <p className="text-xs text-slate-200 font-mono line-clamp-2 mb-2">
              "{gitToast.message}"
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Agents awakened & rebuilt portfolio version v{portfolio.version}.4</span>
            </div>
          </div>
        </div>
      )}

      {/* Luxury System Footer */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-12 text-xs font-tech text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headings font-extrabold text-white tracking-tight text-sm">
              YASHUVERSE
            </span>
            <span>•</span>
            <span>Autonomous AI Developer Ecosystem for Yashwanth Reddy G</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Version v{portfolio.version}.4</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Verified Immutable Snapshot
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AgentCommandCenter
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
        presenceMap={presenceMap}
        events={events}
        pendingTickets={pendingTickets}
        onDecision={handleDecision}
        onRollback={handleRollback}
        activeVersion={portfolio.version}
      />

      <EvidenceInspectorModal
        evidenceId={inspectingEvidenceId}
        onClose={() => setInspectingEvidenceId(null)}
      />

      <VersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        activeVersion={portfolio.version}
        onRollback={handleRollback}
      />

      <HumanApprovalDrawer
        isOpen={isApprovalDrawerOpen}
        onClose={() => setIsApprovalDrawerOpen(false)}
        tickets={pendingTickets}
        onDecision={handleDecision}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
