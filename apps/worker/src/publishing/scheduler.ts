import { WorkflowOrchestrator, defaultWorkflowOrchestrator } from "../orchestration/workflow-orchestrator.js";
import { PublishingEngine, defaultPublishingEngine } from "./publishing-engine.js";
import { GitHubClient, defaultGitHubClient } from "../github-client.js";

export interface SyncSchedulerConfig {
  intervalMs?: number;
  monitoredRepositories?: string[];
  autoStart?: boolean;
}

export class PeriodicSyncScheduler {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number;
  private monitoredRepos: string[];
  private orchestrator: WorkflowOrchestrator;
  private publishingEngine: PublishingEngine;
  private githubClient: GitHubClient;
  private isSyncing = false;

  constructor(
    config: SyncSchedulerConfig = {},
    orchestrator: WorkflowOrchestrator = defaultWorkflowOrchestrator,
    publishingEngine: PublishingEngine = defaultPublishingEngine,
    githubClient: GitHubClient = defaultGitHubClient
  ) {
    this.intervalMs = config.intervalMs || 3600000; // default 1 hour
    this.monitoredRepos = config.monitoredRepositories || ["yashwanth4545/YASHUVERSE"];
    this.orchestrator = orchestrator;
    this.publishingEngine = publishingEngine;
    this.githubClient = githubClient;

    if (config.autoStart) {
      this.start();
    }
  }

  public start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.syncNow("scheduled").catch((err) => {
        console.error("[PeriodicSyncScheduler] Scheduled sync cycle error:", err);
      });
    }, this.intervalMs);
    console.log(`[PeriodicSyncScheduler] Started polling every ${this.intervalMs / 1000}s`);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("[PeriodicSyncScheduler] Polling stopped");
    }
  }

  public isRunning(): boolean {
    return this.timer !== null;
  }

  public getPublishingEngine(): PublishingEngine {
    return this.publishingEngine;
  }

  /**
   * Executes synchronization cycle across monitored repositories.
   */
  public async syncNow(trigger: "scheduled" | "manual" = "manual"): Promise<{
    syncedCount: number;
    results: any[];
  }> {
    if (this.isSyncing) {
      return { syncedCount: 0, results: [{ status: "skipped_busy" }] };
    }

    this.isSyncing = true;
    const results: any[] = [];

    try {
      for (const repoFullName of this.monitoredRepos) {
        try {
          const [owner, repo] = repoFullName.split("/");
          if (!owner || !repo) continue;

          const repoMetadata = await this.githubClient.getRepository(owner, repo);
          if (repoMetadata.private) {
            // Security check: Never sync private repos into public portfolio
            continue;
          }

          const wfResult = await this.orchestrator.runWorkflow({
            sourceEvent: {
              eventId: `sync-${trigger}-${Date.now()}`,
              source: "github",
              eventType: "push",
              repositoryFullName: repoFullName,
              rawPayload: { repository: repoMetadata },
            },
          });

          results.push(wfResult);
        } catch (err: any) {
          results.push({ repository: repoFullName, error: err.message });
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return {
      syncedCount: results.length,
      results,
    };
  }
}

export const defaultSyncScheduler = new PeriodicSyncScheduler();
