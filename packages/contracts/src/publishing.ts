/**
 * @yashuverse/contracts - Publishing Engine & SEO Contracts
 * Typed interfaces for immutable portfolio versions, SEO structured data,
 * publishing audit records, and real-time failure/success notifications.
 */

import type { AgentId } from "./index.js";

export type PublishingTriggerType = "event_driven" | "scheduled" | "manual";
export type PublishingStatus = "success" | "skipped_duplicate" | "approval_required" | "rolled_back" | "rejected" | "failed";

export interface PortfolioVersionSnapshot<TContent = unknown> {
  version: number;
  versionHash: string;
  publishedAt: string;
  active: boolean;
  checksum: string; // SHA-256
  content: TContent;
  changelogSummary: string;
  publishedBy: AgentId;
  triggerType: PublishingTriggerType;
  approvalTicketId?: string;
  previousVersion?: number;
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: string;
  ogImage?: string;
  twitterCard: "summary" | "summary_large_image";
  keywords: string[];
  jsonLd: Record<string, unknown>; // Schema.org JSON-LD
}

export interface PublishingAuditRecord {
  auditId: string;
  versionNumber: number;
  previousVersion?: number;
  candidateChecksum: string;
  status: PublishingStatus;
  triggerType: PublishingTriggerType;
  policyCheckPassed: boolean;
  qualityScore: number;
  evidenceIds: string[];
  durationMs: number;
  errorMessage?: string;
  occurredAt: string;
}

export type NotificationType =
  | "PUBLISH_SUCCESS"
  | "PUBLISH_SKIPPED"
  | "APPROVAL_PENDING"
  | "ROLLBACK_SUCCESS"
  | "SECURITY_BLOCKED"
  | "PUBLISH_FAILED";

export interface NotificationEvent {
  notificationId: string;
  type: NotificationType;
  workflowId?: string;
  versionNumber?: number;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  metadata?: Record<string, unknown>;
  timestamp: string;
}
