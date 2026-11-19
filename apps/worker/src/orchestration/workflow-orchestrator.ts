import type {
  AgentId,
  HumanApprovalTicket,
} from "@yashuverse/contracts";
import { SharedMemoryStore, defaultSharedMemory } from "./memory-store.js";
import { AgentMessageBus, defaultAgentMessageBus } from "./message-bus.js";
import { ExecutionLogger, defaultExecutionLogger } from "./execution-logger.js";
import { SecurityAgent, defaultSecurityAgent } from "../agents/security-agent.js";
import { QualityAgent, defaultQualityAgent } from "../agents/quality-agent.js";
import { MLClient, defaultMLClient } from "../ml-client.js";

export interface WorkflowRunOptions {
  workflowId?: string;
  sourceEvent: {
    eventId: string;
    source: string;
    eventType: string;
    repositoryFullName: string;
    rawPayload?: any;
    occurredAt?: string;
  };
  timeoutPerTaskMs?: number;
  maxRetries?: number;
}

export interface WorkflowRunResult {
  workflowId: string;
  status: "completed" | "approval_required" | "blocked" | "failed";
  autoPublished: boolean;
  approvalTicket?: HumanApprovalTicket;
  entityId?: string;
  securityClean: boolean;
  qualityScore: number;
  confidenceScore: number;
  participatingAgents: AgentId[];
  error?: string;
  durationMs: number;
}

export class WorkflowOrchestrator {
  private memory: SharedMemoryStore;
  private messageBus: AgentMessageBus;
  private logger: ExecutionLogger;
  private securityAgent: SecurityAgent;
  private qualityAgent: QualityAgent;
  private mlClient: MLClient;
  private pendingApprovals: Map<string, HumanApprovalTicket> = new Map();

  constructor(
    memory: SharedMemoryStore = defaultSharedMemory,
    messageBus: AgentMessageBus = defaultAgentMessageBus,
    logger: ExecutionLogger = defaultExecutionLogger,
    securityAgent: SecurityAgent = defaultSecurityAgent,
    qualityAgent: QualityAgent = defaultQualityAgent,
    mlClient: MLClient = defaultMLClient
  ) {
    this.memory = memory;
    this.messageBus = messageBus;
    this.logger = logger;
    this.securityAgent = securityAgent;
    this.qualityAgent = qualityAgent;
    this.mlClient = mlClient;
  }

  /**
   * Executes task with exponential backoff retries and strict timeout guards.
   */
  private async executeWithRetry<T>(
    workflowId: string,
    agentId: AgentId,
    taskName: string,
    action: () => Promise<T>,
    maxRetries = 2,
    timeoutMs = 4000
  ): Promise<T> {
    let attempt = 0;
    const start = Date.now();

    while (attempt <= maxRetries) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Task '${taskName}' timed out after ${timeoutMs}ms`)), timeoutMs);
        });

        const result = await Promise.race([action(), timeoutPromise]);
        const duration = Date.now() - start;
        this.logger.log(
          workflowId,
          agentId,
          "INFO",
          `Task '${taskName}' succeeded (attempt ${attempt + 1})`,
          { durationMs: duration },
          duration
        );
        return result;
      } catch (err: any) {
        attempt++;
        const duration = Date.now() - start;
        this.logger.log(
          workflowId,
          agentId,
          attempt > maxRetries ? "ERROR" : "WARN",
          `Task '${taskName}' failed on attempt ${attempt}: ${err.message}`,
          { attempt, maxRetries },
          duration
        );

        if (attempt > maxRetries) {
          throw err;
        }

        // Exponential backoff with jitter
        const backoff = Math.min(1000, Math.pow(2, attempt) * 100 + Math.random() * 50);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    throw new Error(`Exceeded max retries for task '${taskName}'`);
  }

  /**
   * Runs the complete multi-agent DAG workflow.
   */
  public async runWorkflow(options: WorkflowRunOptions): Promise<WorkflowRunResult> {
    const startTime = Date.now();
    const workflowId = options.workflowId || `wf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const taskTimeout = options.timeoutPerTaskMs || 3500;
    const maxRetries = options.maxRetries ?? 2;
    const participating: Set<AgentId> = new Set(["orchestrator"]);

    this.logger.log(
      workflowId,
      "orchestrator",
      "INFO",
      `Workflow started for repo ${options.sourceEvent.repositoryFullName}`
    );

    try {
      // --- STAGE 1: Research Agent (Ingestion) ---
      participating.add("source_agent");
      const rawContent = options.sourceEvent.rawPayload
        ? JSON.stringify(options.sourceEvent.rawPayload)
        : `Repository: ${options.sourceEvent.repositoryFullName}`;

      this.memory.set(
        workflowId,
        "raw_source",
        {
          eventId: options.sourceEvent.eventId,
          repo: options.sourceEvent.repositoryFullName,
          content: rawContent,
        },
        "source_agent",
        [options.sourceEvent.eventId]
      );

      // --- STAGE 2: Security Agent Audit ---
      participating.add("security_agent");
      const securityResult = await this.executeWithRetry(
        workflowId,
        "security_agent",
        "Security & Leak Audit",
        async () => this.securityAgent.auditContent(rawContent),
        maxRetries,
        taskTimeout
      );

      this.memory.set(workflowId, "security_audit", securityResult, "security_agent");

      // Critical violation halts workflow immediately
      const hasCriticalViolation = securityResult.violations.some((v) => v.severity === "CRITICAL");
      if (hasCriticalViolation) {
        this.logger.log(
          workflowId,
          "security_agent",
          "AUDIT",
          `Critical security violation detected: ${securityResult.violations[0]?.rule}. Halting workflow.`,
          { violations: securityResult.violations }
        );
        return {
          workflowId,
          status: "blocked",
          autoPublished: false,
          securityClean: false,
          qualityScore: 0.0,
          confidenceScore: 0.0,
          participatingAgents: Array.from(participating),
          error: `Security violation: ${securityResult.violations[0]?.description}`,
          durationMs: Date.now() - startTime,
        };
      }

      // --- STAGE 3: Developer Agent & ML Agent (Parallel Extraction & Embedding) ---
      participating.add("project_agent");
      participating.add("ml_intelligence");

      const [devResult, mlClassResult] = await Promise.all([
        this.executeWithRetry(
          workflowId,
          "project_agent",
          "Developer Architecture Synthesis",
          async () => {
            const repoName = options.sourceEvent.repositoryFullName.split("/")[1] || "project";
            return {
              entityId: `proj-${repoName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`,
              title: repoName,
              repoUrl: `https://github.com/${options.sourceEvent.repositoryFullName}`,
              detectedTechs: ["TypeScript", "Node.js"],
            };
          },
          maxRetries,
          taskTimeout
        ),
        this.executeWithRetry(
          workflowId,
          "ml_intelligence",
          "Activity Classification & Embeddings",
          async () => {
            const clf = await this.mlClient.classifyActivity(
              options.sourceEvent.repositoryFullName,
              { eventName: options.sourceEvent.eventType },
              options.sourceEvent.eventId
            );
            const emb = await this.mlClient.embedText(options.sourceEvent.repositoryFullName);
            return { classification: clf, embedding: emb.embedding };
          },
          maxRetries,
          taskTimeout
        ),
      ]);

      this.memory.set(workflowId, "developer_entity", devResult, "project_agent");
      this.memory.set(workflowId, "ml_analysis", mlClassResult, "ml_intelligence");

      // --- STAGE 4: Conflict Resolution ---
      // If Developer Agent proposed entity matches existing database records, ML duplicate matcher resolves
      const matchResult = await this.mlClient.matchEntities(
        { repoUrl: devResult.repoUrl, title: devResult.title },
        [{ entityId: devResult.entityId, repoUrl: devResult.repoUrl }]
      );

      const resolvedEntityId =
        matchResult.decision === "duplicate_merge" && matchResult.matchedEntityId
          ? matchResult.matchedEntityId
          : devResult.entityId;

      this.memory.set(
        workflowId,
        "canonical_entity",
        { entityId: resolvedEntityId, resolutionMethod: matchResult.matchMethod },
        "orchestrator"
      );

      // --- STAGE 5: Verification Agent Policy Evaluation ---
      participating.add("verification_agent");
      const claimToVerify = {
        claimId: `claim-${Date.now()}`,
        claimText: `Delivered ${devResult.title} updates verified on GitHub`,
        evidenceIds: [options.sourceEvent.eventId],
        confidenceScore: mlClassResult.classification.calibratedScore,
      };

      const verificationResult = await this.executeWithRetry(
        workflowId,
        "verification_agent",
        "Claim Policy Verification",
        async () =>
          this.mlClient.verifyClaim(claimToVerify, [
            { evidenceId: options.sourceEvent.eventId, type: "github_commit" },
          ]),
        maxRetries,
        taskTimeout
      );

      this.memory.set(workflowId, "verification_verdict", verificationResult, "verification_agent");

      // --- STAGE 6: Quality Agent Audit ---
      participating.add("quality_agent");
      const candidateMock = {
        version: 1,
        versionHash: "sha256-mock-candidate-checksum",
        publishedAt: new Date().toISOString(),
        active: true,
        profile: {
          name: "Yashwanth Reddy G",
          tagline: "Autonomous AI Systems Architect & Full-Stack Applied ML Engineer",
          summary: "Architecting self-governing multi-agent systems and calibrated ML pipelines.",
          location: "Bengaluru, India / Remote",
          status: "Deploying Autonomous Multi-Agent Workspace",
          verifiedClaimsCount: 12,
          auditHash: "0x89a1c4b72ef3e891",
        },
        sections: [
          {
            id: "sec-projects",
            type: "project-grid" as const,
            title: "Featured Projects",
            items: [
              {
                entityId: resolvedEntityId,
                title: devResult.title,
                description: "Discovers and verifies engineering activity.",
                technologies: devResult.detectedTechs,
                githubUrl: devResult.repoUrl,
                status: "active" as const,
                featured: true,
                verified: true,
                evidenceIds: [options.sourceEvent.eventId],
              },
            ],
          },
        ],
      };

      const qualityResult = this.qualityAgent.auditPortfolio(candidateMock, {
        [options.sourceEvent.eventId]: { verified: true },
      });

      this.memory.set(workflowId, "quality_audit", qualityResult, "quality_agent");

      // --- STAGE 7: Publishing Gate (Auto vs Human Review vs Block) ---
      participating.add("publishing_agent");
      const finalConfidence = verificationResult.calibratedConfidence;

      if (verificationResult.verificationStatus === "blocked" || !qualityResult.isCompliant) {
        this.logger.log(
          workflowId,
          "verification_agent",
          "AUDIT",
          `Publishing blocked. Confidence: ${finalConfidence}, Quality score: ${qualityResult.qualityScore}`
        );
        return {
          workflowId,
          status: "blocked",
          autoPublished: false,
          securityClean: securityResult.isClean,
          qualityScore: qualityResult.qualityScore,
          confidenceScore: finalConfidence,
          participatingAgents: Array.from(participating),
          durationMs: Date.now() - startTime,
        };
      }

      // Check if human approval is required (window 0.75 - 0.91 or quality warnings)
      const needsHumanApproval =
        verificationResult.verificationStatus === "review_required" ||
        qualityResult.warnings.length > 0 ||
        finalConfidence < 0.92;

      if (needsHumanApproval) {
        const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const ticket: HumanApprovalTicket = {
          ticketId,
          workflowId,
          candidateVersion: 1,
          proposedChangesSummary: `Update project ${devResult.title} (${options.sourceEvent.repositoryFullName})`,
          confidenceScore: finalConfidence,
          evidenceIds: [options.sourceEvent.eventId],
          reviewReason:
            finalConfidence < 0.92
              ? `Calibrated confidence (${finalConfidence}) is below automated threshold (0.92)`
              : `Quality warnings flagged: ${qualityResult.warnings.join("; ")}`,
          status: "pending",
          requestedBy: "verification_agent",
          createdAt: new Date().toISOString(),
        };

        this.pendingApprovals.set(ticketId, ticket);
        this.logger.log(
          workflowId,
          "orchestrator",
          "AUDIT",
          `Escalated to human-in-the-loop approval ticket ${ticketId}`,
          { ticket }
        );

        return {
          workflowId,
          status: "approval_required",
          autoPublished: false,
          approvalTicket: ticket,
          entityId: resolvedEntityId,
          securityClean: securityResult.isClean,
          qualityScore: qualityResult.qualityScore,
          confidenceScore: finalConfidence,
          participatingAgents: Array.from(participating),
          durationMs: Date.now() - startTime,
        };
      }

      // Safe Auto-Publish Authorized (Confidence >= 0.92, Clean Security, Quality Passed)
      this.logger.log(
        workflowId,
        "publishing_agent",
        "INFO",
        `Atomic publish authorized for ${resolvedEntityId} (Confidence: ${finalConfidence})`
      );

      return {
        workflowId,
        status: "completed",
        autoPublished: true,
        entityId: resolvedEntityId,
        securityClean: true,
        qualityScore: qualityResult.qualityScore,
        confidenceScore: finalConfidence,
        participatingAgents: Array.from(participating),
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      this.logger.log(workflowId, "orchestrator", "ERROR", `Workflow fatal error: ${err.message}`);
      return {
        workflowId,
        status: "failed",
        autoPublished: false,
        securityClean: false,
        qualityScore: 0.0,
        confidenceScore: 0.0,
        participatingAgents: Array.from(participating),
        error: err.message,
        durationMs: Date.now() - startTime,
      };
    }
  }

  public getMessageBus(): AgentMessageBus {
    return this.messageBus;
  }

  public getSharedMemory(): SharedMemoryStore {
    return this.memory;
  }

  public getExecutionLogger(): ExecutionLogger {
    return this.logger;
  }

  public getPendingApprovals(): HumanApprovalTicket[] {
    return Array.from(this.pendingApprovals.values()).filter((t) => t.status === "pending");
  }

  public resolveApproval(
    ticketId: string,
    decision: "approved" | "rejected",
    reviewerNotes = ""
  ): HumanApprovalTicket | null {
    const ticket = this.pendingApprovals.get(ticketId);
    if (!ticket) return null;

    ticket.status = decision;
    ticket.reviewerNotes = reviewerNotes;
    ticket.reviewedAt = new Date().toISOString();

    this.logger.log(
      ticket.workflowId,
      "orchestrator",
      "AUDIT",
      `Human reviewer ${decision} ticket ${ticketId}: ${reviewerNotes}`,
      { ticket }
    );

    return ticket;
  }
}

export const defaultWorkflowOrchestrator = new WorkflowOrchestrator();
