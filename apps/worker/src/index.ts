/**
 * @yashuverse/worker
 * GitHub Autonomous Discovery Engine & Background Worker
 */

import type { SourceEvent, NormalizedGitHubArtifact, IngestionJob } from "@yashuverse/contracts";
import { defaultJobProcessor } from "./job-processor.js";

export * from "./github-client.js";
export * from "./ml-client.js";
export * from "./job-processor.js";
export * from "./analyzers/repo-metadata.js";
export * from "./analyzers/readme-analyzer.js";
export * from "./analyzers/language-detector.js";
export * from "./analyzers/release-analyzer.js";

export async function processInboundSourceEvent(
  event: SourceEvent
): Promise<{ success: boolean; taskId: string; result?: NormalizedGitHubArtifact; error?: string }> {
  console.log(`[Worker] Received inbound source event: ${event.eventId} (${event.source})`);

  const repoFullName = (event.metadata?.repositoryFullName as string) || (event.metadata?.repo as string);
  if (!repoFullName) {
    return {
      success: false,
      taskId: `task-${Date.now()}`,
      error: "Missing repositoryFullName in source event metadata",
    };
  }

  const job: IngestionJob = {
    jobId: `job-${Date.now()}`,
    deliveryId: event.eventId,
    eventType: event.eventType,
    repositoryFullName: repoFullName,
    occurredAt: event.occurredAt,
    status: "processing",
    retryCount: 0,
  };

  try {
    const result = await defaultJobProcessor.processJob(job, event.metadata?.rawPayload);
    return {
      success: true,
      taskId: job.jobId,
      result,
    };
  } catch (err: any) {
    console.error(`[Worker] Failed processing job for ${repoFullName}:`, err);
    return {
      success: false,
      taskId: job.jobId,
      error: err.message,
    };
  }
}

console.log("[YASHUVERSE Worker] Initialized and listening for queued jobs.");
