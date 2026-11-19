import crypto from "crypto";
import type {
  PortfolioVersionSnapshot,
  PublishingAuditRecord,
  PublishingTriggerType,
  PublishingStatus,
  NotificationEvent,
} from "@yashuverse/contracts";
import type { PortfolioDocument } from "@yashuverse/portfolio-schema";
import { QualityAgent, defaultQualityAgent } from "../agents/quality-agent.js";
import { SeoGenerator, defaultSeoGenerator } from "./seo-generator.js";

export interface PublishOptions {
  triggerType?: PublishingTriggerType;
  publishedBy?: "publishing_agent" | "orchestrator";
  changelogSummary?: string;
  approvalTicketId?: string;
  forceConfidence?: number;
}

export interface PublishResult {
  success: boolean;
  status: PublishingStatus;
  versionNumber: number;
  previousVersion?: number;
  checksum: string;
  changelogSummary?: string;
  activePortfolio: PortfolioDocument;
  qualityScore: number;
  error?: string;
}

export class PublishingEngine {
  private versions: Map<number, PortfolioVersionSnapshot<PortfolioDocument>> = new Map();
  private auditLogs: PublishingAuditRecord[] = [];
  private notifications: NotificationEvent[] = [];
  private activeVersionNumber = 1;
  private qualityAgent: QualityAgent;
  private seoGenerator: SeoGenerator;

  constructor(
    initialDocument?: PortfolioDocument,
    qualityAgent: QualityAgent = defaultQualityAgent,
    seoGenerator: SeoGenerator = defaultSeoGenerator
  ) {
    this.qualityAgent = qualityAgent;
    this.seoGenerator = seoGenerator;

    if (initialDocument) {
      const checksum = this.computeChecksum(initialDocument);
      const initialSnapshot: PortfolioVersionSnapshot<PortfolioDocument> = {
        version: initialDocument.version || 1,
        versionHash: initialDocument.versionHash || checksum,
        publishedAt: initialDocument.publishedAt || new Date().toISOString(),
        active: true,
        checksum,
        content: initialDocument,
        changelogSummary: "Initial Seed Portfolio Baseline",
        publishedBy: "publishing_agent",
        triggerType: "manual",
      };
      this.versions.set(initialSnapshot.version, initialSnapshot);
      this.activeVersionNumber = initialSnapshot.version;
    }
  }

  /**
   * Deterministically calculates a SHA-256 content checksum of a portfolio document.
   */
  public computeChecksum(doc: PortfolioDocument): string {
    // Exclude dynamic volatile timestamps from checksum to prevent false drift
    const normalized = {
      profile: doc.profile,
      sections: doc.sections,
    };
    return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  }

  public getActiveVersion(): PortfolioVersionSnapshot<PortfolioDocument> | undefined {
    return this.versions.get(this.activeVersionNumber);
  }

  public getVersion(versionNumber: number): PortfolioVersionSnapshot<PortfolioDocument> | undefined {
    return this.versions.get(versionNumber);
  }

  public getAllVersions(): PortfolioVersionSnapshot<PortfolioDocument>[] {
    return Array.from(this.versions.values()).sort((a, b) => b.version - a.version);
  }

  public getAuditLogs(): PublishingAuditRecord[] {
    return this.auditLogs;
  }

  public getNotifications(): NotificationEvent[] {
    return this.notifications;
  }

  public getSeoGenerator(): SeoGenerator {
    return this.seoGenerator;
  }

  public getQualityAgent(): QualityAgent {
    return this.qualityAgent;
  }

  private emitNotification(notif: NotificationEvent) {
    this.notifications.push(notif);
  }

  /**
   * Stages and publishes an approved candidate portfolio version.
   */
  public async publishVersion(
    candidate: PortfolioDocument,
    options: PublishOptions = {}
  ): Promise<PublishResult> {
    const startTime = Date.now();
    const trigger = options.triggerType || "event_driven";
    const candidateChecksum = this.computeChecksum(candidate);
    const active = this.getActiveVersion();

    // 1. DUPLICATE CHECK: Prevent redundant publishing if content is identical
    if (active && active.checksum === candidateChecksum) {
      const auditEntry: PublishingAuditRecord = {
        auditId: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        versionNumber: active.version,
        previousVersion: active.version,
        candidateChecksum,
        status: "skipped_duplicate",
        triggerType: trigger,
        policyCheckPassed: true,
        qualityScore: 1.0,
        evidenceIds: [],
        durationMs: Date.now() - startTime,
        occurredAt: new Date().toISOString(),
      };
      this.auditLogs.push(auditEntry);
      this.emitNotification({
        notificationId: `notif-${Date.now()}`,
        type: "PUBLISH_SKIPPED",
        versionNumber: active.version,
        title: "Publish Skipped",
        message: `Content identical to active version v${active.version}. No increment needed.`,
        severity: "info",
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        status: "skipped_duplicate",
        versionNumber: active.version,
        checksum: candidateChecksum,
        activePortfolio: active.content,
        qualityScore: 1.0,
      };
    }

    // 2. QUALITY AGENT AUDIT
    const qualityResult = this.qualityAgent.auditPortfolio(candidate);
    if (!qualityResult.isCompliant || qualityResult.qualityScore < 0.85) {
      const auditEntry: PublishingAuditRecord = {
        auditId: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        versionNumber: candidate.version,
        previousVersion: active?.version,
        candidateChecksum,
        status: "rejected",
        triggerType: trigger,
        policyCheckPassed: false,
        qualityScore: qualityResult.qualityScore,
        evidenceIds: [],
        durationMs: Date.now() - startTime,
        errorMessage: qualityResult.errors.join("; "),
        occurredAt: new Date().toISOString(),
      };
      this.auditLogs.push(auditEntry);
      this.emitNotification({
        notificationId: `notif-${Date.now()}`,
        type: "PUBLISH_FAILED",
        title: "Quality Audit Rejected",
        message: `Quality audit failed with score ${qualityResult.qualityScore}: ${qualityResult.errors[0]}`,
        severity: "error",
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        status: "rejected",
        versionNumber: candidate.version,
        checksum: candidateChecksum,
        activePortfolio: active ? active.content : candidate,
        qualityScore: qualityResult.qualityScore,
        error: `Quality audit failed: ${qualityResult.errors.join("; ")}`,
      };
    }

    // 3. ATOMIC VERSION COMMIT
    const previousVersion = active?.version;
    const newVersionNumber = previousVersion ? previousVersion + 1 : candidate.version || 1;

    // Deactivate current version
    if (active) {
      active.active = false;
    }

    const changelog =
      options.changelogSummary ||
      `Updated portfolio with verified engineering artifacts (version v${newVersionNumber})`;

    candidate.version = newVersionNumber;
    candidate.versionHash = candidateChecksum;
    candidate.publishedAt = new Date().toISOString();
    candidate.active = true;

    const newSnapshot: PortfolioVersionSnapshot<PortfolioDocument> = {
      version: newVersionNumber,
      versionHash: candidateChecksum,
      publishedAt: candidate.publishedAt,
      active: true,
      checksum: candidateChecksum,
      content: candidate,
      changelogSummary: changelog,
      publishedBy: options.publishedBy || "publishing_agent",
      triggerType: trigger,
      approvalTicketId: options.approvalTicketId,
      previousVersion,
    };

    this.versions.set(newVersionNumber, newSnapshot);
    this.activeVersionNumber = newVersionNumber;

    // Record audit log
    const auditEntry: PublishingAuditRecord = {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: newVersionNumber,
      previousVersion,
      candidateChecksum,
      status: "success",
      triggerType: trigger,
      policyCheckPassed: true,
      qualityScore: qualityResult.qualityScore,
      evidenceIds: [],
      durationMs: Date.now() - startTime,
      occurredAt: new Date().toISOString(),
    };
    this.auditLogs.push(auditEntry);

    // Emit Notification
    this.emitNotification({
      notificationId: `notif-${Date.now()}`,
      type: "PUBLISH_SUCCESS",
      versionNumber: newVersionNumber,
      title: "Portfolio Published",
      message: `Atomically published version v${newVersionNumber}. Checksum: ${candidateChecksum.substring(0, 10)}...`,
      severity: "success",
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      status: "success",
      versionNumber: newVersionNumber,
      previousVersion,
      checksum: candidateChecksum,
      changelogSummary: changelog,
      activePortfolio: candidate,
      qualityScore: qualityResult.qualityScore,
    };
  }

  /**
   * Atomically rolls back the active portfolio pointer to a prior immutable version.
   */
  public async rollbackVersion(targetVersion: number): Promise<{
    success: boolean;
    previousVersion: number;
    activeVersion: number;
    activePortfolio?: PortfolioDocument;
    error?: string;
  }> {
    const targetSnapshot = this.versions.get(targetVersion);
    if (!targetSnapshot) {
      return {
        success: false,
        previousVersion: this.activeVersionNumber,
        activeVersion: this.activeVersionNumber,
        error: `Target version v${targetVersion} not found in immutable snapshot store`,
      };
    }

    const currentActive = this.getActiveVersion();
    const previousVersionNumber = this.activeVersionNumber;

    if (currentActive) {
      currentActive.active = false;
    }

    targetSnapshot.active = true;
    this.activeVersionNumber = targetVersion;

    // Record Rollback Audit
    const auditEntry: PublishingAuditRecord = {
      auditId: `audit-rollback-${Date.now()}`,
      versionNumber: targetVersion,
      previousVersion: previousVersionNumber,
      candidateChecksum: targetSnapshot.checksum,
      status: "rolled_back",
      triggerType: "manual",
      policyCheckPassed: true,
      qualityScore: 1.0,
      evidenceIds: [],
      durationMs: 5,
      occurredAt: new Date().toISOString(),
    };
    this.auditLogs.push(auditEntry);

    // Emit Notification
    this.emitNotification({
      notificationId: `notif-${Date.now()}`,
      type: "ROLLBACK_SUCCESS",
      versionNumber: targetVersion,
      title: "Portfolio Rollback Executed",
      message: `Active version successfully rolled back from v${previousVersionNumber} to v${targetVersion}.`,
      severity: "warning",
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      previousVersion: previousVersionNumber,
      activeVersion: targetVersion,
      activePortfolio: targetSnapshot.content,
    };
  }
}

export const defaultPublishingEngine = new PublishingEngine();
