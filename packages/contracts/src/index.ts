/**
 * @yashuverse/contracts
 * Master event contracts, presence definitions, and workflow types for YASHUVERSE
 */

export type SourceType = "github" | "linkedin" | "document" | "manual";

export interface SourceEvent {
  eventId: string;
  source: SourceType;
  sourceUrl?: string;
  eventType: string;
  actor?: string;
  occurredAt: string;
  content: string;
  metadata: Record<string, unknown>;
}

export type AgentId =
  | "orchestrator"
  | "source_agent"
  | "project_agent"
  | "profile_agent"
  | "ml_intelligence"
  | "content_agent"
  | "design_agent"
  | "verification_agent"
  | "publishing_agent";

export type AgentState = "idle" | "queued" | "working" | "completed" | "blocked" | "failed";

export interface AgentPresenceEvent {
  workflowId: string;
  agentId: AgentId;
  state: AgentState;
  taskLabel: string;
  targetId?: string; // canvas target DOM id, e.g. "canvas-project-card-1"
  progress?: number; // 0 to 100, only if measured
  occurredAt: string;
  eventId: string;
}

export type WorkflowEventType =
  | "source.received"
  | "activity.classified"
  | "project.discovered"
  | "entity.matched"
  | "knowledge.updated"
  | "agent.task.queued"
  | "agent.task.started"
  | "agent.task.progress"
  | "agent.task.completed"
  | "agent.task.failed"
  | "verification.completed"
  | "portfolio.generated"
  | "portfolio.published";

export interface WorkflowEvent<T = unknown> {
  eventId: string;
  workflowId: string;
  type: WorkflowEventType;
  agentId?: AgentId;
  payload: T;
  occurredAt: string;
}

export type ClaimType = "repository" | "technology" | "role" | "achievement" | "ownership" | "education";
export type VerificationDecision = "verified" | "review_required" | "blocked";

export interface EvidenceRecord {
  evidenceId: string;
  source: SourceType;
  sourceUrl?: string;
  sourceHash: string;
  snippet: string;
  collectedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ClaimVerification {
  claimId: string;
  claimType: ClaimType;
  claimText: string;
  evidenceIds: string[];
  confidenceScore: number;
  decision: VerificationDecision;
  policyNotes?: string;
  reviewedBy?: string;
  verifiedAt?: string;
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  shortRole: string;
  role: string;
  color: string;
  accentBg: string;
  description: string;
}

export const AGENT_REGISTRY: Record<AgentId, AgentDefinition> = {
  orchestrator: {
    id: "orchestrator",
    name: "Orchestrator Agent",
    shortRole: "Workflow Director",
    role: "Plans task graph, manages dependencies, budgets & retries",
    color: "#f43f5e",
    accentBg: "rgba(244, 63, 94, 0.12)",
    description: "Maintains overall workflow DAG, coordinates agent handoffs and failure recovery.",
  },
  source_agent: {
    id: "source_agent",
    name: "Source Agent",
    shortRole: "Data Ingestion",
    role: "Discovers and opens evidence from authorized sources",
    color: "#06b6d4",
    accentBg: "rgba(6, 182, 212, 0.12)",
    description: "Ingests commits, PRs, documents, and verified posts; computes SHA-256 idempotency hashes.",
  },
  project_agent: {
    id: "project_agent",
    name: "Project Agent",
    shortRole: "Project Synthesizer",
    role: "Groups repository activity into canonical project cards",
    color: "#6366f1",
    accentBg: "rgba(99, 102, 241, 0.12)",
    description: "Deduplicates repo activities and synthesizes canonical project entities.",
  },
  profile_agent: {
    id: "profile_agent",
    name: "Profile Agent",
    shortRole: "Skill & Experience Extractor",
    role: "Extracts validated roles, skills, and timeline facts",
    color: "#3b82f6",
    accentBg: "rgba(59, 130, 246, 0.12)",
    description: "Parses experiences, verified certifications, and core competencies with provenance tags.",
  },
  ml_intelligence: {
    id: "ml_intelligence",
    name: "ML Intelligence Agent",
    shortRole: "Classifier & Matcher",
    role: "Classifies, matches entities, and ranks information",
    color: "#a855f7",
    accentBg: "rgba(168, 85, 247, 0.12)",
    description: "Runs TF-IDF + Logistic Regression classification, entity disambiguation, and calibrated confidence scoring.",
  },
  content_agent: {
    id: "content_agent",
    name: "Content Agent",
    shortRole: "Factual Copywriter",
    role: "Drafts factual, concise copy strictly from supported facts",
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.12)",
    description: "Drafts executive biographies, project narratives, and technical summaries bounded by verified evidence.",
  },
  design_agent: {
    id: "design_agent",
    name: "Design Agent",
    shortRole: "Layout Architect",
    role: "Arranges approved portfolio sections and layout hierarchy",
    color: "#ec4899",
    accentBg: "rgba(236, 72, 153, 0.12)",
    description: "Selects whitelisted component layouts (project-grid, achievement-timeline) conforming to Apple-minimal styling.",
  },
  verification_agent: {
    id: "verification_agent",
    name: "Verification Agent",
    shortRole: "Evidence Auditor",
    role: "Inspects evidence and marks claims verified, blocked, or review-required",
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.12)",
    description: "Evaluates claim policies against raw evidence IDs; blocks ungrounded assertions.",
  },
  publishing_agent: {
    id: "publishing_agent",
    name: "Publishing Agent",
    shortRole: "Deployment Gatekeeper",
    role: "Stages and atomically publishes approved portfolio versions",
    color: "#2563eb",
    accentBg: "rgba(37, 99, 235, 0.12)",
    description: "Performs checksum verification, writes immutable version records, and atomically switches active pointer.",
  },
};
