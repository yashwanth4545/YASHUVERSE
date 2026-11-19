/**
 * @yashuverse/contracts - Agent Communication & Shared Memory Contracts
 * Standardized contracts for agent-to-agent messaging, task delegation,
 * shared working memory blackboards, and human-in-the-loop review tickets.
 */

import type { AgentId } from "./index.js";

export type MessageAction =
  | "QUERY"
  | "DELEGATE_TASK"
  | "TASK_PROGRESS"
  | "TASK_RESULT"
  | "TASK_FAILED"
  | "AUDIT_REQUEST"
  | "AUDIT_VERDICT"
  | "CONFLICT_DETECTED"
  | "APPROVAL_REQUIRED";

export type MessageStatus = "sent" | "delivered" | "processed" | "rejected" | "timed_out";

export interface AgentMessage<T = unknown> {
  messageId: string;
  correlationId: string;
  workflowId: string;
  sender: AgentId;
  recipient: AgentId | "all";
  action: MessageAction;
  payload: T;
  status: MessageStatus;
  timestamp: string;
}

export interface TaskDelegation<TInput = unknown, TOutput = unknown> {
  taskId: string;
  workflowId: string;
  assignedAgent: AgentId;
  taskType: string;
  inputPayload: TInput;
  timeoutMs: number;
  maxRetries: number;
  retryCount: number;
  status: "queued" | "in_progress" | "completed" | "failed" | "timed_out";
  result?: TOutput;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkingMemoryEntry<T = unknown> {
  key: string;
  value: T;
  version: number;
  writtenBy: AgentId;
  evidenceIds: string[];
  updatedAt: string;
}

export interface SharedWorkingMemorySnapshot {
  workflowId: string;
  version: number;
  entries: Record<string, WorkingMemoryEntry>;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface HumanApprovalTicket {
  ticketId: string;
  workflowId: string;
  candidateVersion: number;
  proposedChangesSummary: string;
  confidenceScore: number;
  evidenceIds: string[];
  reviewReason: string;
  status: ApprovalStatus;
  requestedBy: AgentId;
  reviewerNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ExecutionLogEntry {
  logId: string;
  workflowId: string;
  agentId: AgentId;
  level: "INFO" | "WARN" | "ERROR" | "AUDIT";
  message: string;
  traceId: string;
  spanId: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}
