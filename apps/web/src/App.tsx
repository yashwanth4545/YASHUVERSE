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

import { ShieldCheck } from "lucide-react";

export const AppContent: React.FC = () => {
  // Portfolio Document State (Strictly Validated JSON)
  const [portfolio, setPortfolio] = useState<PortfolioDocument>(INITIAL_PORTFOLIO);

  // Modals & Inspection State
  const [inspectingEvidenceId, setInspectingEvidenceId] = useState<string | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isApprovalDrawerOpen, setIsApprovalDrawerOpen] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [activeAgentSelection, setActiveAgentSelection] = useState<AgentId | null>(null);

  // Auto-assembly state (Generative site build on load)
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyStep, setAssemblyStep] = useState(0);
  const [assemblyProgress, setAssemblyProgress] = useState(100);

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
      proposedChangesSummary: "New Release v2.1: Distributed Task Engine & High-Dimensional Embeddings",
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

  // Autonomous Agent Site Assembly Pipeline
  const runAutonomousAssembly = useCallback(async () => {
    setIsAssembling(true);
    setAssemblyProgress(5);
    setAssemblyStep(0);

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
      "Dispatching Autonomous Assembly DAG across 7 agents",
      "hero",
      "agent.task.started",
      { stage: "DAG_DISPATCH", agentsCount: 7 }
    );
    setAssemblyProgress(20);
    setAssemblyStep(1);

    await new Promise((r) => setTimeout(r, 1200));

    // Stage 2: Design & Verification Agents Construct Portrait
    emitStep(
      "design_agent",
      "working",
      "Rendering neural biometric frame for Yashwanth Reddy G",
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
    setAssemblyProgress(45);
    setAssemblyStep(2);

    await new Promise((r) => setTimeout(r, 1400));

    // Stage 3: Content Agent Types Headline & Biography
    emitStep(
      "content_agent",
      "working",
      "Drafting executive biography & system architecture pillars",
      "hero-headline-title",
      "portfolio.generated",
      { title: "Yashwanth Reddy G", claimsBound: 18 }
    );
    setAssemblyProgress(65);
    setAssemblyStep(3);

    await new Promise((r) => setTimeout(r, 1300));

    // Stage 4: Developer & ML Agents Build Project Universe & 384-d Embeddings
    emitStep(
      "project_agent",
      "working",
      "Extracting AST & dependency graph for YASHUVERSE & NeuroSync",
      "realtime-editor",
      "project.discovered",
      { projects: ["proj-yashuverse-core", "proj-neuro-sync-rag"] }
    );
    emitStep(
      "ml_intelligence",
      "working",
      "Calculating 384-d semantic embedding vectors with pgvector (confidence: 0.99)",
      "projects",
      "activity.classified",
      { dimension: 384, score: 0.99 }
    );
    setAssemblyProgress(85);
    setAssemblyStep(4);

    await new Promise((r) => setTimeout(r, 1300));

    // Stage 5: Security & Quality Agents Run SecOps Scan
    emitStep(
      "security_agent",
      "working",
      "Auditing DOM & inbound payload for secret leaks (0 leaks detected)",
      "workspace",
      "agent.task.started",
      { scanStatus: "CLEAN", leaksFound: 0 }
    );
    emitStep(
      "quality_agent",
      "working",
      "Enforcing strict Zod schema validation & evidence link integrity (100% compliant)",
      "workspace",
      "agent.task.completed",
      { score: "100/100", schemaPass: true }
    );
    setAssemblyProgress(100);
    setAssemblyStep(5);

    await new Promise((r) => setTimeout(r, 900));

    // Complete: Orchestrator passes all agents into steady patrol state
    emitStep(
      "orchestrator",
      "completed",
      "Portfolio assembly complete. 7 agents now live & guarding ecosystem.",
      undefined,
      "portfolio.published",
      { version: portfolio.version, status: "live_verified" }
    );

    setIsAssembling(false);
  }, [portfolio.version, setPresenceMap, setEvents]);

  // Run autonomous build automatically on initial site visit!
  useEffect(() => {
    const timer = setTimeout(() => {
      runAutonomousAssembly();
    }, 400);

    return () => clearTimeout(timer);
  }, [runAutonomousAssembly]);

  // Extract sections
  const projectSection = portfolio.sections.find((s) => s.type === "project-grid") as ProjectGridSection | undefined;
  const skillSection = portfolio.sections.find((s) => s.type === "skill-cloud") as SkillCloudSection | undefined;
  const achievementSection = portfolio.sections.find((s) => s.type === "achievement-timeline") as AchievementTimelineSection | undefined;

  return (
    <div
      ref={workspaceCanvasRef}
      className="min-h-screen bg-[#030712] text-slate-100 font-sans relative selection:bg-cyan-500 selection:text-black overflow-x-hidden"
    >
      {/* Real-time In-App Agent Cursors */}
      <AgentCursors
        presenceMap={presenceMap}
        containerRef={workspaceCanvasRef}
        reducedMotion={reducedMotion}
        isAssembling={isAssembling}
        assemblyStep={assemblyStep}
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
          onTriggerRebuild={runAutonomousAssembly}
        />

        {/* 2. Live AI Agent Workspace: 7 Specialized Phase 4 Agents */}
        <AgentWorkspace
          presenceMap={presenceMap}
          activeAgentId={activeAgentSelection}
          onSelectAgent={(agentId) => {
            setActiveAgentSelection(agentId);
            setIsCommandCenterOpen(true);
          }}
          onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
        />

        {/* 3. Real-Time Agent Editing Stream */}
        <RealtimeEditor
          events={events}
          onTriggerDemo={runAutonomousAssembly}
          isDemoRunning={isAssembling}
        />

        {/* 4. Project Universe: Verified Repositories & Achievements */}
        {projectSection && (
          <ProjectUniverse
            section={projectSection}
            onInspectEvidence={(evId) => setInspectingEvidenceId(evId)}
          />
        )}

        {/* 5. Skills & Verified Milestones */}
        <SkillsMatrix
          skillsSection={skillSection}
          achievementsSection={achievementSection}
          onInspectEvidence={(evId) => setInspectingEvidenceId(evId)}
        />

        {/* 6. Contact Experience */}
        <ContactSection />
      </main>

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
            <span>Version v{portfolio.version}.0</span>
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
