/**
 * @yashuverse/contracts - GitHub Discovery Engine Types
 * Typed contracts for GitHub App events, webhook payloads, and extracted repository artifacts.
 */

export type GitHubWebhookEventType = "repository" | "push" | "release" | "ping";

export interface GitHubEventHeaders {
  deliveryId: string;
  eventName: GitHubWebhookEventType | string;
  signature: string;
}

export interface RepositoryMetadata {
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  topics: string[];
  license: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface ReadmeArtifact {
  rawContent: string;
  sanitizedSummary: string;
  headings: string[];
  technologiesDetected: string[];
  promptInjectionNeutralized: boolean;
  lengthBytes: number;
}

export interface LanguageBreakdown {
  languages: Record<string, { bytes: number; percentage: number }>;
  primaryLanguage: string;
  totalBytes: number;
}

export interface ReleaseArtifact {
  tagName: string;
  name: string | null;
  description: string | null;
  publishedAt: string;
  htmlUrl: string;
  author: string;
  assetCount: number;
}

export interface NormalizedGitHubArtifact {
  entityId: string;
  metadata: RepositoryMetadata;
  readme: ReadmeArtifact | null;
  languages: LanguageBreakdown;
  releases: ReleaseArtifact[];
  contentHash: string; // SHA-256
  collectedAt: string;
}

export type IngestionJobStatus = "queued" | "processing" | "completed" | "failed";

export interface IngestionJob {
  jobId: string;
  deliveryId: string;
  eventType: GitHubWebhookEventType | string;
  repositoryFullName: string;
  occurredAt: string;
  status: IngestionJobStatus;
  retryCount: number;
  result?: NormalizedGitHubArtifact;
  error?: string;
}
